package com.savadev25.waynder.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class RouteCreateDTO {

    @NotBlank
    private String name;

    private UUID planId; // optional -- matches nullable plan_id

    @NotEmpty
    private List<UUID> landmarkIds; // in the desired visiting order
}