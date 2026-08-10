package com.savadev25.waynder.repository;

import com.savadev25.waynder.entity.Landmark;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LandmarkRepository extends JpaRepository<Landmark, UUID> {

    // Used by the ingest pipeline to upsert regardless of which connector sent the data
    Optional<Landmark> findBySourceAndExternalId(String source, String externalId);

    // Used by the public browse/search endpoint
    List<Landmark> findByNameContainingIgnoreCase(String name);
    List<Landmark> findByTagsNameIgnoreCase(String tagName);
}