"""
OSM Overpass connector.

Fetches tourism/historic points of interest inside the ZMG (Guadalajara metro)
bounding box from the Overpass API, normalizes them into Waynder's uniform
landmark shape, and posts them in batches to the backend ingest endpoint.

This is a plain script rather than a Scrapy spider because Overpass is a
structured query API, not HTML to crawl -- Scrapy is reserved for the indie
landmark scraper later, which needs real crawling/parsing.

Usage:
    python osm_connector.py
"""

import os
import time
import requests

OVERPASS_URL = "https://overpass-api.de/api/interpreter"

# overpass-api.de rejects requests with no/generic User-Agent as an anti-bot
# measure (returns 406 Not Acceptable). A descriptive agent with contact
# info is what the server actually wants -- swap in your real email.
OVERPASS_HEADERS = {
    "User-Agent": "WaynderScraper/1.0 (student portfolio project; contact: saul05201655@gmail.com)",
    "Accept": "application/json",
}

BBOX = "20.55,-103.50,20.80,-103.20"

OVERPASS_QUERY = """
[out:json][timeout:60];
(
  node["tourism"~"attraction|museum|artwork|viewpoint|gallery"](%(bbox)s);
  way["tourism"~"attraction|museum|artwork|viewpoint|gallery"](%(bbox)s);
  node["historic"](%(bbox)s);
  way["historic"](%(bbox)s);
  node["leisure"~"park|garden"](%(bbox)s);
  way["leisure"~"park|garden"](%(bbox)s);
);
out center tags;
""" % {"bbox": BBOX}

TAG_MAPPING = {
    "tourism=museum": "museum",
    "tourism=attraction": "attraction",
    "tourism=artwork": "art",
    "tourism=viewpoint": "viewpoint",
    "tourism=gallery": "art",
    "leisure=park": "nature",
    "leisure=garden": "nature",
}

BATCH_SIZE = 50


def build_address(tags):
    street = tags.get("addr:street")
    number = tags.get("addr:housenumber")
    city = tags.get("addr:city")

    parts = []
    if street:
        parts.append(("%s %s" % (street, number)).strip() if number else street)
    if city:
        parts.append(city)

    return ", ".join(parts) if parts else None


def derive_tags(osm_tags):
    derived = set()
    for key in ("tourism", "leisure"):
        if key in osm_tags:
            mapped = TAG_MAPPING.get("%s=%s" % (key, osm_tags[key]))
            if mapped:
                derived.add(mapped)
    if "historic" in osm_tags:
        derived.add("historical")
    return sorted(derived)


def normalize_element(element):
    tags = element.get("tags", {})
    name = tags.get("name")
    if not name:
        return None

    if element["type"] == "node":
        lat, lng = element["lat"], element["lon"]
    else:
        center = element.get("center")
        if not center:
            return None
        lat, lng = center["lat"], center["lon"]

    return {
        "name": name,
        "description": tags.get("description"),
        "address": build_address(tags),
        "lat": lat,
        "lng": lng,
        "source": "osm",
        "externalId": "%s/%s" % (element["type"], element["id"]),
        "tags": derive_tags(tags),
    }


def fetch_osm_landmarks():
    response = requests.post(
        OVERPASS_URL, data={"data": OVERPASS_QUERY}, headers=OVERPASS_HEADERS, timeout=90
    )
    response.raise_for_status()
    elements = response.json().get("elements", [])

    normalized = [normalize_element(e) for e in elements]
    return [item for item in normalized if item is not None]


def post_batch(batch, ingest_url, api_key):
    response = requests.post(
        ingest_url,
        json=batch,
        headers={"X-Ingest-Key": api_key},
        timeout=30,
    )
    response.raise_for_status()
    result = response.json()
    print("  -> created=%s updated=%s" % (result.get("created"), result.get("updated")))


def main():
    ingest_url = os.environ["BACKEND_INGEST_URL"]
    api_key = os.environ["INGEST_API_KEY"]

    print("Fetching landmarks from Overpass API...")
    landmarks = fetch_osm_landmarks()
    print("Fetched %d named landmarks in ZMG bounding box." % len(landmarks))

    for i in range(0, len(landmarks), BATCH_SIZE):
        batch = landmarks[i:i + BATCH_SIZE]
        print("Posting batch %d (%d items)..." % (i // BATCH_SIZE + 1, len(batch)))
        post_batch(batch, ingest_url, api_key)
        time.sleep(0.5)

    print("Done.")


if __name__ == "__main__":
    main()