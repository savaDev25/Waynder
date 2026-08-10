package com.savadev25.waynder.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class PlanResponseDTO {
    private UUID id;
    private UUID userId;
    private String name;
    private String description;
    private Instant createdAt;
}