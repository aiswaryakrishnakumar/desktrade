package com.desktrade.service;

import com.desktrade.model.Category;
import com.desktrade.model.ApprovalStatus;
import com.desktrade.repository.CategoryRepository;
import com.desktrade.dto.CreateCategoryRequest;
import com.desktrade.exception.ResourceNotFoundException;
import com.desktrade.exception.ForbiddenException;
import com.desktrade.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository categoryRepository;

    /**
     * Create a category; initially PENDING approval.
     */
    public Category createCategory(CreateCategoryRequest req) {
        if (req.getName() == null || req.getName().isBlank()) {
            throw new BadRequestException("Category name required");
        }
        if (categoryRepository.existsByName(req.getName())) {
            throw new BadRequestException("Category with this name already exists");
        }
        Category c = Category.builder()
                .name(req.getName().trim())
                .description(req.getDescription())
                .status(ApprovalStatus.PENDING)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
        return categoryRepository.save(c);
    }

    public Page<Category> listApprovedCategories(Pageable p) {
        return categoryRepository.findByStatus(ApprovalStatus.APPROVED, p);
    }

    public Page<Category> listAll(Pageable p) {
        return categoryRepository.findAll(p);
    }

    public Category getById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + id));
    }

    @Transactional
    public Category approveCategory(String adminEmail, Long categoryId) {
        // admin authorization should be checked by controller; we optionally accept adminEmail for audit
        Category c = getById(categoryId);
        c.setStatus(ApprovalStatus.APPROVED);
        c.setUpdatedAt(Instant.now());
        return categoryRepository.save(c);
    }

    @Transactional
    public Category rejectCategory(String adminEmail, Long categoryId, String reason) {
        Category c = getById(categoryId);
        c.setStatus(ApprovalStatus.REJECTED);
        c.setUpdatedAt(Instant.now());
        // optionally persist reason in audit table; not included here
        return categoryRepository.save(c);
    }
}
