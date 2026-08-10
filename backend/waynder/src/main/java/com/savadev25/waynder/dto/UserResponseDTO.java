package com.savadev25.waynder.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

// Deliberately excludes passwordHash -- this is what the API ever returns.
@Getter
@AllArgsConstructor
public class UserResponseDTO {
    private UUID id;
    private String name;
    private String email;
    private Instant createdAt;
}