package com.savadev25.waynder.controller;

import com.savadev25.waynder.config.SecurityConfig;
import com.savadev25.waynder.dto.RouteCreateDTO;
import com.savadev25.waynder.dto.RouteLandmarkResponseDTO;
import com.savadev25.waynder.dto.RouteResponseDTO;
import com.savadev25.waynder.exception.ResourceNotFoundException;
import com.savadev25.waynder.service.RouteService;
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

@WebMvcTest(RouteController.class)
@Import(SecurityConfig.class)
class RouteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JsonMapper jsonMapper;

    @MockitoBean
    private RouteService routeService;

    @Test
    void create_returnsCreated_withValidPayload() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID routeId = UUID.randomUUID();
        UUID landmarkId = UUID.randomUUID();

        RouteCreateDTO dto = new RouteCreateDTO();
        dto.setName("Centro Historico");
        dto.setLandmarkIds(List.of(landmarkId));

        RouteLandmarkResponseDTO landmark = new RouteLandmarkResponseDTO(landmarkId, "Templo Expiatorio", 20.6, -103.3, 0);
        when(routeService.create(eq(userId), any())).thenReturn(
                new RouteResponseDTO(routeId, userId, null, "Centro Historico", List.of(landmark), Instant.now())
        );

        mockMvc.perform(post("/api/users/{userId}/routes", userId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.landmarks[0].orderIndex").value(0));
    }

    @Test
    void create_returnsBadRequest_whenLandmarkIdsEmpty() throws Exception {
        UUID userId = UUID.randomUUID();
        RouteCreateDTO dto = new RouteCreateDTO();
        dto.setName("Empty Route");
        dto.setLandmarkIds(List.of());

        mockMvc.perform(post("/api/users/{userId}/routes", userId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void create_returnsNotFound_whenLandmarkMissing() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID missingLandmark = UUID.randomUUID();

        RouteCreateDTO dto = new RouteCreateDTO();
        dto.setName("Broken Route");
        dto.setLandmarkIds(List.of(missingLandmark));

        when(routeService.create(eq(userId), any()))
                .thenThrow(new ResourceNotFoundException("Landmark not found: " + missingLandmark));

        mockMvc.perform(post("/api/users/{userId}/routes", userId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(dto)))
                .andExpect(status().isNotFound());
    }

    @Test
    void getById_returnsNotFound_whenMissing() throws Exception {
        UUID id = UUID.randomUUID();
        when(routeService.getById(id)).thenThrow(new ResourceNotFoundException("Route not found: " + id));

        mockMvc.perform(get("/api/routes/{id}", id))
                .andExpect(status().isNotFound());
    }

    @Test
    void delete_returnsNoContent() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(delete("/api/routes/{id}", id))
                .andExpect(status().isNoContent());
    }
}