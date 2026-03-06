package com.vehicle.store.service;

import com.vehicle.store.dto.BookingRequest;
import com.vehicle.store.entity.Booking;
import com.vehicle.store.enums.BookingStatus;
import com.vehicle.store.entity.User;
import com.vehicle.store.entity.Vehicle;
import com.vehicle.store.exception.ResourceNotFoundException;
import com.vehicle.store.repository.BookingRepository;
import com.vehicle.store.repository.UserRepository;
import com.vehicle.store.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;

    private Long getCurrentUserId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    public List<Booking> getUserBookings() {
        return bookingRepository.findByUserId(getCurrentUserId());
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Booking createBooking(BookingRequest request) {
        Long userId = getCurrentUserId();
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));

        if (vehicle.getStock() == null || vehicle.getStock() <= 0) {
            throw new IllegalArgumentException("Vehicle is out of stock");
        }

        vehicle.setStock(vehicle.getStock() - 1);
        vehicleRepository.save(vehicle);

        Booking booking = Booking.builder()
                .user(user)
                .vehicle(vehicle)
                .status(BookingStatus.PENDING)
                .build();

        return bookingRepository.save(booking);
    }

    public Booking updateBookingStatus(Long id, String status) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        booking.setStatus(BookingStatus.valueOf(status));
        return bookingRepository.save(booking);
    }
}
