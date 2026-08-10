package com.savadev25.waynder.repository;

import com.savadev25.waynder.entity.Route;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RouteRepository extends JpaRepository<Route, UUID> {
    List<Route> findByUserId(UUID userId);
}