package com.vehicle.store.repository;

import com.vehicle.store.entity.Vehicle;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class VehicleSpecification {

    public static Specification<Vehicle> filterVehicles(Long brandId, Long fuelTypeId, BigDecimal minPrice, BigDecimal maxPrice) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (brandId != null) {
                predicates.add(criteriaBuilder.equal(root.get("brand").get("id"), brandId));
            }
            if (fuelTypeId != null) {
                predicates.add(criteriaBuilder.equal(root.get("fuelType").get("id"), fuelTypeId));
            }
            if (minPrice != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("price"), minPrice));
            }
            if (maxPrice != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("price"), maxPrice));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
