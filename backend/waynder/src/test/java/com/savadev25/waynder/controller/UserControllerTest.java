package com.savadev25.waynder.controller;

import com.savadev25.waynder.config.SecurityConfig;
import com.savadev25.waynder.dto.UserRegisterDTO;
import com.savadev25.waynder.dto.UserResponseDTO;
import com.savadev25.waynder.exception.ResourceNotFoundException;
import com.savadev25.waynder.security.JwtService;
import com.savadev25.waynder.service.UserService;
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
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
@Import(SecurityConfig.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JsonMapper jsonMapper;

    @MockitoBean
    private UserService userService;

    // Satisfies SecurityConfig's dependency on JwtService so the context can
    // build -- @WebMvcTest excludes plain @Component beans like the real one.
    // We never stub its methods: authenticated requests below bypass real
    // JWT parsing entirely via the authentication() request post-processor.
    @MockitoBean
    private JwtService jwtService;

    private UserRegisterDTO validRegisterDto() {
        UserRegisterDTO dto = new UserRegisterDTO();
        dto.setName("Ana Torres");
        dto.setEmail("ana@example.com");
        dto.setPassword("supersecret123");
        return dto;
    }

    private UsernamePasswordAuthenticationToken authAs(UUID userId) {
        return new UsernamePasswordAuthenticationToken(userId.toString(), null, List.of());
    }

    @Test
    void register_returnsCreated_withValidPayload() throws Exception {
        UUID id = UUID.randomUUID();
        when(userService.register(any())).thenReturn(new UserResponseDTO(id, "Ana Torres", "ana@example.com", Instant.now()));

        mockMvc.perform(post("/api/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(validRegisterDto())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("ana@example.com"));
    }

    @Test
    void register_returnsBadRequest_whenEmailInvalid() throws Exception {
        UserRegisterDTO dto = validRegisterDto();
        dto.setEmail("not-an-email");

        mockMvc.perform(post("/api/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void register_returnsBadRequest_whenPasswordTooShort() throws Exception {
        UserRegisterDTO dto = validRegisterDto();
        dto.setPassword("short");

        mockMvc.perform(post("/api/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getById_returnsUnauthorized_whenNoAuth() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(get("/api/users/{id}", id))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getById_returnsForbidden_whenAuthenticatedAsDifferentUser() throws Exception {
        UUID id = UUID.randomUUID();
        UUID someoneElse = UUID.randomUUID();

        mockMvc.perform(get("/api/users/{id}", id).with(authentication(authAs(someoneElse))))
                .andExpect(status().isForbidden());
    }

    @Test
    void getById_returnsNotFound_whenUserMissing() throws Exception {
        UUID id = UUID.randomUUID();
        when(userService.getById(id)).thenThrow(new ResourceNotFoundException("User not found: " + id));

        mockMvc.perform(get("/api/users/{id}", id).with(authentication(authAs(id))))
                .andExpect(status().isNotFound());
    }

    @Test
    void delete_returnsNoContent_whenAuthenticatedAsSelf() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(delete("/api/users/{id}", id).with(authentication(authAs(id))))
                .andExpect(status().isNoContent());
    }
}