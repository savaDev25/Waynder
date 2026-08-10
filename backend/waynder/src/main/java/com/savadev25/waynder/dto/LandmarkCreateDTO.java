package com.savadev25.waynder.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

// For manually adding a single landmark through the app (source="manual"),
// as opposed to LandmarkIngestDTO which is for bulk scraper/connector writes.
@Getter
@Setter
public class LandmarkCreateDTO {

    @NotBlank
    private String name;

    private String description;
    private String address;

    @NotNull
    private Double lat;

    @NotNull
    private Double lng;

    private String imageUrl;
    private List<String> tags;
}