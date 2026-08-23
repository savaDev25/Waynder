package com.savadev25.waynder.controller;

import com.savadev25.waynder.dto.AuthResponseDTO;
import com.savadev25.waynder.dto.LoginRequestDTO;
import com.savadev25.waynder.dto.UserResponseDTO;
import com.savadev25.waynder.entity.User;
import com.savadev25.waynder.exception.InvalidCredentialsException;
import com.savadev25.waynder.repository.UserRepository;
import com.savadev25.waynder.security.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO dto) {
        User user = userRepository.findByEmail(dto.getEmail())
                .filter(u -> passwordEncoder.matches(dto.getPassword(), u.getPasswordHash()))
                // Deliberately the SAME error for "no such email" and "wrong
                // password" -- distinguishing them would let an attacker
                // enumerate which emails are registered.
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        String token = jwtService.generateToken(user.getId(), user.getEmail());
        UserResponseDTO userDto = new UserResponseDTO(user.getId(), user.getName(), user.getEmail(), user.getCreatedAt());

        return ResponseEntity.ok(new AuthResponseDTO(token, userDto));
    }
}