package com.savadev25.waynder.controller;

import com.savadev25.waynder.dto.LandmarkIngestDTO;
import com.savadev25.waynder.security.JwtService;
import com.savadev25.waynder.service.LandmarkIngestService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.json.JsonMapper;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// IngestApiKeyFilter is a plain @Component implementing Filter, so @WebMvcTest
// picks it up automatically alongside the controller -- this exercises the
// real auth check, not a mocked one. POST /api/landmarks/ingest is explicitly
// permitAll in SecurityConfig (guarded by IngestApiKeyFilter instead), so
// unlike other controllers' tests, no JWT authentication() post-processor
// is needed on any request here.
@WebMvcTest(LandmarkIngestController.class)
@Import(com.savadev25.waynder.config.SecurityConfig.class)
@TestPropertySource(properties = "ingest.api-key=test-secret-key")
class LandmarkIngestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JsonMapper jsonMapper;

    @MockitoBean
    private LandmarkIngestService landmarkIngestService;

    // Satisfies SecurityConfig's dependency so the context builds -- see
    // UserControllerTest for the full explanation. Unused otherwise here.
    @MockitoBean
    private JwtService jwtService;

    private List<LandmarkIngestDTO> validPayload() {
        LandmarkIngestDTO dto = new LandmarkIngestDTO();
        dto.setName("Templo Expiatorio");
        dto.setLat(20.6712);
        dto.setLng(-103.3617);
        dto.setSource("osm");
        dto.setExternalId("way/123456789");
        return List.of(dto);
    }

    @Test
    void ingest_returnsUnauthorized_whenApiKeyHeaderMissing() throws Exception {
        mockMvc.perform(post("/api/landmarks/ingest")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(validPayload())))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void ingest_returnsUnauthorized_whenApiKeyIncorrect() throws Exception {
        mockMvc.perform(post("/api/landmarks/ingest")
                        .header("X-Ingest-Key", "wrong-key")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(validPayload())))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void ingest_returnsBadRequest_whenNameMissing() throws Exception {
        LandmarkIngestDTO invalid = new LandmarkIngestDTO();
        invalid.setLat(20.0);
        invalid.setLng(-103.0);
        invalid.setSource("osm");
        invalid.setExternalId("way/1");

        mockMvc.perform(post("/api/landmarks/ingest")
                        .header("X-Ingest-Key", "test-secret-key")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(List.of(invalid))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void ingest_returnsOk_withValidPayloadAndCorrectApiKey() throws Exception {
        when(landmarkIngestService.ingest(any()))
                .thenReturn(new LandmarkIngestService.IngestResult(1, 0));

        mockMvc.perform(post("/api/landmarks/ingest")
                        .header("X-Ingest-Key", "test-secret-key")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(validPayload())))
                .andExpect(status().isOk());
    }
}