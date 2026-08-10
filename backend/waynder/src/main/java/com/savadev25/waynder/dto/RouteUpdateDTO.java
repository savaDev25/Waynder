package com.savadev25.waynder.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class RouteUpdateDTO {
    private String name;
    private UUID planId;
    private List<UUID> landmarkIds;
}