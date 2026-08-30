package com.savadev25.waynder.service;

import java.util.Map;
import java.util.Set;

/**
 * Stage 1 recommendation logic: hand-encoded domain knowledge, not learned
 * from data -- there's no user behavior to learn from yet. This answers
 * "what pairs well with X" (complementary), which is a different question
 * than "what's similar to X" (KNN/K-Means answer the second one, not this).
 *
 * Once real Route/RouteLandmark data exists, Stage 2 replaces this with
 * actual co-occurrence counts across real routes (market-basket analysis) --
 * a Route is structurally a "basket," same as an e-commerce order.
 *
 * "restaurant" and "cafe" are included even though the current OSM connector
 * doesn't ingest them yet (it only pulls tourism/historic/leisure=park|garden)
 * -- they're here so the indie-landmark scraper (still on the roadmap) can
 * populate this data later without needing this matrix restructured.
 */
public final class TagAffinityMatrix {

    private static final Map<String, Set<String>> COMPLEMENTS = Map.of(
            "restaurant", Set.of("park", "viewpoint", "art", "historical", "nature", "museum"),
            "cafe", Set.of("park", "art", "museum", "viewpoint"),
            "museum", Set.of("art", "historical", "restaurant", "cafe"),
            "attraction", Set.of("restaurant", "art", "historical", "cafe"),
            "art", Set.of("museum", "historical", "attraction", "cafe"),
            "historical", Set.of("museum", "art", "restaurant"),
            "nature", Set.of("viewpoint", "restaurant"),
            "viewpoint", Set.of("nature", "restaurant", "cafe")
    );

    private TagAffinityMatrix() {}

    /** Tags that pair well with the given tag -- empty set if the tag is unknown. */
    public static Set<String> complementsOf(String tag) {
        return COMPLEMENTS.getOrDefault(tag.toLowerCase(), Set.of());
    }
}