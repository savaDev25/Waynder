package com.savadev25.waynder.controller;

import com.savadev25.waynder.dto.RouteCreateDTO;
import com.savadev25.waynder.dto.RouteResponseDTO;
import com.savadev25.waynder.dto.RouteUpdateDTO;
import com.savadev25.waynder.service.RouteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class RouteController {

    private final RouteService routeService;

    @PostMapping("/api/users/{userId}/routes")
    public ResponseEntity<RouteResponseDTO> create(@PathVariable UUID userId, @Valid @RequestBody RouteCreateDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(routeService.create(userId, dto));
    }

    @GetMapping("/api/users/{userId}/routes")
    public ResponseEntity<List<RouteResponseDTO>> listByUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(routeService.listByUser(userId));
    }

    @GetMapping("/api/routes/{id}")
    public ResponseEntity<RouteResponseDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(routeService.getById(id));
    }

    @PutMapping("/api/routes/{id}")
    public ResponseEntity<RouteResponseDTO> update(@PathVariable UUID id, @Valid @RequestBody RouteUpdateDTO dto) {
        return ResponseEntity.ok(routeService.update(id, dto));
    }

    @DeleteMapping("/api/routes/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        routeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}