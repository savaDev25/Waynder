package com.savadev25.waynder.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.UUID;

@Getter
@AllArgsConstructor
public class RouteLandmarkResponseDTO {
    private UUID landmarkId;
    private String name;
    private Double lat;
    private Double lng;
    private Integer orderIndex;
}