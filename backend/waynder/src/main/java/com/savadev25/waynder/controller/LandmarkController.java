package com.savadev25.waynder.controller;

import com.savadev25.waynder.dto.LandmarkCreateDTO;
import com.savadev25.waynder.dto.LandmarkResponseDTO;
import com.savadev25.waynder.dto.LandmarkUpdateDTO;
import com.savadev25.waynder.service.LandmarkService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

// Public browse/search + manual CRUD. Bulk scraper writes go through
// LandmarkIngestController's separate /api/landmarks/ingest endpoint instead.
@RestController
@RequestMapping("/api/landmarks")
@RequiredArgsConstructor
public class LandmarkController {

    private final LandmarkService landmarkService;

    @GetMapping
    public ResponseEntity<List<LandmarkResponseDTO>> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String tag
    ) {
        return ResponseEntity.ok(landmarkService.search(q, tag));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LandmarkResponseDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(landmarkService.getById(id));
    }

    @PostMapping
    public ResponseEntity<LandmarkResponseDTO> create(@Valid @RequestBody LandmarkCreateDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(landmarkService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LandmarkResponseDTO> update(@PathVariable UUID id, @Valid @RequestBody LandmarkUpdateDTO dto) {
        return ResponseEntity.ok(landmarkService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        landmarkService.delete(id);
        return ResponseEntity.noContent().build();
    }
}