package com.savadev25.waynder.entity;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;
import java.util.UUID;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class RouteLandmarkId implements Serializable {
    private UUID routeId;
    private UUID landmarkId;
}