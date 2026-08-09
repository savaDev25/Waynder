package com.savadev25.waynder.entity;


import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "route_landmarks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RouteLandmark {

    @EmbeddedId
    private RouteLandmarkId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("routeId")
    @JoinColumn(name = "route_id")
    private Route route;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("landmarkId")
    @JoinColumn(name = "landmark_id")
    private Landmark landmark;

    // Position of this landmark within the route's optimized sequence
    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;
}