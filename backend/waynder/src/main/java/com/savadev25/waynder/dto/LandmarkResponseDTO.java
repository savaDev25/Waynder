package com.savadev25.waynder.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class LandmarkResponseDTO {
    private UUID id;
    private String name;
    private String description;
    private String address;
    private Double lat;
    private Double lng;
    private String imageUrl;
    private Integer popularityScore;
    private List<String> tags;
}