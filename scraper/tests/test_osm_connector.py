"""
Tests for the OSM Overpass connector.

Run with:
    cd scraper
    pip install pytest requests-mock
    pytest tests/test_osm_connector.py -v
"""

import sys
from pathlib import Path

import pytest
import requests_mock

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from connectors.osm_connector import (
    build_address,
    derive_tags,
    normalize_element,
    fetch_osm_landmarks,
    post_batch,
    OVERPASS_URL,
)


class TestBuildAddress:
    def test_returns_none_when_no_address_tags(self):
        assert build_address({}) is None

    def test_combines_street_number_and_city(self):
        tags = {
            "addr:street": "Calzada del Federalismo Sur",
            "addr:housenumber": "328",
            "addr:city": "Guadalajara",
        }
        assert build_address(tags) == "Calzada del Federalismo Sur 328, Guadalajara"

    def test_handles_street_without_housenumber(self):
        tags = {"addr:street": "Av. Chapultepec", "addr:city": "Guadalajara"}
        assert build_address(tags) == "Av. Chapultepec, Guadalajara"

    def test_handles_city_only(self):
        assert build_address({"addr:city": "Zapopan"}) == "Zapopan"


class TestDeriveTags:
    def test_maps_tourism_museum(self):
        assert derive_tags({"tourism": "museum"}) == ["museum"]

    def test_maps_leisure_park_to_nature(self):
        assert derive_tags({"leisure": "park"}) == ["nature"]

    def test_adds_historical_when_historic_tag_present(self):
        assert derive_tags({"historic": "monument"}) == ["historical"]

    def test_combines_multiple_categories_without_duplicates(self):
        tags = {"tourism": "museum", "historic": "yes"}
        assert derive_tags(tags) == ["historical", "museum"]

    def test_ignores_unmapped_tourism_values(self):
        assert derive_tags({"tourism": "hotel"}) == []

    def test_returns_empty_list_for_no_relevant_tags(self):
        assert derive_tags({"shop": "bakery"}) == []


class TestNormalizeElement:
    def test_returns_none_when_unnamed(self):
        element = {"type": "node", "id": 1, "lat": 20.6, "lon": -103.3, "tags": {}}
        assert normalize_element(element) is None

    def test_normalizes_node_using_direct_lat_lon(self):
        element = {
            "type": "node",
            "id": 123456789,
            "lat": 20.6712,
            "lon": -103.3617,
            "tags": {"name": "Templo Expiatorio", "tourism": "attraction"},
        }

        result = normalize_element(element)

        assert result["name"] == "Templo Expiatorio"
        assert result["lat"] == 20.6712
        assert result["lng"] == -103.3617
        assert result["source"] == "osm"
        assert result["externalId"] == "node/123456789"
        assert result["tags"] == ["attraction"]

    def test_normalizes_way_using_center(self):
        element = {
            "type": "way",
            "id": 987654321,
            "center": {"lat": 20.5, "lon": -103.4},
            "tags": {"name": "Bosque Los Colomos", "leisure": "park"},
        }

        result = normalize_element(element)

        assert result["lat"] == 20.5
        assert result["lng"] == -103.4
        assert result["externalId"] == "way/987654321"

    def test_returns_none_for_way_without_center(self):
        element = {"type": "way", "id": 1, "tags": {"name": "Something"}}
        assert normalize_element(element) is None

    def test_includes_address_when_present(self):
        element = {
            "type": "node",
            "id": 1,
            "lat": 20.0,
            "lon": -103.0,
            "tags": {
                "name": "Local Museum",
                "addr:street": "Av. Alcalde",
                "addr:housenumber": "10",
            },
        }
        result = normalize_element(element)
        assert result["address"] == "Av. Alcalde 10"


class TestFetchOsmLandmarks:
    def test_fetches_and_filters_unnamed_elements(self):
        fake_response = {
            "elements": [
                {
                    "type": "node",
                    "id": 1,
                    "lat": 20.6,
                    "lon": -103.3,
                    "tags": {"name": "Named Place", "tourism": "museum"},
                },
                {
                    "type": "node",
                    "id": 2,
                    "lat": 20.7,
                    "lon": -103.4,
                    "tags": {},  # no name -> should be filtered out
                },
            ]
        }

        with requests_mock.Mocker() as m:
            m.post(OVERPASS_URL, json=fake_response)
            landmarks = fetch_osm_landmarks()

        assert len(landmarks) == 1
        assert landmarks[0]["name"] == "Named Place"

    def test_raises_on_http_error(self):
        with requests_mock.Mocker() as m:
            m.post(OVERPASS_URL, status_code=500)
            with pytest.raises(Exception):
                fetch_osm_landmarks()


class TestPostBatch:
    def test_sends_api_key_header_and_payload(self):
        ingest_url = "http://localhost:8080/api/landmarks/ingest"
        batch = [{"name": "Test Landmark", "source": "osm", "externalId": "node/1"}]

        with requests_mock.Mocker() as m:
            m.post(ingest_url, json={"created": 1, "updated": 0})
            post_batch(batch, ingest_url, "test-secret-key")

            sent_request = m.request_history[0]
            assert sent_request.headers["X-Ingest-Key"] == "test-secret-key"
            assert sent_request.json() == batch

    def test_raises_on_http_error(self):
        ingest_url = "http://localhost:8080/api/landmarks/ingest"

        with requests_mock.Mocker() as m:
            m.post(ingest_url, status_code=401)
            with pytest.raises(Exception):
                post_batch([], ingest_url, "wrong-key")