package com.vehicle.store.controller;

import com.vehicle.store.dto.ApiResponse;
import com.vehicle.store.dto.BookmarkRequest;
import com.vehicle.store.entity.Bookmark;
import com.vehicle.store.service.BookmarkService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookmarks")
@RequiredArgsConstructor
@Tag(name = "Bookmarks", description = "Endpoints for managing user vehicle bookmarks")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class BookmarkController {

    private final BookmarkService bookmarkService;

    @GetMapping
    @Operation(summary = "Get user bookmarks", description = "Retrieves all saved bookmarks for the authenticated user")
    public ResponseEntity<ApiResponse<List<Bookmark>>> getUserBookmarks() {
        return ResponseEntity.ok(ApiResponse.success("Bookmarks fetched successfully", bookmarkService.getUserBookmarks()));
    }

    @PostMapping
    @Operation(summary = "Create a bookmark", description = "Adds a vehicle to the user's bookmarks")
    public ResponseEntity<ApiResponse<Bookmark>> createBookmark(@Valid @RequestBody BookmarkRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Bookmark created successfully", bookmarkService.createBookmark(request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a bookmark", description = "Removes a vehicle bookmark from the user's saved list")
    public ResponseEntity<ApiResponse<Void>> deleteBookmark(@PathVariable("id") Long id) {
        bookmarkService.deleteBookmark(id);
        return ResponseEntity.ok(ApiResponse.success("Bookmark deleted successfully", null));
    }
}
