package com.vehicle.store.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class BookingStatusUpdateRequest {
    @NotBlank(message = "Status is required")
    @Pattern(regexp = "^(CONFIRMED|CANCELLED)$", message = "Status must be either CONFIRMED or CANCELLED")
    private String status;
}
