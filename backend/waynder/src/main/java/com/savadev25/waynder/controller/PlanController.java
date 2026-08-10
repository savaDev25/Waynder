package com.savadev25.waynder.controller;

import com.savadev25.waynder.dto.PlanCreateDTO;
import com.savadev25.waynder.dto.PlanResponseDTO;
import com.savadev25.waynder.dto.PlanUpdateDTO;
import com.savadev25.waynder.service.PlanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class PlanController {

    private final PlanService planService;

    @PostMapping("/api/users/{userId}/plans")
    public ResponseEntity<PlanResponseDTO> create(@PathVariable UUID userId, @Valid @RequestBody PlanCreateDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(planService.create(userId, dto));
    }

    @GetMapping("/api/users/{userId}/plans")
    public ResponseEntity<List<PlanResponseDTO>> listByUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(planService.listByUser(userId));
    }

    @GetMapping("/api/plans/{id}")
    public ResponseEntity<PlanResponseDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(planService.getById(id));
    }

    @PutMapping("/api/plans/{id}")
    public ResponseEntity<PlanResponseDTO> update(@PathVariable UUID id, @Valid @RequestBody PlanUpdateDTO dto) {
        return ResponseEntity.ok(planService.update(id, dto));
    }

    @DeleteMapping("/api/plans/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        planService.delete(id);
        return ResponseEntity.noContent().build();
    }
}