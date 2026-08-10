package com.savadev25.waynder.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class LandmarkUpdateDTO {
    private String name;
    private String description;
    private String address;
    private Double lat;
    private Double lng;
    private String imageUrl;
    private List<String> tags;
}