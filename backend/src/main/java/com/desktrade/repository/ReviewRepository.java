package com.desktrade.repository;

import com.desktrade.model.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    Page<Review> findByItemId(Long itemId, Pageable pageable);
    boolean existsByItemIdAndBuyerId(Long itemId, Long buyerId);
}
