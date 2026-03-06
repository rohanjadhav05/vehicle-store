package com.vehicle.store.service;

import com.vehicle.store.entity.FuelType;
import com.vehicle.store.exception.DuplicateResourceException;
import com.vehicle.store.exception.ResourceNotFoundException;
import com.vehicle.store.repository.FuelTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FuelTypeService {

    private final FuelTypeRepository fuelTypeRepository;

    public List<FuelType> getAllFuelTypes() {
        return fuelTypeRepository.findAll();
    }

    public FuelType createFuelType(FuelType fuelType) {
        if (fuelTypeRepository.existsByName(fuelType.getName())) {
            throw new DuplicateResourceException("FuelType already exists with name: " + fuelType.getName());
        }
        return fuelTypeRepository.save(fuelType);
    }

    public void deleteFuelType(Long id) {
        if (!fuelTypeRepository.existsById(id)) {
            throw new ResourceNotFoundException("FuelType not found with id: " + id);
        }
        fuelTypeRepository.deleteById(id);
    }
}
