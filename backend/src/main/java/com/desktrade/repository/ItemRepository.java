package com.desktrade.repository;

import com.desktrade.model.ApprovalStatus;
import com.desktrade.model.Item;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {
    Page<Item> findByCategoryIdAndStatusAndActiveTrue(Long categoryId, ApprovalStatus status, Pageable pageable);
    Page<Item> findBySellerId(Long sellerId, Pageable pageable);
    Page<Item> findByStatus(ApprovalStatus status, Pageable pageable);
    List<Item> findBySellerIdAndStatus(Long sellerId, ApprovalStatus status);
}
