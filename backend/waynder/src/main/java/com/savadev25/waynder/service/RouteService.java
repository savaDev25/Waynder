package com.savadev25.waynder.service;

import com.savadev25.waynder.dto.RouteCreateDTO;
import com.savadev25.waynder.dto.RouteLandmarkResponseDTO;
import com.savadev25.waynder.dto.RouteResponseDTO;
import com.savadev25.waynder.dto.RouteUpdateDTO;
import com.savadev25.waynder.entity.Landmark;
import com.savadev25.waynder.entity.Plan;
import com.savadev25.waynder.entity.Route;
import com.savadev25.waynder.entity.RouteLandmark;
import com.savadev25.waynder.entity.RouteLandmarkId;
import com.savadev25.waynder.entity.User;
import com.savadev25.waynder.exception.ResourceNotFoundException;
import com.savadev25.waynder.repository.LandmarkRepository;
import com.savadev25.waynder.repository.PlanRepository;
import com.savadev25.waynder.repository.RouteRepository;
import com.savadev25.waynder.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RouteService {

    private final RouteRepository routeRepository;
    private final UserRepository userRepository;
    private final PlanRepository planRepository;
    private final LandmarkRepository landmarkRepository;

    @Transactional
    public RouteResponseDTO create(UUID userId, RouteCreateDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        Route route = new Route();
        route.setUser(user);
        route.setName(dto.getName());
        route.setPlan(resolvePlan(dto.getPlanId()));

        // Save first so the route has an ID -- RouteLandmark's composite key
        // needs both the route's and the landmark's IDs to already exist.
        route = routeRepository.save(route);

        applyLandmarks(route, dto.getLandmarkIds());

        return toResponse(routeRepository.save(route));
    }

    public List<RouteResponseDTO> listByUser(UUID userId) {
        return routeRepository.findByUserId(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public RouteResponseDTO getById(UUID id) {
        return toResponse(findOrThrow(id));
    }

    @Transactional
    public RouteResponseDTO update(UUID id, RouteUpdateDTO dto) {
        Route route = findOrThrow(id);

        if (dto.getName() != null) {
            route.setName(dto.getName());
        }
        if (dto.getPlanId() != null) {
            route.setPlan(resolvePlan(dto.getPlanId()));
        }
        if (dto.getLandmarkIds() != null) {
            applyLandmarks(route, dto.getLandmarkIds());
        }

        return toResponse(routeRepository.save(route));
    }

    @Transactional
    public void delete(UUID id) {
        routeRepository.delete(findOrThrow(id));
    }

    private Plan resolvePlan(UUID planId) {
        if (planId == null) {
            return null;
        }
        return planRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found: " + planId));
    }

    private void applyLandmarks(Route route, List<UUID> landmarkIds) {
        route.getRouteLandmarks().clear();

        List<RouteLandmark> routeLandmarks = new ArrayList<>();
        for (int i = 0; i < landmarkIds.size(); i++) {
            UUID landmarkId = landmarkIds.get(i);
            Landmark landmark = landmarkRepository.findById(landmarkId)
                    .orElseThrow(() -> new ResourceNotFoundException("Landmark not found: " + landmarkId));

            routeLandmarks.add(RouteLandmark.builder()
                    .id(new RouteLandmarkId(route.getId(), landmark.getId()))
                    .route(route)
                    .landmark(landmark)
                    .orderIndex(i)
                    .build());
        }
        route.getRouteLandmarks().addAll(routeLandmarks);
    }

    private Route findOrThrow(UUID id) {
        return routeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Route not found: " + id));
    }

    private RouteResponseDTO toResponse(Route route) {
        List<RouteLandmarkResponseDTO> landmarks = route.getRouteLandmarks().stream()
                .sorted(Comparator.comparing(RouteLandmark::getOrderIndex))
                .map(rl -> new RouteLandmarkResponseDTO(
                        rl.getLandmark().getId(),
                        rl.getLandmark().getName(),
                        rl.getLandmark().getLat(),
                        rl.getLandmark().getLng(),
                        rl.getOrderIndex()
                ))
                .collect(Collectors.toList());

        return new RouteResponseDTO(
                route.getId(),
                route.getUser().getId(),
                route.getPlan() != null ? route.getPlan().getId() : null,
                route.getName(),
                landmarks,
                route.getCreatedAt()
        );
    }
}