package com.savadev25.waynder.service;

import com.savadev25.waynder.dto.LandmarkCreateDTO;
import com.savadev25.waynder.dto.LandmarkResponseDTO;
import com.savadev25.waynder.dto.LandmarkUpdateDTO;
import com.savadev25.waynder.entity.Landmark;
import com.savadev25.waynder.entity.Tag;
import com.savadev25.waynder.exception.ResourceNotFoundException;
import com.savadev25.waynder.repository.LandmarkRepository;
import com.savadev25.waynder.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

// Handles browsing/manual curation of landmarks. Bulk ingest from
// scraper connectors is handled separately by LandmarkIngestService.
@Service
@RequiredArgsConstructor
public class LandmarkService {

    private final LandmarkRepository landmarkRepository;
    private final TagRepository tagRepository;

    public List<LandmarkResponseDTO> search(String query, String tag) {
        List<Landmark> results;
        if (tag != null && !tag.isBlank()) {
            results = landmarkRepository.findByTagsNameIgnoreCase(tag.trim().toLowerCase());
        } else if (query != null && !query.isBlank()) {
            results = landmarkRepository.findByNameContainingIgnoreCase(query.trim());
        } else {
            results = landmarkRepository.findAll();
        }
        return results.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public LandmarkResponseDTO getById(UUID id) {
        return toResponse(findOrThrow(id));
    }

    @Transactional
    public LandmarkResponseDTO create(LandmarkCreateDTO dto) {
        Landmark landmark = new Landmark();
        landmark.setSource("manual");
        landmark.setExternalId(UUID.randomUUID().toString());
        applyFields(landmark, dto.getName(), dto.getDescription(), dto.getAddress(),
                dto.getLat(), dto.getLng(), dto.getImageUrl(), dto.getTags());
        return toResponse(landmarkRepository.save(landmark));
    }

    @Transactional
    public LandmarkResponseDTO update(UUID id, LandmarkUpdateDTO dto) {
        Landmark landmark = findOrThrow(id);
        applyFields(
                landmark,
                dto.getName() != null ? dto.getName() : landmark.getName(),
                dto.getDescription() != null ? dto.getDescription() : landmark.getDescription(),
                dto.getAddress() != null ? dto.getAddress() : landmark.getAddress(),
                dto.getLat() != null ? dto.getLat() : landmark.getLat(),
                dto.getLng() != null ? dto.getLng() : landmark.getLng(),
                dto.getImageUrl() != null ? dto.getImageUrl() : landmark.getImageUrl(),
                dto.getTags() != null
                        ? dto.getTags()
                        : landmark.getTags().stream().map(Tag::getName).collect(Collectors.toList())
        );
        return toResponse(landmarkRepository.save(landmark));
    }

    @Transactional
    public void delete(UUID id) {
        landmarkRepository.delete(findOrThrow(id));
    }

    private void applyFields(Landmark landmark, String name, String description, String address,
                              Double lat, Double lng, String imageUrl, List<String> tagNames) {
        landmark.setName(name);
        landmark.setDescription(description);
        landmark.setAddress(address);
        landmark.setLat(lat);
        landmark.setLng(lng);
        landmark.setImageUrl(imageUrl);
        landmark.setTags(resolveTags(tagNames));
    }

    private Set<Tag> resolveTags(List<String> tagNames) {
        Set<Tag> tags = new HashSet<>();
        if (tagNames == null) {
            return tags;
        }
        for (String raw : tagNames) {
            String name = raw.trim().toLowerCase();
            if (name.isEmpty()) {
                continue;
            }
            Tag tag = tagRepository.findByName(name)
                    .orElseGet(() -> tagRepository.save(Tag.builder().name(name).build()));
            tags.add(tag);
        }
        return tags;
    }

    private Landmark findOrThrow(UUID id) {
        return landmarkRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Landmark not found: " + id));
    }

    private LandmarkResponseDTO toResponse(Landmark landmark) {
        return new LandmarkResponseDTO(
                landmark.getId(),
                landmark.getName(),
                landmark.getDescription(),
                landmark.getAddress(),
                landmark.getLat(),
                landmark.getLng(),
                landmark.getImageUrl(),
                landmark.getPopularityScore(),
                landmark.getTags().stream().map(Tag::getName).collect(Collectors.toList())
        );
    }
}