package com.vehicle.store.repository;

import com.vehicle.store.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long>, JpaSpecificationExecutor<Vehicle> {

    @Query("SELECT v.brand.name AS brand, COUNT(v) AS count FROM Vehicle v GROUP BY v.brand.name")
    List<Map<String, Object>> getVehicleSummaryByBrand();
}
