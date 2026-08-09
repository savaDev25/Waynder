package com.savadev25.waynder.service;

import com.savadev25.waynder.dto.LandmarkIngestDTO;
import com.savadev25.waynder.entity.Landmark;
import com.savadev25.waynder.entity.Tag;
import com.savadev25.waynder.repository.LandmarkRepository;
import com.savadev25.waynder.repository.TagRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LandmarkIngestServiceTest {

    @Mock
    private LandmarkRepository landmarkRepository;

    @Mock
    private TagRepository tagRepository;

    @InjectMocks
    private LandmarkIngestService landmarkIngestService;

    private LandmarkIngestDTO sampleDto() {
        LandmarkIngestDTO dto = new LandmarkIngestDTO();
        dto.setName("Templo Expiatorio");
        dto.setDescription("Neo-Gothic church");
        dto.setAddress("Calzada del Federalismo Sur 328");
        dto.setLat(20.6712);
        dto.setLng(-103.3617);
        dto.setSource("osm");
        dto.setExternalId("way/123456789");
        dto.setTags(List.of("historical", "architecture"));
        return dto;
    }

    @Test
    void ingest_createsNewLandmark_whenNotFoundBySourceAndExternalId() {
        LandmarkIngestDTO dto = sampleDto();

        when(landmarkRepository.findBySourceAndExternalId("osm", "way/123456789"))
                .thenReturn(Optional.empty());
        when(tagRepository.findByName(anyString())).thenReturn(Optional.empty());
        when(tagRepository.save(any(Tag.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(landmarkRepository.save(any(Landmark.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        LandmarkIngestService.IngestResult result = landmarkIngestService.ingest(List.of(dto));

        assertThat(result.created()).isEqualTo(1);
        assertThat(result.updated()).isZero();

        ArgumentCaptor<Landmark> captor = ArgumentCaptor.forClass(Landmark.class);
        verify(landmarkRepository).save(captor.capture());

        Landmark saved = captor.getValue();
        assertThat(saved.getName()).isEqualTo("Templo Expiatorio");
        assertThat(saved.getSource()).isEqualTo("osm");
        assertThat(saved.getExternalId()).isEqualTo("way/123456789");
        assertThat(saved.getTags()).extracting(Tag::getName)
                .containsExactlyInAnyOrder("historical", "architecture");
    }

    @Test
    void ingest_updatesExistingLandmark_whenFoundBySourceAndExternalId() {
        LandmarkIngestDTO dto = sampleDto();
        dto.setDescription("Updated description");

        Landmark existing = Landmark.builder()
                .name("Templo Expiatorio")
                .description("Old description")
                .source("osm")
                .externalId("way/123456789")
                .lat(20.0)
                .lng(-103.0)
                .build();

        when(landmarkRepository.findBySourceAndExternalId("osm", "way/123456789"))
                .thenReturn(Optional.of(existing));
        when(tagRepository.findByName(anyString())).thenReturn(Optional.empty());
        when(tagRepository.save(any(Tag.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(landmarkRepository.save(any(Landmark.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        LandmarkIngestService.IngestResult result = landmarkIngestService.ingest(List.of(dto));

        assertThat(result.created()).isZero();
        assertThat(result.updated()).isEqualTo(1);

        verify(landmarkRepository).save(existing);
        assertThat(existing.getDescription()).isEqualTo("Updated description");
        assertThat(existing.getLat()).isEqualTo(20.6712);
    }

    @Test
    void ingest_reusesExistingTag_insteadOfCreatingDuplicate() {
        LandmarkIngestDTO dto = sampleDto();
        dto.setTags(List.of("historical"));

        Tag existingTag = Tag.builder().name("historical").build();

        when(landmarkRepository.findBySourceAndExternalId(anyString(), anyString()))
                .thenReturn(Optional.empty());
        when(tagRepository.findByName("historical")).thenReturn(Optional.of(existingTag));
        when(landmarkRepository.save(any(Landmark.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        landmarkIngestService.ingest(List.of(dto));

        verify(tagRepository, never()).save(any(Tag.class));
    }

    @Test
    void ingest_normalizesTagCasingAndSkipsBlankTags() {
        LandmarkIngestDTO dto = sampleDto();
        dto.setTags(List.of("Historical", "  ", "Museum"));

        when(landmarkRepository.findBySourceAndExternalId(anyString(), anyString()))
                .thenReturn(Optional.empty());
        when(tagRepository.findByName(anyString())).thenReturn(Optional.empty());
        when(tagRepository.save(any(Tag.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(landmarkRepository.save(any(Landmark.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        landmarkIngestService.ingest(List.of(dto));

        verify(tagRepository).findByName("historical");
        verify(tagRepository).findByName("museum");
        verify(tagRepository, never()).findByName("  ");
    }

    @Test
    void ingest_handlesNullTagsList_withoutThrowing() {
        LandmarkIngestDTO dto = sampleDto();
        dto.setTags(null);

        when(landmarkRepository.findBySourceAndExternalId(anyString(), anyString()))
                .thenReturn(Optional.empty());
        when(landmarkRepository.save(any(Landmark.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        LandmarkIngestService.IngestResult result = landmarkIngestService.ingest(List.of(dto));

        assertThat(result.created()).isEqualTo(1);
        verifyNoInteractions(tagRepository);
    }
}