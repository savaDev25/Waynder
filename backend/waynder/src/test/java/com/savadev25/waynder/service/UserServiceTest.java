package com.savadev25.waynder.service;

import com.savadev25.waynder.dto.UserRegisterDTO;
import com.savadev25.waynder.dto.UserResponseDTO;
import com.savadev25.waynder.dto.UserUpdateDTO;
import com.savadev25.waynder.entity.User;
import com.savadev25.waynder.exception.ResourceNotFoundException;
import com.savadev25.waynder.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private UserRegisterDTO registerDto() {
        UserRegisterDTO dto = new UserRegisterDTO();
        dto.setName("Ana Torres");
        dto.setEmail("ana@example.com");
        dto.setPassword("supersecret123");
        return dto;
    }

    @Test
    void register_createsUser_withHashedPassword() {
        UserRegisterDTO dto = registerDto();

        when(userRepository.existsByEmail("ana@example.com")).thenReturn(false);
        when(passwordEncoder.encode("supersecret123")).thenReturn("hashed-value");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(UUID.randomUUID());
            return u;
        });

        UserResponseDTO result = userService.register(dto);

        assertThat(result.getName()).isEqualTo("Ana Torres");
        assertThat(result.getEmail()).isEqualTo("ana@example.com");

        verify(passwordEncoder).encode("supersecret123");
        verify(userRepository, never()).save(argThat(u -> "supersecret123".equals(u.getPasswordHash())));
    }

    @Test
    void register_throws_whenEmailAlreadyRegistered() {
        when(userRepository.existsByEmail("ana@example.com")).thenReturn(true);

        assertThatThrownBy(() -> userService.register(registerDto()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("ana@example.com");

        verify(userRepository, never()).save(any());
    }

    @Test
    void getById_throwsResourceNotFound_whenMissing() {
        UUID id = UUID.randomUUID();
        when(userRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getById(id))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void update_appliesOnlyProvidedFields() {
        UUID id = UUID.randomUUID();
        User existing = User.builder().id(id).name("Old Name").email("old@example.com").passwordHash("x").build();

        UserUpdateDTO dto = new UserUpdateDTO();
        dto.setName("New Name");

        when(userRepository.findById(id)).thenReturn(Optional.of(existing));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserResponseDTO result = userService.update(id, dto);

        assertThat(result.getName()).isEqualTo("New Name");
        assertThat(result.getEmail()).isEqualTo("old@example.com");
    }

    @Test
    void delete_removesUser_whenFound() {
        UUID id = UUID.randomUUID();
        User existing = User.builder().id(id).build();
        when(userRepository.findById(id)).thenReturn(Optional.of(existing));

        userService.delete(id);

        verify(userRepository).delete(existing);
    }
}