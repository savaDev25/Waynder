package com.savadev25.waynder.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class RouteResponseDTO {
    private UUID id;
    private UUID userId;
    private UUID planId;
    private String name;
    private List<RouteLandmarkResponseDTO> landmarks;
    private Instant createdAt;
}