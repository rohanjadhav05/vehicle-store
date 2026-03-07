package com.vehicle.store.service;

import com.vehicle.store.dto.VehicleRequest;
import com.vehicle.store.entity.Brand;
import com.vehicle.store.entity.FuelType;
import com.vehicle.store.entity.Vehicle;
import com.vehicle.store.exception.ResourceNotFoundException;
import com.vehicle.store.repository.BrandRepository;
import com.vehicle.store.repository.FuelTypeRepository;
import com.vehicle.store.repository.VehicleRepository;
import com.vehicle.store.repository.VehicleSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final BrandRepository brandRepository;
    private final FuelTypeRepository fuelTypeRepository;

    public List<Vehicle> getVehicles(Long brandId, Long fuelTypeId, BigDecimal minPrice, BigDecimal maxPrice) {
        return vehicleRepository.findAll(VehicleSpecification.filterVehicles(brandId, fuelTypeId, minPrice, maxPrice));
    }

    public Vehicle getVehicleDetails(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));
    }

    public List<Map<String, Object>> getVehicleSummary() {
        return vehicleRepository.getVehicleSummaryByBrand();
    }

    public Vehicle createVehicle(VehicleRequest request) {
        Brand brand = brandRepository.findById(request.getBrandId())
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found"));
        FuelType fuelType = fuelTypeRepository.findById(request.getFuelTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Fuel type not found"));

        Vehicle vehicle = Vehicle.builder()
                .brand(brand)
                .fuelType(fuelType)
                .name(request.getName())
                .price(request.getPrice())
                .description(request.getDescription())
                .thumbnailUrl(request.getThumbnailUrl())
                .specs(request.getSpecs())
                .stock(request.getStock() != null ? request.getStock() : 0)
                .build();

        if (request.getPhotoUrls() != null && !request.getPhotoUrls().isEmpty()) {
            List<com.vehicle.store.entity.Photo> photos = new java.util.ArrayList<>();
            for (String url : request.getPhotoUrls()) {
                photos.add(com.vehicle.store.entity.Photo.builder()
                        .url(url)
                        .vehicle(vehicle)
                        .build());
            }
            vehicle.setPhotos(photos);
        }

        return vehicleRepository.save(vehicle);
    }

    public Vehicle updateVehicle(Long id, VehicleRequest request) {
        Vehicle vehicle = getVehicleDetails(id);

        Brand brand = brandRepository.findById(request.getBrandId())
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found"));
        FuelType fuelType = fuelTypeRepository.findById(request.getFuelTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Fuel type not found"));

        vehicle.setBrand(brand);
        vehicle.setFuelType(fuelType);
        vehicle.setName(request.getName());
        vehicle.setPrice(request.getPrice());
        vehicle.setDescription(request.getDescription());
        vehicle.setThumbnailUrl(request.getThumbnailUrl());
        vehicle.setSpecs(request.getSpecs());
        if (request.getStock() != null) {
            vehicle.setStock(request.getStock());
        }

        if (request.getPhotoUrls() != null && !request.getPhotoUrls().isEmpty()) {
            List<com.vehicle.store.entity.Photo> existingPhotos = vehicle.getPhotos();
            if (existingPhotos == null) {
                existingPhotos = new java.util.ArrayList<>();
                vehicle.setPhotos(existingPhotos);
            }
            // User requested to append new photos instead of clearing old ones
            for (String url : request.getPhotoUrls()) {
                // simple check to avoid duplicates if they pass the same exact url again
                boolean exists = existingPhotos.stream().anyMatch(p -> p.getUrl().equals(url));
                if (!exists) {
                    existingPhotos.add(com.vehicle.store.entity.Photo.builder()
                            .url(url)
                            .vehicle(vehicle)
                            .build());
                }
            }
        }

        return vehicleRepository.save(vehicle);
    }

    public void deleteVehicle(Long id) {
        if (!vehicleRepository.existsById(id)) {
            throw new ResourceNotFoundException("Vehicle not found");
        }
        vehicleRepository.deleteById(id);
    }
}
