package com.savadev25.waynder.controller;

import com.savadev25.waynder.dto.RouteCreateDTO;
import com.savadev25.waynder.dto.RouteResponseDTO;
import com.savadev25.waynder.dto.RouteUpdateDTO;
import com.savadev25.waynder.security.AuthorizationUtil;
import com.savadev25.waynder.service.RouteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class RouteController {

    private final RouteService routeService;

    @PostMapping("/api/users/{userId}/routes")
    public ResponseEntity<RouteResponseDTO> create(@PathVariable UUID userId, @Valid @RequestBody RouteCreateDTO dto, Authentication authentication) {
        AuthorizationUtil.requireSelf(authentication, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(routeService.create(userId, dto));
    }

    @GetMapping("/api/users/{userId}/routes")
    public ResponseEntity<List<RouteResponseDTO>> listByUser(@PathVariable UUID userId, Authentication authentication) {
        AuthorizationUtil.requireSelf(authentication, userId);
        return ResponseEntity.ok(routeService.listByUser(userId));
    }

    // Public browse/discovery -- e.g. a "tourism routes" page. Not scoped
    // to a user, distinct from listByUser above -- deliberately left open
    // in SecurityConfig (no auth needed to browse).
    @GetMapping("/api/routes")
    public ResponseEntity<List<RouteResponseDTO>> listAll() {
        return ResponseEntity.ok(routeService.listAll());
    }

    // NOTE: same gap as PlanController's by-id endpoints -- no userId in
    // the path here, so ownership isn't enforced yet. Any authenticated
    // user can currently update/delete any route by id.
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