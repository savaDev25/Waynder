package com.savadev25.waynder.service;

import com.savadev25.waynder.dto.LandmarkIngestDTO;
import com.savadev25.waynder.entity.Landmark;
import com.savadev25.waynder.entity.Tag;
import com.savadev25.waynder.repository.LandmarkRepository;
import com.savadev25.waynder.repository.TagRepository;
import com.savadev25.waynder.utils.InputSanitizer;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class LandmarkIngestService {

    private final LandmarkRepository landmarkRepository;
    private final TagRepository tagRepository;
    private final InputSanitizer sanitizer;

    @Transactional
    public IngestResult ingest(List<LandmarkIngestDTO> items) {
        int created = 0;
        int updated = 0;

        for (LandmarkIngestDTO dto : items) {
            // Reject before touching the DB at all if imageUrl uses an unsafe
            // scheme (javascript:, data:, etc) -- this is scraped content,
            // treat it as untrusted regardless of which connector sent it.
            if (!sanitizer.isSafeUrl(dto.getImageUrl())) {
                throw new IllegalArgumentException(
                        "Unsafe imageUrl scheme for external id " + dto.getExternalId());
            }

            Landmark landmark = landmarkRepository
                    .findBySourceAndExternalId(dto.getSource(), dto.getExternalId())
                    .orElse(null);

            boolean isNew = landmark == null;
            if (isNew) {
                landmark = new Landmark();
                landmark.setSource(dto.getSource());
                landmark.setExternalId(dto.getExternalId());
            }

            

            // Strip any HTML/script markup before it ever reaches storage --
            // defense in depth on top of the frontend's own JSX escaping.
            landmark.setName(sanitizer.stripHtml(dto.getName()));
            landmark.setDescription(sanitizer.stripHtml(dto.getDescription()));
            landmark.setAddress(sanitizer.stripHtml(dto.getAddress()));
            landmark.setImageUrl(dto.getImageUrl());
            landmark.setLat(dto.getLat());
            landmark.setLng(dto.getLng());
            landmark.setTags(resolveTags(dto.getTags()));

            landmarkRepository.save(landmark);

            if (isNew) {
                created++;
            } else {
                updated++;
            }
        }

        return new IngestResult(created, updated);
    }

    // Finds existing tags by name or creates them on the fly — connectors
    // just send plain tag strings, they don't need to know tag IDs exist.
    private Set<Tag> resolveTags(List<String> tagNames) {
        Set<Tag> tags = new HashSet<>();
        if (tagNames == null) {
            return tags;
        }
        for (String rawName : tagNames) {
            // stripHtml as well as trim/lowercase -- tags get rendered as
            // filter chips on the frontend, same stored-XSS surface as any
            // other text field.
            String name = sanitizer.stripHtml(rawName).trim().toLowerCase();
            if (name.isEmpty()) {
                continue;
            }
            Tag tag = tagRepository.findByName(name)
                    .orElseGet(() -> tagRepository.save(Tag.builder().name(name).build()));
            tags.add(tag);
        }
        return tags;
    }

    public record IngestResult(int created, int updated) {}
}