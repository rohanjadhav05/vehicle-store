package com.vehicle.store.controller;

import com.vehicle.store.dto.ApiResponse;
import com.vehicle.store.dto.VehicleRequest;
import com.vehicle.store.entity.Vehicle;
import com.vehicle.store.service.VehicleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
@Tag(name = "Vehicles", description = "Endpoints for managing vehicles in the store")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class VehicleController {

    private final VehicleService vehicleService;

    @GetMapping
    @Operation(summary = "Get all vehicles", description = "Retrieves a list of vehicles with optional filtering")
    public ResponseEntity<ApiResponse<List<Vehicle>>> getVehicles(
            @Parameter(description = "Filter by brand ID") @RequestParam(name = "brandId", required = false) Long brandId,
            @Parameter(description = "Filter by fuel type ID") @RequestParam(name = "fuelTypeId", required = false) Long fuelTypeId,
            @Parameter(description = "Minimum price filter") @RequestParam(name = "minPrice", required = false) BigDecimal minPrice,
            @Parameter(description = "Maximum price filter") @RequestParam(name = "maxPrice", required = false) BigDecimal maxPrice) {
        return ResponseEntity.ok(ApiResponse.success("Vehicles fetched successfully",
                vehicleService.getVehicles(brandId, fuelTypeId, minPrice, maxPrice)));
    }

    @GetMapping("/summary")
    @Operation(summary = "Get vehicles summary", description = "Retrieves a summarized view of available vehicles")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getVehicleSummary() {
        return ResponseEntity
                .ok(ApiResponse.success("Vehicle summary fetched successfully", vehicleService.getVehicleSummary()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get vehicle details", description = "Retrieves detailed information for a specific vehicle by ID")
    public ResponseEntity<ApiResponse<Vehicle>> getVehicleDetails(@PathVariable("id") Long id) {
        return ResponseEntity
                .ok(ApiResponse.success("Vehicle details fetched successfully", vehicleService.getVehicleDetails(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('A')")
    @Operation(summary = "Create a vehicle (Admin)", description = "Adds a new vehicle to the store. Requires Admin role.")
    public ResponseEntity<ApiResponse<Vehicle>> createVehicle(@Valid @RequestBody VehicleRequest request) {
        return ResponseEntity
                .ok(ApiResponse.success("Vehicle created successfully", vehicleService.createVehicle(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('A')")
    @Operation(summary = "Update a vehicle (Admin)", description = "Updates an existing vehicle's information. Requires Admin role.")
    public ResponseEntity<ApiResponse<Vehicle>> updateVehicle(
            @PathVariable("id") Long id,
            @Valid @RequestBody VehicleRequest request) {
        return ResponseEntity
                .ok(ApiResponse.success("Vehicle updated successfully", vehicleService.updateVehicle(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('A')")
    @Operation(summary = "Delete a vehicle (Admin)", description = "Removes a vehicle from the store. Requires Admin role.")
    public ResponseEntity<ApiResponse<Void>> deleteVehicle(@PathVariable("id") Long id) {
        vehicleService.deleteVehicle(id);
        return ResponseEntity.ok(ApiResponse.success("Vehicle deleted successfully", null));
    }
}
