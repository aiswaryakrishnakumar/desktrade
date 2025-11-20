package com.desktrade.controller;

import com.desktrade.dto.CreateCategoryRequest;
import com.desktrade.model.Category;
import com.desktrade.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {
    private final CategoryService categoryService;

    @Operation(summary = "Create a category (created in PENDING state)", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping
    public ResponseEntity<Category> createCategory(@RequestBody CreateCategoryRequest req, Principal p) {
        // anyone authenticated can request a new category (admins will approve)
        Category created = categoryService.createCategory(req);
        return ResponseEntity.ok(created);
    }

    @Operation(summary = "List approved categories (public)")
    @GetMapping
    public ResponseEntity<Page<Category>> listApprovedCategories(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id,desc") String sort) {

        // safe and compatible Sort creation:
        Sort s = Sort.by(Sort.Direction.DESC, "id");
        Pageable p = PageRequest.of(page, size, s);
        Page<Category> cats = categoryService.listApprovedCategories(p);
        return ResponseEntity.ok(cats);
    }

    @Operation(summary = "Admin: list all categories (including pending)", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin")
    public ResponseEntity<Page<Category>> listAllCategories(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Page<Category> cats = categoryService.listAll(PageRequest.of(page, size));
        return ResponseEntity.ok(cats);
    }

    @Operation(summary = "Admin: approve category", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/approve")
    public ResponseEntity<Category> approveCategory(@PathVariable Long id, Principal p) {
        Category approved = categoryService.approveCategory(p.getName(), id);
        return ResponseEntity.ok(approved);
    }

    @Operation(summary = "Admin: reject category", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/reject")
    public ResponseEntity<Category> rejectCategory(@PathVariable Long id, @RequestParam(required = false) String reason, Principal p) {
        Category rejected = categoryService.rejectCategory(p.getName(), id, reason);
        return ResponseEntity.ok(rejected);
    }
}
