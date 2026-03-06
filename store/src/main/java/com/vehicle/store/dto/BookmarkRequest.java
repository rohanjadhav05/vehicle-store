package com.vehicle.store.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BookmarkRequest {
    @NotNull(message = "Vehicle ID is required")
    private Long vehicleId;
}
