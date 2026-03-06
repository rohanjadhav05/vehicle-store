package com.vehicle.store.repository;

import com.vehicle.store.entity.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {
    List<Bookmark> findByUserId(Long userId);
    boolean existsByUserIdAndVehicleId(Long userId, Long vehicleId);
    Optional<Bookmark> findByIdAndUserId(Long id, Long userId);
}
