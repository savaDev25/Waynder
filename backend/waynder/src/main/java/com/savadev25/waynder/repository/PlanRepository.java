package com.savadev25.waynder.repository;

import com.savadev25.waynder.entity.Plan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PlanRepository extends JpaRepository<Plan, UUID> {
    List<Plan> findByUserId(UUID userId);
}