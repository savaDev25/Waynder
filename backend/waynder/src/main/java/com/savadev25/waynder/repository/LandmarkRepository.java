package com.savadev25.waynder.repository;

import com.savadev25.waynder.entity.Landmark;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface LandmarkRepository extends JpaRepository<Landmark, UUID> {

    // Used to detect whether an incoming ingest item already exists,
    // regardless of which connector (osm/foursquare/scraper) sent it.
    Optional<Landmark> findBySourceAndExternalId(String source, String externalId);
}