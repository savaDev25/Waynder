package com.savadev25.waynder.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "saved_landmarks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavedLandmark {

    @EmbeddedId
    private SavedLandmarkId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("landmarkId")
    @JoinColumn(name = "landmark_id")
    private Landmark landmark;

    @Column(name = "saved_at", nullable = false, updatable = false)
    private Instant savedAt;

    @PrePersist
    protected void onCreate() {
        savedAt = Instant.now();
    }
}