package com.vehicle.store.controller;

import com.vehicle.store.dto.ApiResponse;
import com.vehicle.store.dto.VehicleImageRequest;
import com.vehicle.store.entity.VehicleImage;
import com.vehicle.store.service.VehicleImageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
@Tag(name = "Vehicle Images", description = "Endpoints for managing vehicle images")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class VehicleImageController {

    private final VehicleImageService vehicleImageService;

    @GetMapping("/{id}/images")
    @Operation(summary = "Get vehicle images", description = "Retrieves all images associated with a specific vehicle")
    public ResponseEntity<ApiResponse<List<VehicleImage>>> getVehicleImages(@PathVariable("id") Long vehicleId) {
        return ResponseEntity.ok(ApiResponse.success("Vehicle images fetched successfully", vehicleImageService.getImagesForVehicle(vehicleId)));
    }

    @PostMapping("/{id}/images")
    @PreAuthorize("hasRole('A')")
    @Operation(summary = "Add vehicle image (Admin)", description = "Uploads a new image for a vehicle. Requires Admin role.")
    public ResponseEntity<ApiResponse<VehicleImage>> addVehicleImage(
            @PathVariable("id") Long vehicleId,
            @Valid @RequestBody VehicleImageRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Image added to vehicle successfully", vehicleImageService.addImageToVehicle(vehicleId, request)));
    }

    @DeleteMapping("/images/{imageId}")
    @PreAuthorize("hasRole('A')")
    @Operation(summary = "Delete vehicle image (Admin)", description = "Removes a vehicle image. Requires Admin role.")
    public ResponseEntity<ApiResponse<Void>> deleteVehicleImage(@PathVariable("imageId") Long imageId) {
        vehicleImageService.deleteImage(imageId);
        return ResponseEntity.ok(ApiResponse.success("Vehicle image deleted successfully", null));
    }
}
