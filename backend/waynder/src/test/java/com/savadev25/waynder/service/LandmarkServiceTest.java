package com.savadev25.waynder.service;

import com.savadev25.waynder.dto.LandmarkCreateDTO;
import com.savadev25.waynder.dto.LandmarkResponseDTO;
import com.savadev25.waynder.dto.LandmarkUpdateDTO;
import com.savadev25.waynder.entity.Landmark;
import com.savadev25.waynder.entity.Tag;
import com.savadev25.waynder.exception.ResourceNotFoundException;
import com.savadev25.waynder.repository.LandmarkRepository;
import com.savadev25.waynder.repository.TagRepository;
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
class LandmarkServiceTest {

    @Mock
    private LandmarkRepository landmarkRepository;

    @Mock
    private TagRepository tagRepository;

    @InjectMocks
    private LandmarkService landmarkService;

    private LandmarkCreateDTO createDto() {
        LandmarkCreateDTO dto = new LandmarkCreateDTO();
        dto.setName("Bosque Los Colomos");
        dto.setLat(20.7128);
        dto.setLng(-103.3803);
        dto.setTags(List.of("nature"));
        return dto;
    }

    @Test
    void create_setsSourceManual_andGeneratesExternalId() {
        when(tagRepository.findByName("nature")).thenReturn(Optional.empty());
        when(tagRepository.save(any(Tag.class))).thenAnswer(inv -> inv.getArgument(0));
        when(landmarkRepository.save(any(Landmark.class))).thenAnswer(inv -> inv.getArgument(0));

        LandmarkResponseDTO result = landmarkService.create(createDto());

        assertThat(result.getName()).isEqualTo("Bosque Los Colomos");
        assertThat(result.getTags()).containsExactly("nature");

        var captor = org.mockito.ArgumentCaptor.forClass(Landmark.class);
        verify(landmarkRepository).save(captor.capture());
        assertThat(captor.getValue().getSource()).isEqualTo("manual");
        assertThat(captor.getValue().getExternalId()).isNotBlank();
    }

    @Test
    void getById_throwsResourceNotFound_whenMissing() {
        UUID id = UUID.randomUUID();
        when(landmarkRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> landmarkService.getById(id))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void search_byTag_usesTagRepositoryLookup() {
        when(landmarkRepository.findByTagsNameIgnoreCase("nature")).thenReturn(List.of());

        landmarkService.search(null, "Nature");

        verify(landmarkRepository).findByTagsNameIgnoreCase("nature");
        verify(landmarkRepository, never()).findAll();
    }

    @Test
    void search_byQuery_whenNoTagProvided() {
        when(landmarkRepository.findByNameContainingIgnoreCase("bosque")).thenReturn(List.of());

        landmarkService.search("bosque", null);

        verify(landmarkRepository).findByNameContainingIgnoreCase("bosque");
    }

    @Test
    void search_returnsAll_whenNoFiltersProvided() {
        when(landmarkRepository.findAll()).thenReturn(List.of());

        landmarkService.search(null, null);

        verify(landmarkRepository).findAll();
    }

    @Test
    void update_keepsExistingValue_whenFieldNotProvided() {
        UUID id = UUID.randomUUID();
        Landmark existing = Landmark.builder()
                .id(id)
                .name("Old Name")
                .lat(20.0)
                .lng(-103.0)
                .source("manual")
                .externalId("abc")
                .build();

        LandmarkUpdateDTO dto = new LandmarkUpdateDTO();
        dto.setDescription("New description");

        when(landmarkRepository.findById(id)).thenReturn(Optional.of(existing));
        when(landmarkRepository.save(any(Landmark.class))).thenAnswer(inv -> inv.getArgument(0));

        LandmarkResponseDTO result = landmarkService.update(id, dto);

        assertThat(result.getName()).isEqualTo("Old Name");
        assertThat(result.getDescription()).isEqualTo("New description");
    }

    @Test
    void delete_removesLandmark_whenFound() {
        UUID id = UUID.randomUUID();
        Landmark existing = Landmark.builder().id(id).build();
        when(landmarkRepository.findById(id)).thenReturn(Optional.of(existing));

        landmarkService.delete(id);

        verify(landmarkRepository).delete(existing);
    }
}