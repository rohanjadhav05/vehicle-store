package com.vehicle.store.controller;

import com.vehicle.store.dto.ApiResponse;
import com.vehicle.store.entity.FuelType;
import com.vehicle.store.service.FuelTypeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fuel-types")
@RequiredArgsConstructor
@Tag(name = "Fuel Types", description = "Endpoints for managing vehicle fuel types")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class FuelTypeController {

    private final FuelTypeService fuelTypeService;

    @GetMapping
    @Operation(summary = "Get all fuel types", description = "Retrieves a list of all supported vehicle fuel types")
    public ResponseEntity<ApiResponse<List<FuelType>>> getAllFuelTypes() {
        return ResponseEntity.ok(ApiResponse.success("Fuel types fetched successfully", fuelTypeService.getAllFuelTypes()));
    }

    @PostMapping
    @Operation(summary = "Create fuel type (Admin)", description = "Adds a new vehicle fuel type. Requires Admin role.")
    public ResponseEntity<ApiResponse<FuelType>> createFuelType(@Valid @RequestBody FuelType fuelType) {
        return ResponseEntity.ok(ApiResponse.success("Fuel type created successfully", fuelTypeService.createFuelType(fuelType)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete fuel type (Admin)", description = "Removes a vehicle fuel type. Requires Admin role.")
    public ResponseEntity<ApiResponse<Void>> deleteFuelType(@PathVariable("id") Long id) {
        fuelTypeService.deleteFuelType(id);
        return ResponseEntity.ok(ApiResponse.success("Fuel type deleted successfully", null));
    }
}
