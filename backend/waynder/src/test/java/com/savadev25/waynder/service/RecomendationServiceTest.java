package com.savadev25.waynder.service;

import com.savadev25.waynder.entity.Landmark;
import com.savadev25.waynder.entity.Tag;
import com.savadev25.waynder.repository.LandmarkRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RecommendationServiceTest {

    @Mock
    private LandmarkRepository landmarkRepository;

    @InjectMocks
    private RecommendationService recommendationService;

    private Landmark landmark(String name, double lat, double lng, String... tags) {
        Set<Tag> tagSet = new HashSet<>();
        for (String t : tags) {
            tagSet.add(Tag.builder().name(t).build());
        }
        return Landmark.builder()
                .id(UUID.randomUUID())
                .name(name)
                .lat(lat)
                .lng(lng)
                .tags(tagSet)
                .build();
    }

    @Test
    void recommend_returnsEmpty_whenNoLandmarksSelected() {
        List<com.savadev25.waynder.dto.RecommendationResultDTO> result =
                recommendationService.recommend(List.of(), 5);

        assertThat(result).isEmpty();
    }

    @Test
    void recommend_prefersComplementaryTag_overSameTag() {
        Landmark selectedRestaurant = landmark("Birrieria", 20.66, -103.35, "restaurant");
        Landmark anotherRestaurant = landmark("Taqueria", 20.661, -103.351, "restaurant");
        Landmark aPark = landmark("Bosque Colomos", 20.662, -103.352, "nature");

        when(landmarkRepository.findAllById(List.of(selectedRestaurant.getId())))
                .thenReturn(List.of(selectedRestaurant));
        when(landmarkRepository.findAll())
                .thenReturn(List.of(anotherRestaurant, aPark));

        List<com.savadev25.waynder.dto.RecommendationResultDTO> result =
                recommendationService.recommend(List.of(selectedRestaurant.getId()), 5);

        // The park (complementary: restaurant -> nature) should outrank or
        // entirely exclude the second restaurant (same-tag penalty).
        assertThat(result).extracting("name").doesNotContain("Taqueria");
        assertThat(result).extracting("name").contains("Bosque Colomos");
    }

    @Test
    void recommend_excludesAlreadySelectedLandmarks() {
        Landmark selected = landmark("Templo Expiatorio", 20.67, -103.36, "historical");

        when(landmarkRepository.findAllById(List.of(selected.getId())))
                .thenReturn(List.of(selected));
        when(landmarkRepository.findAll())
                .thenReturn(List.of(selected)); // only candidate is itself

        List<com.savadev25.waynder.dto.RecommendationResultDTO> result =
                recommendationService.recommend(List.of(selected.getId()), 5);

        assertThat(result).isEmpty();
    }

    @Test
    void recommend_excludesCandidatesTooFarAway() {
        Landmark selected = landmark("Centro", 20.6597, -103.3496, "historical");
        // Far outside MAX_USEFUL_DISTANCE_KM (15km) and shares no complementary tag
        Landmark farAway = landmark("Puerto Vallarta Beach", 20.6, -105.2, "nature");

        when(landmarkRepository.findAllById(List.of(selected.getId())))
                .thenReturn(List.of(selected));
        when(landmarkRepository.findAll())
                .thenReturn(List.of(farAway));

        List<com.savadev25.waynder.dto.RecommendationResultDTO> result =
                recommendationService.recommend(List.of(selected.getId()), 5);

        assertThat(result).isEmpty();
    }

    @Test
    void recommend_includesReasonExplainingTheMatch() {
        Landmark selectedMuseum = landmark("Museo Regional", 20.67, -103.35, "museum");
        Landmark nearbyArt = landmark("Galeria de Arte", 20.671, -103.351, "art");

        when(landmarkRepository.findAllById(List.of(selectedMuseum.getId())))
                .thenReturn(List.of(selectedMuseum));
        when(landmarkRepository.findAll())
                .thenReturn(List.of(nearbyArt));

        List<com.savadev25.waynder.dto.RecommendationResultDTO> result =
                recommendationService.recommend(List.of(selectedMuseum.getId()), 5);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getReason()).isEqualTo("Pairs well with art");
    }
}