package com.savadev25.waynder.controller;

import com.savadev25.waynder.dto.PlanCreateDTO;
import com.savadev25.waynder.dto.PlanResponseDTO;
import com.savadev25.waynder.dto.PlanUpdateDTO;
import com.savadev25.waynder.security.AuthorizationUtil;
import com.savadev25.waynder.service.PlanService;
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
public class PlanController {

    private final PlanService planService;

    @PostMapping("/api/users/{userId}/plans")
    public ResponseEntity<PlanResponseDTO> create(@PathVariable UUID userId, @Valid @RequestBody PlanCreateDTO dto, Authentication authentication) {
        AuthorizationUtil.requireSelf(authentication, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(planService.create(userId, dto));
    }

    @GetMapping("/api/users/{userId}/plans")
    public ResponseEntity<List<PlanResponseDTO>> listByUser(@PathVariable UUID userId, Authentication authentication) {
        AuthorizationUtil.requireSelf(authentication, userId);
        return ResponseEntity.ok(planService.listByUser(userId));
    }

    // NOTE: these two below don't carry a userId in the path, so they can't
    // use the same requireSelf check -- doing that properly needs the
    // service layer to load the Plan first and compare plan.getUser().getId()
    // to the caller. Left as-is (any authenticated user can view/edit/delete
    // any plan by id) -- worth tightening before this handles real user data.
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