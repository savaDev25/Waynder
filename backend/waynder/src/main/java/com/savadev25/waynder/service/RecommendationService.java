package com.savadev25.waynder.service;

import com.savadev25.waynder.dto.RecommendationResultDTO;
import com.savadev25.waynder.entity.Landmark;
import com.savadev25.waynder.entity.Tag;
import com.savadev25.waynder.repository.LandmarkRepository;
import com.savadev25.waynder.utils.DistanceUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

// Stage 1: rule-based complementary recommendations (see TagAffinityMatrix
// for why this isn't KNN/K-Means -- those answer "what's similar," this
// answers "what pairs well with what's already selected").
@Service
@RequiredArgsConstructor
public class RecommendationService {

    // Suggesting a second restaurant right after the first is exactly the
    // failure mode this whole approach exists to avoid.
    private static final double SAME_TAG_PENALTY = 2.0;
    private static final double COMPLEMENT_BONUS = 1.0;
    // Beyond this, a candidate's proximity contributes ~nothing to its score --
    // a complementary place on the other side of the metro area isn't useful
    // for "add this to today's plan," even if the tags pair perfectly.
    private static final double MAX_USEFUL_DISTANCE_KM = 15.0;

    private final LandmarkRepository landmarkRepository;

    public List<RecommendationResultDTO> recommend(List<UUID> selectedIds, int limit) {
        List<Landmark> selected = landmarkRepository.findAllById(selectedIds);
        if (selected.isEmpty()) {
            return List.of();
        }

        Set<String> selectedTags = selected.stream()
                .flatMap(l -> l.getTags().stream().map(Tag::getName))
                .collect(Collectors.toSet());

        Set<String> desiredComplements = selectedTags.stream()
                .flatMap(t -> TagAffinityMatrix.complementsOf(t).stream())
                .collect(Collectors.toSet());

        double centroidLat = selected.stream().mapToDouble(Landmark::getLat).average().orElse(0);
        double centroidLng = selected.stream().mapToDouble(Landmark::getLng).average().orElse(0);

        Set<UUID> excludeIds = selected.stream().map(Landmark::getId).collect(Collectors.toSet());

        return landmarkRepository.findAll().stream()
                .filter(l -> !excludeIds.contains(l.getId()))
                .map(l -> score(l, selectedTags, desiredComplements, centroidLat, centroidLng))
                .filter(scored -> scored.score() > 0)
                .sorted(Comparator.comparingDouble(ScoredLandmark::score).reversed())
                .limit(limit)
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private ScoredLandmark score(
            Landmark landmark,
            Set<String> selectedTags,
            Set<String> desiredComplements,
            double centroidLat,
            double centroidLng
    ) {
        Set<String> landmarkTags = landmark.getTags().stream().map(Tag::getName).collect(Collectors.toSet());

        double tagScore = 0;
        String matchedComplement = null;
        for (String tag : landmarkTags) {
            if (selectedTags.contains(tag)) {
                // Same category as something already picked -- e.g. a second
                // restaurant -- actively discouraged, not just unrewarded.
                tagScore -= SAME_TAG_PENALTY;
            }
            if (desiredComplements.contains(tag)) {
                tagScore += COMPLEMENT_BONUS;
                matchedComplement = tag;
            }
        }

        double distanceKm = DistanceUtil.haversineKm(centroidLat, centroidLng, landmark.getLat(), landmark.getLng());
        double proximityScore = Math.max(0, 1 - (distanceKm / MAX_USEFUL_DISTANCE_KM));

        return new ScoredLandmark(landmark, tagScore + proximityScore, matchedComplement, distanceKm);
    }

    private RecommendationResultDTO toDto(ScoredLandmark scored) {
        Landmark l = scored.landmark();
        String reason = scored.matchedComplement() != null
                ? "Pairs well with " + scored.matchedComplement()
                : "Nearby";

        return new RecommendationResultDTO(
                l.getId(), l.getName(), l.getDescription(), l.getAddress(), l.getLat(), l.getLng(),
                l.getImageUrl(), l.getTags().stream().map(Tag::getName).collect(Collectors.toList()),
                reason, Math.round(scored.distanceKm() * 10) / 10.0
        );
    }

    private record ScoredLandmark(Landmark landmark, double score, String matchedComplement, double distanceKm) {}
}