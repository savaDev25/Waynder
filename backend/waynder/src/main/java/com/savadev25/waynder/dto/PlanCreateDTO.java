package com.savadev25.waynder.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PlanCreateDTO {
    @NotBlank
    private String name;
    private String description;
}