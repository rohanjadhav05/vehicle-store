package com.vehicle.store.controller;

import com.vehicle.store.dto.ApiResponse;
import com.vehicle.store.dto.BookingRequest;
import com.vehicle.store.dto.BookingStatusUpdateRequest;
import com.vehicle.store.entity.Booking;
import com.vehicle.store.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@Tag(name = "Bookings", description = "Endpoints for managing vehicle bookings")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class BookingController {

    private final BookingService bookingService;

    @GetMapping
    @Operation(summary = "Get user bookings", description = "Retrieves all bookings for the currently authenticated user")
    public ResponseEntity<ApiResponse<List<Booking>>> getUserBookings() {
        return ResponseEntity.ok(ApiResponse.success("Bookings fetched successfully", bookingService.getUserBookings()));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('A')")
    @Operation(summary = "Get all bookings (Admin)", description = "Retrieves all bookings across the platform. Requires Admin role.")
    public ResponseEntity<ApiResponse<List<Booking>>> getAllBookings() {
        return ResponseEntity.ok(ApiResponse.success("All bookings fetched successfully", bookingService.getAllBookings()));
    }

    @PostMapping
    @Operation(summary = "Create a booking", description = "Creates a new vehicle booking for the authenticated user")
    public ResponseEntity<ApiResponse<Booking>> createBooking(@Valid @RequestBody BookingRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Booking created successfully", bookingService.createBooking(request)));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('A')")
    @Operation(summary = "Update booking status (Admin)", description = "Updates the status of an existing booking. Requires Admin role.")
    public ResponseEntity<ApiResponse<Booking>> updateBookingStatus(
            @PathVariable("id") Long id,
            @Valid @RequestBody BookingStatusUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Booking status updated successfully", bookingService.updateBookingStatus(id, request.getStatus())));
    }
}
