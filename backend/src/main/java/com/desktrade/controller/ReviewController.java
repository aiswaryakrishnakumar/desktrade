package com.desktrade.controller;

import com.desktrade.dto.ReviewRequest;
import com.desktrade.model.Review;
import com.desktrade.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/items/{itemId}/reviews")
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewService reviewService;

    @Operation(summary = "Add review for an item you bought", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping
    public ResponseEntity<Review> addReview(@PathVariable Long itemId, @RequestBody ReviewRequest req, Principal principal) {
        Review r = reviewService.addReview(principal.getName(), itemId, req);
        return ResponseEntity.ok(r);
    }

    @Operation(summary = "List reviews for an item")
    @GetMapping
    public ResponseEntity<Page<Review>> listReviews(@PathVariable Long itemId,
                                                    @RequestParam(defaultValue = "0") int page,
                                                    @RequestParam(defaultValue = "20") int size) {
        Page<Review> p = reviewService.listReviewsForItem(itemId, PageRequest.of(page, size));
        return ResponseEntity.ok(p);
    }
}
