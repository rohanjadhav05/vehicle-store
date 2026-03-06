package com.vehicle.store.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VehicleImageRequest {
    @NotBlank(message = "Image URL is required")
    private String imageUrl;

    private Integer sortOrder;
}
