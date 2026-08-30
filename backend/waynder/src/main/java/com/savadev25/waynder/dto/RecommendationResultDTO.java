package com.savadev25.waynder.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class RecommendationResultDTO {
    private UUID id;
    private String name;
    private String description;
    private String address;
    private Double lat;
    private Double lng;
    private String imageUrl;
    private List<String> tags;
    private String reason;       // e.g. "Pairs well with museum" or "Nearby"
    private Double distanceKm;   // from the centroid of the selected landmarks
}