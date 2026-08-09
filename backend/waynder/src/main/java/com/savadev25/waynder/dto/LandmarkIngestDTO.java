package com.savadev25.waynder.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
    private String name;

    private String description;

    // Display-only, never used for routing/proximity computation
    private String address;

    @NotNull
    private Double lat;

    @NotNull
    private Double lng;

    // 'osm' | 'foursquare' | 'scraped' | 'manual'
    @NotBlank
    private String source;

    // Unique per source — used together with `source` to upsert instead of duplicate
    @NotBlank
    private String externalId;

    private String imageUrl;

    private List<String> tags;
}