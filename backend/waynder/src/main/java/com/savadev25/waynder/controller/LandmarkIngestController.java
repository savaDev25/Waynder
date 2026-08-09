package com.savadev25.waynder.controller;

import com.savadev25.waynder.dto.LandmarkIngestDTO;
import com.savadev25.waynder.service.LandmarkIngestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/landmarks")
@RequiredArgsConstructor
public class LandmarkIngestController {

    private final LandmarkIngestService landmarkIngestService;

    // Called by scraper connectors only (OSM, Foursquare, indie scraper later),
    // never by frontend/end users. Protected by IngestApiKeyFilter.
    @PostMapping("/ingest")
    public ResponseEntity<LandmarkIngestService.IngestResult> ingest(
            @Valid @RequestBody List<LandmarkIngestDTO> items
    ) {
        LandmarkIngestService.IngestResult result = landmarkIngestService.ingest(items);
        return ResponseEntity.ok(result);
    }
}