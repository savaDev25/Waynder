package com.savadev25.waynder.controller;

import com.savadev25.waynder.config.SecurityConfig;
import com.savadev25.waynder.dto.PlanCreateDTO;
import com.savadev25.waynder.dto.PlanResponseDTO;
import com.savadev25.waynder.exception.ResourceNotFoundException;
import com.savadev25.waynder.security.JwtService;
import com.savadev25.waynder.service.PlanService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.json.JsonMapper;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PlanController.class)
@Import(SecurityConfig.class)
class PlanControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JsonMapper jsonMapper;

    @MockitoBean
    private PlanService planService;

    // See UserControllerTest for why this is needed even unstubbed.
    @MockitoBean
    private JwtService jwtService;

    private UsernamePasswordAuthenticationToken authAs(UUID userId) {
        return new UsernamePasswordAuthenticationToken(userId.toString(), null, List.of());
    }

    @Test
    void create_returnsUnauthorized_whenNoAuth() throws Exception {
        UUID userId = UUID.randomUUID();
        PlanCreateDTO dto = new PlanCreateDTO();
        dto.setName("Trip");

        mockMvc.perform(post("/api/users/{userId}/plans", userId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(dto)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void create_returnsForbidden_whenAuthenticatedAsDifferentUser() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID someoneElse = UUID.randomUUID();
        PlanCreateDTO dto = new PlanCreateDTO();
        dto.setName("Trip");

        mockMvc.perform(post("/api/users/{userId}/plans", userId)
                        .with(authentication(authAs(someoneElse)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(dto)))
                .andExpect(status().isForbidden());
    }

    @Test
    void create_returnsCreated_withValidPayload() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID planId = UUID.randomUUID();

        PlanCreateDTO dto = new PlanCreateDTO();
        dto.setName("Weekend in Guadalajara");

        when(planService.create(eq(userId), any())).thenReturn(
                new PlanResponseDTO(planId, userId, "Weekend in Guadalajara", null, Instant.now())
        );

        mockMvc.perform(post("/api/users/{userId}/plans", userId)
                        .with(authentication(authAs(userId)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Weekend in Guadalajara"));
    }

    @Test
    void create_returnsBadRequest_whenNameMissing() throws Exception {
        UUID userId = UUID.randomUUID();
        PlanCreateDTO dto = new PlanCreateDTO();

        mockMvc.perform(post("/api/users/{userId}/plans", userId)
                        .with(authentication(authAs(userId)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void create_returnsNotFound_whenUserMissing() throws Exception {
        UUID userId = UUID.randomUUID();
        PlanCreateDTO dto = new PlanCreateDTO();
        dto.setName("Trip");

        when(planService.create(eq(userId), any()))
                .thenThrow(new ResourceNotFoundException("User not found: " + userId));

        mockMvc.perform(post("/api/users/{userId}/plans", userId)
                        .with(authentication(authAs(userId)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(dto)))
                .andExpect(status().isNotFound());
    }

    @Test
    void listByUser_returnsOk_whenAuthenticatedAsSelf() throws Exception {
        UUID userId = UUID.randomUUID();
        when(planService.listByUser(userId)).thenReturn(List.of());

        mockMvc.perform(get("/api/users/{userId}/plans", userId).with(authentication(authAs(userId))))
                .andExpect(status().isOk());
    }

    @Test
    void delete_returnsNoContent_whenAuthenticated() throws Exception {
        UUID id = UUID.randomUUID();
        UUID anyUser = UUID.randomUUID();

        mockMvc.perform(delete("/api/plans/{id}", id).with(authentication(authAs(anyUser))))
                .andExpect(status().isNoContent());
    }
}