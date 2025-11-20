package com.desktrade.service;

import com.desktrade.dto.ReviewRequest;
import com.desktrade.exception.BadRequestException;
import com.desktrade.exception.ResourceNotFoundException;
import com.desktrade.model.*;
import com.desktrade.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final OrderItemRepository orderItemRepository;
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;

    /**
     * Add a review for an item by a buyer. Buyer must have at least one order item for that item.
     */
    @Transactional
    public Review addReview(String buyerEmail, Long itemId, ReviewRequest req) {
        User buyer = userRepository.findByEmail(buyerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Buyer not found: " + buyerEmail));

        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found: " + itemId));

        boolean purchased = orderItemRepository.findByItemId(itemId).stream()
                .anyMatch(oi -> oi.getOrder() != null && oi.getOrder().getBuyer() != null
                        && oi.getOrder().getBuyer().getId().equals(buyer.getId()));

        if (!purchased) {
            throw new BadRequestException("User has not purchased this item and cannot review it");
        }

        if (req.getRating() == null || req.getRating() < 1 || req.getRating() > 5) {
            throw new BadRequestException("Rating must be 1..5");
        }

        // prevent duplicate review by same buyer for same item
        if (reviewRepository.existsByItemIdAndBuyerId(itemId, buyer.getId())) {
            throw new BadRequestException("User has already reviewed this item");
        }

        Review r = Review.builder()
                .item(item)
                .buyer(buyer)
                .rating(req.getRating())
                .comment(req.getComment())
                .createdAt(Instant.now())
                .build();

        return reviewRepository.save(r);
    }

    public Page<Review> listReviewsForItem(Long itemId, Pageable p) {
        return reviewRepository.findByItemId(itemId, p);
    }
}
