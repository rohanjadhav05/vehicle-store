package com.vehicle.store.controller;

import com.vehicle.store.dto.ApiResponse;
import com.vehicle.store.entity.Brand;
import com.vehicle.store.service.BrandService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/brands")
@RequiredArgsConstructor
@Tag(name = "Brands", description = "Endpoints for managing vehicle brands")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class BrandController {

    private final BrandService brandService;

    @GetMapping
    @Operation(summary = "Get all brands", description = "Retrieves a list of all vehicle brands")
    public ResponseEntity<ApiResponse<List<Brand>>> getAllBrands() {
        return ResponseEntity.ok(ApiResponse.success("Brands fetched successfully", brandService.getAllBrands()));
    }

    @PostMapping
    @PreAuthorize("hasRole('A')")
    @Operation(summary = "Create a brand (Admin)", description = "Adds a new vehicle brand. Requires Admin role.")
    public ResponseEntity<ApiResponse<Brand>> createBrand(@Valid @RequestBody Brand brand) {
        return ResponseEntity.ok(ApiResponse.success("Brand created successfully", brandService.createBrand(brand)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('A')")
    @Operation(summary = "Delete a brand (Admin)", description = "Removes a vehicle brand. Requires Admin role.")
    public ResponseEntity<ApiResponse<Void>> deleteBrand(@PathVariable("id") Long id) {
        brandService.deleteBrand(id);
        return ResponseEntity.ok(ApiResponse.success("Brand deleted successfully", null));
    }
}
