package com.savadev25.waynder.service;

import com.savadev25.waynder.dto.PlanCreateDTO;
import com.savadev25.waynder.dto.PlanResponseDTO;
import com.savadev25.waynder.dto.PlanUpdateDTO;
import com.savadev25.waynder.entity.Plan;
import com.savadev25.waynder.entity.User;
import com.savadev25.waynder.exception.ResourceNotFoundException;
import com.savadev25.waynder.repository.PlanRepository;
import com.savadev25.waynder.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PlanServiceTest {

    @Mock
    private PlanRepository planRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private PlanService planService;

    @Test
    void create_throwsResourceNotFound_whenUserMissing() {
        UUID userId = UUID.randomUUID();
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        PlanCreateDTO dto = new PlanCreateDTO();
        dto.setName("Weekend in Guadalajara");

        assertThatThrownBy(() -> planService.create(userId, dto))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(planRepository, never()).save(any());
    }

    @Test
    void create_savesPlan_linkedToUser() {
        UUID userId = UUID.randomUUID();
        User user = User.builder().id(userId).name("Ana").email("ana@example.com").passwordHash("x").build();

        PlanCreateDTO dto = new PlanCreateDTO();
        dto.setName("Weekend in Guadalajara");
        dto.setDescription("Historic center + Colomos");

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(planRepository.save(any(Plan.class))).thenAnswer(inv -> inv.getArgument(0));

        PlanResponseDTO result = planService.create(userId, dto);

        assertThat(result.getName()).isEqualTo("Weekend in Guadalajara");
        assertThat(result.getUserId()).isEqualTo(userId);
    }

    @Test
    void listByUser_returnsMappedPlans() {
        UUID userId = UUID.randomUUID();
        User user = User.builder().id(userId).build();
        Plan plan = Plan.builder().id(UUID.randomUUID()).user(user).name("Trip A").build();

        when(planRepository.findByUserId(userId)).thenReturn(List.of(plan));

        List<PlanResponseDTO> result = planService.listByUser(userId);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Trip A");
    }

    @Test
    void update_onlyChangesProvidedFields() {
        UUID id = UUID.randomUUID();
        User user = User.builder().id(UUID.randomUUID()).build();
        Plan existing = Plan.builder().id(id).user(user).name("Old").description("Old desc").build();

        PlanUpdateDTO dto = new PlanUpdateDTO();
        dto.setDescription("Updated desc");

        when(planRepository.findById(id)).thenReturn(Optional.of(existing));
        when(planRepository.save(any(Plan.class))).thenAnswer(inv -> inv.getArgument(0));

        PlanResponseDTO result = planService.update(id, dto);

        assertThat(result.getName()).isEqualTo("Old");
        assertThat(result.getDescription()).isEqualTo("Updated desc");
    }

    @Test
    void delete_removesPlan_whenFound() {
        UUID id = UUID.randomUUID();
        Plan existing = Plan.builder().id(id).build();
        when(planRepository.findById(id)).thenReturn(Optional.of(existing));

        planService.delete(id);

        verify(planRepository).delete(existing);
    }
}