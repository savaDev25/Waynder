package com.savadev25.waynder.service;

import com.savadev25.waynder.dto.RouteCreateDTO;
import com.savadev25.waynder.dto.RouteResponseDTO;
import com.savadev25.waynder.entity.Landmark;
import com.savadev25.waynder.entity.Route;
import com.savadev25.waynder.entity.User;
import com.savadev25.waynder.exception.ResourceNotFoundException;
import com.savadev25.waynder.repository.LandmarkRepository;
import com.savadev25.waynder.repository.PlanRepository;
import com.savadev25.waynder.repository.RouteRepository;
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
class RouteServiceTest {

    @Mock
    private RouteRepository routeRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PlanRepository planRepository;

    @Mock
    private LandmarkRepository landmarkRepository;

    @InjectMocks
    private RouteService routeService;

    @Test
    void create_ordersLandmarksByGivenSequence() {
        UUID userId = UUID.randomUUID();
        UUID routeId = UUID.randomUUID();
        User user = User.builder().id(userId).build();

        UUID landmarkA = UUID.randomUUID();
        UUID landmarkB = UUID.randomUUID();
        Landmark a = Landmark.builder().id(landmarkA).name("Templo Expiatorio").lat(20.6).lng(-103.3).build();
        Landmark b = Landmark.builder().id(landmarkB).name("Teatro Degollado").lat(20.67).lng(-103.34).build();

        RouteCreateDTO dto = new RouteCreateDTO();
        dto.setName("Centro Historico");
        dto.setLandmarkIds(List.of(landmarkA, landmarkB));

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(landmarkRepository.findById(landmarkA)).thenReturn(Optional.of(a));
        when(landmarkRepository.findById(landmarkB)).thenReturn(Optional.of(b));
        // First save assigns the route's own ID (simulating the DB), second save persists landmarks
        when(routeRepository.save(any(Route.class))).thenAnswer(inv -> {
            Route r = inv.getArgument(0);
            if (r.getId() == null) {
                r.setId(routeId);
            }
            return r;
        });

        RouteResponseDTO result = routeService.create(userId, dto);

        assertThat(result.getLandmarks()).hasSize(2);
        assertThat(result.getLandmarks().get(0).getLandmarkId()).isEqualTo(landmarkA);
        assertThat(result.getLandmarks().get(0).getOrderIndex()).isZero();
        assertThat(result.getLandmarks().get(1).getLandmarkId()).isEqualTo(landmarkB);
        assertThat(result.getLandmarks().get(1).getOrderIndex()).isEqualTo(1);
    }

    @Test
    void create_throwsResourceNotFound_whenLandmarkMissing() {
        UUID userId = UUID.randomUUID();
        User user = User.builder().id(userId).build();
        UUID missingLandmark = UUID.randomUUID();

        RouteCreateDTO dto = new RouteCreateDTO();
        dto.setName("Broken Route");
        dto.setLandmarkIds(List.of(missingLandmark));

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(routeRepository.save(any(Route.class))).thenAnswer(inv -> {
            Route r = inv.getArgument(0);
            r.setId(UUID.randomUUID());
            return r;
        });
        when(landmarkRepository.findById(missingLandmark)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> routeService.create(userId, dto))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void create_throwsResourceNotFound_whenUserMissing() {
        UUID userId = UUID.randomUUID();
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        RouteCreateDTO dto = new RouteCreateDTO();
        dto.setName("Route");
        dto.setLandmarkIds(List.of(UUID.randomUUID()));

        assertThatThrownBy(() -> routeService.create(userId, dto))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(routeRepository, never()).save(any());
    }

    @Test
    void getById_throwsResourceNotFound_whenMissing() {
        UUID id = UUID.randomUUID();
        when(routeRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> routeService.getById(id))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void delete_removesRoute_whenFound() {
        UUID id = UUID.randomUUID();
        Route existing = new Route();
        existing.setId(id);
        when(routeRepository.findById(id)).thenReturn(Optional.of(existing));

        routeService.delete(id);

        verify(routeRepository).delete(existing);
    }
}