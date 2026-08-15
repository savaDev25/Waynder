package com.savadev25.waynder.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class LandmarkUpdateDTO {

    @Size(max = 200)
    private String name;

    @Size(max = 5000)
    private String description;

    @Size(max = 300)
    private String address;

    @DecimalMin(value = "-90.0")
    @DecimalMax(value = "90.0")
    private Double lat;

    @DecimalMin(value = "-180.0")
    @DecimalMax(value = "180.0")
    private Double lng;

    @Size(max = 300)
    private String imageUrl;

    @Size(max = 20, message = "A single landmark shouldn't need more than 20 tags")
    private List<@Size(max = 50) String> tags;
}