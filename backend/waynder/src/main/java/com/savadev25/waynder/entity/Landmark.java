package com.savadev25.waynder.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "landmarks", uniqueConstraints = @UniqueConstraint(columnNames = {"source", "external_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Landmark {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    // Display-only. Never used for routing or proximity math — lat/lng is the source of truth.
    @Column(length = 300)
    private String address;

    @Column(nullable = false)
    private Double lat;

    @Column(nullable = false)
    private Double lng;

    // Note: the `location` geography column is DB-managed (trigger keeps it synced
    // from lat/lng) and intentionally not mapped here — the app only ever reads/writes lat/lng.

    // 'osm' | 'foursquare' | 'scraped' | 'manual'
    @Column(nullable = false, length = 50)
    private String source;

    @Column(name = "external_id", length = 150)
    private String externalId;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "popularity_score", nullable = false)
    @Builder.Default
    private Integer popularityScore = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @ManyToMany
    @JoinTable(
        name = "landmark_tags",
        joinColumns = @JoinColumn(name = "landmark_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    @Builder.Default
    private Set<Tag> tags = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }
}