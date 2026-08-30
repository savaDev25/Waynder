package com.savadev25.waynder.controller;

import com.savadev25.waynder.dto.RecommendationResultDTO;
import com.savadev25.waynder.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    @GetMapping("/landmarks")
    public ResponseEntity<List<RecommendationResultDTO>> recommendLandmarks(
            @RequestParam List<UUID> basedOn,
            @RequestParam(defaultValue = "5") int limit
    ) {
        return ResponseEntity.ok(recommendationService.recommend(basedOn, limit));
    }
}