package com.vehicle.store.service;

import com.vehicle.store.dto.BookmarkRequest;
import com.vehicle.store.entity.Bookmark;
import com.vehicle.store.entity.User;
import com.vehicle.store.entity.Vehicle;
import com.vehicle.store.exception.AccessDeniedException;
import com.vehicle.store.exception.DuplicateResourceException;
import com.vehicle.store.exception.ResourceNotFoundException;
import com.vehicle.store.repository.BookmarkRepository;
import com.vehicle.store.repository.UserRepository;
import com.vehicle.store.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookmarkService {

    private final BookmarkRepository bookmarkRepository;
    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;

    private Long getCurrentUserId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    public List<Bookmark> getUserBookmarks() {
        return bookmarkRepository.findByUserId(getCurrentUserId());
    }

    public Bookmark createBookmark(BookmarkRequest request) {
        Long userId = getCurrentUserId();
        
        if (bookmarkRepository.existsByUserIdAndVehicleId(userId, request.getVehicleId())) {
            throw new DuplicateResourceException("Vehicle is already bookmarked by the user");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));

        Bookmark bookmark = Bookmark.builder()
                .user(user)
                .vehicle(vehicle)
                .build();

        return bookmarkRepository.save(bookmark);
    }

    public void deleteBookmark(Long id) {
        Long userId = getCurrentUserId();
        Bookmark bookmark = bookmarkRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bookmark not found"));

        if (!bookmark.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You don't have permission to delete this bookmark");
        }

        bookmarkRepository.deleteById(id);
    }
}
