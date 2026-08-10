package com.savadev25.waynder.controller;

import com.savadev25.waynder.config.SecurityConfig;
import com.savadev25.waynder.dto.PlanCreateDTO;
import com.savadev25.waynder.dto.PlanResponseDTO;
import com.savadev25.waynder.exception.ResourceNotFoundException;
import com.savadev25.waynder.service.PlanService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.json.JsonMapper;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
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
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(dto)))
                .andExpect(status().isNotFound());
    }

    @Test
    void listByUser_returnsOk() throws Exception {
        UUID userId = UUID.randomUUID();
        when(planService.listByUser(userId)).thenReturn(List.of());

        mockMvc.perform(get("/api/users/{userId}/plans", userId))
                .andExpect(status().isOk());
    }

    @Test
    void delete_returnsNoContent() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(delete("/api/plans/{id}", id))
                .andExpect(status().isNoContent());
    }
}