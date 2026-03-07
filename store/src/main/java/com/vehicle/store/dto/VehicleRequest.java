package com.vehicle.store.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class VehicleRequest {
    @NotNull(message = "Brand ID is required")
    private Long brandId;

    @NotNull(message = "Fuel Type ID is required")
    private Long fuelTypeId;

    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than zero")
    private BigDecimal price;

    private String description;

    private String thumbnailUrl;

    private String specs; // JSON string

    private Integer stock;

    private List<String> photoUrls;
}
