package com.savadev25.waynder.controller;

import com.savadev25.waynder.config.SecurityConfig;
import com.savadev25.waynder.dto.LandmarkCreateDTO;
import com.savadev25.waynder.dto.LandmarkResponseDTO;
import com.savadev25.waynder.exception.ResourceNotFoundException;
import com.savadev25.waynder.service.LandmarkService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.json.JsonMapper;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(LandmarkController.class)
@Import(SecurityConfig.class)
class LandmarkControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JsonMapper jsonMapper;

    @MockitoBean
    private LandmarkService landmarkService;

    private LandmarkCreateDTO validCreateDto() {
        LandmarkCreateDTO dto = new LandmarkCreateDTO();
        dto.setName("Bosque Los Colomos");
        dto.setLat(20.7128);
        dto.setLng(-103.3803);
        dto.setTags(List.of("nature"));
        return dto;
    }

    @Test
    void search_returnsOk_withNoFilters() throws Exception {
        when(landmarkService.search(isNull(), isNull())).thenReturn(List.of());

        mockMvc.perform(get("/api/landmarks"))
                .andExpect(status().isOk());
    }

    @Test
    void search_passesTagParam_toService() throws Exception {
        when(landmarkService.search(isNull(), eq("nature"))).thenReturn(List.of());

        mockMvc.perform(get("/api/landmarks").param("tag", "nature"))
                .andExpect(status().isOk());
    }

    @Test
    void getById_returnsNotFound_whenMissing() throws Exception {
        UUID id = UUID.randomUUID();
        when(landmarkService.getById(id)).thenThrow(new ResourceNotFoundException("Landmark not found: " + id));

        mockMvc.perform(get("/api/landmarks/{id}", id))
                .andExpect(status().isNotFound());
    }

    @Test
    void create_returnsCreated_withValidPayload() throws Exception {
        UUID id = UUID.randomUUID();
        when(landmarkService.create(any())).thenReturn(
                new LandmarkResponseDTO(id, "Bosque Los Colomos", null, null, 20.7128, -103.3803, null, 0, List.of("nature"))
        );

        mockMvc.perform(post("/api/landmarks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(validCreateDto())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Bosque Los Colomos"));
    }

    @Test
    void create_returnsBadRequest_whenNameMissing() throws Exception {
        LandmarkCreateDTO dto = validCreateDto();
        dto.setName(null);

        mockMvc.perform(post("/api/landmarks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void delete_returnsNoContent() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(delete("/api/landmarks/{id}", id))
                .andExpect(status().isNoContent());
    }
}