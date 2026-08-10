package com.savadev25.waynder.service;

import com.savadev25.waynder.dto.PlanCreateDTO;
import com.savadev25.waynder.dto.PlanResponseDTO;
import com.savadev25.waynder.dto.PlanUpdateDTO;
import com.savadev25.waynder.entity.Plan;
import com.savadev25.waynder.entity.User;
import com.savadev25.waynder.exception.ResourceNotFoundException;
import com.savadev25.waynder.repository.PlanRepository;
import com.savadev25.waynder.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlanService {

    private final PlanRepository planRepository;
    private final UserRepository userRepository;

    @Transactional
    public PlanResponseDTO create(UUID userId, PlanCreateDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        Plan plan = Plan.builder()
                .user(user)
                .name(dto.getName())
                .description(dto.getDescription())
                .build();

        return toResponse(planRepository.save(plan));
    }

    public List<PlanResponseDTO> listByUser(UUID userId) {
        return planRepository.findByUserId(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public PlanResponseDTO getById(UUID id) {
        return toResponse(findOrThrow(id));
    }

    @Transactional
    public PlanResponseDTO update(UUID id, PlanUpdateDTO dto) {
        Plan plan = findOrThrow(id);
        if (dto.getName() != null) {
            plan.setName(dto.getName());
        }
        if (dto.getDescription() != null) {
            plan.setDescription(dto.getDescription());
        }
        return toResponse(planRepository.save(plan));
    }

    @Transactional
    public void delete(UUID id) {
        planRepository.delete(findOrThrow(id));
    }

    private Plan findOrThrow(UUID id) {
        return planRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found: " + id));
    }

    private PlanResponseDTO toResponse(Plan plan) {
        return new PlanResponseDTO(
                plan.getId(),
                plan.getUser().getId(),
                plan.getName(),
                plan.getDescription(),
                plan.getCreatedAt()
        );
    }
}