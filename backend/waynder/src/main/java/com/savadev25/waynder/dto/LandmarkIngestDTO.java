package com.savadev25.waynder.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LandmarkIngestDTO {

    @NotBlank
    @Size(max = 200)
    private String name;

    // Column is TEXT (unbounded in the DB), but an ingest payload with a
    // multi-megabyte "description" is either garbage data or an attempted
    // resource-exhaustion attack -- cap it at something a real description
    // would never exceed.
    @Size(max = 5000)
    private String description;

    // Display-only, never used for routing/proximity computation
    @Size(max = 300)
    private String address;

    @NotNull
    @DecimalMin(value = "-90.0")
    @DecimalMax(value = "90.0")
    private Double lat;

    @NotNull
    @DecimalMin(value = "-180.0")
    @DecimalMax(value = "180.0")
    private Double lng;

    // Allowlist instead of free text -- rejects anything that isn't one of
    // the sources this pipeline actually knows how to handle.
    @NotBlank
    @Pattern(regexp = "osm|foursquare|scraped|manual")
    private String source;

    // Unique per source -- used together with `source` to upsert instead of duplicate
    @NotBlank
    @Size(max = 150)
    private String externalId;

    @Size(max = 300)
    private String imageUrl;

    @Size(max = 20, message = "A single landmark shouldn't need more than 20 tags")
    private List<@Size(max = 50) String> tags;
}