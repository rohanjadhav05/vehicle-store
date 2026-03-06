package com.vehicle.store.service;

import com.vehicle.store.dto.VehicleImageRequest;
import com.vehicle.store.entity.Vehicle;
import com.vehicle.store.entity.VehicleImage;
import com.vehicle.store.exception.ResourceNotFoundException;
import com.vehicle.store.repository.VehicleImageRepository;
import com.vehicle.store.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VehicleImageService {

    private final VehicleImageRepository vehicleImageRepository;
    private final VehicleRepository vehicleRepository;

    public List<VehicleImage> getImagesForVehicle(Long vehicleId) {
        if (!vehicleRepository.existsById(vehicleId)) {
            throw new ResourceNotFoundException("Vehicle not found");
        }
        return vehicleImageRepository.findByVehicleIdOrderBySortOrderAsc(vehicleId);
    }

    public VehicleImage addImageToVehicle(Long vehicleId, VehicleImageRequest request) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));

        VehicleImage image = VehicleImage.builder()
                .vehicle(vehicle)
                .imageUrl(request.getImageUrl())
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .build();

        return vehicleImageRepository.save(image);
    }

    public void deleteImage(Long imageId) {
        if (!vehicleImageRepository.existsById(imageId)) {
            throw new ResourceNotFoundException("Image not found");
        }
        vehicleImageRepository.deleteById(imageId);
    }
}
