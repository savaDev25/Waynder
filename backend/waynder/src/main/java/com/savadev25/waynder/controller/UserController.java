package com.savadev25.waynder.controller;

import com.savadev25.waynder.dto.UserRegisterDTO;
import com.savadev25.waynder.dto.UserResponseDTO;
import com.savadev25.waynder.dto.UserUpdateDTO;
import com.savadev25.waynder.security.AuthorizationUtil;
import com.savadev25.waynder.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<UserResponseDTO> register(@Valid @RequestBody UserRegisterDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.register(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> getById(@PathVariable UUID id, Authentication authentication) {
        AuthorizationUtil.requireSelf(authentication, id);
        return ResponseEntity.ok(userService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDTO> update(@PathVariable UUID id, @Valid @RequestBody UserUpdateDTO dto, Authentication authentication) {
        AuthorizationUtil.requireSelf(authentication, id);
        return ResponseEntity.ok(userService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id, Authentication authentication) {
        AuthorizationUtil.requireSelf(authentication, id);
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}