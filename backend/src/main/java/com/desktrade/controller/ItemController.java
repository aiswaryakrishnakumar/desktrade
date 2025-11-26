package com.desktrade.controller;

import com.desktrade.dto.CreateItemRequest;
import com.desktrade.dto.ItemDto;
import com.desktrade.model.Item;
import com.desktrade.service.ItemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
public class ItemController {

    private final ItemService itemService;

    // -----------------------------
    // CREATE ITEM
    // -----------------------------
    @PostMapping
    @Operation(summary = "Create an item (PENDING)", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ItemDto> createItem(@RequestBody CreateItemRequest req, Principal principal) {
        Item created = itemService.createItem(principal.getName(), req);
        return ResponseEntity.ok(ItemDto.from(created));
    }

    // -----------------------------
    // LIST APPROVED ITEMS BY CATEGORY
    // -----------------------------
    @GetMapping("/by-category/{categoryId}")
    public ResponseEntity<Page<ItemDto>> listByCategory(
            @PathVariable Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<ItemDto> items = itemService.listApprovedItemsByCategory(categoryId, PageRequest.of(page, size));
        return ResponseEntity.ok(items);
    }

    // -----------------------------
    // GET ITEM DETAILS
    // -----------------------------
    @GetMapping("/{id}")
    public ResponseEntity<ItemDto> getItem(@PathVariable Long id, Principal principal) {
        Item item = itemService.getItemDetails(id, principal != null ? principal.getName() : null);
        return ResponseEntity.ok(ItemDto.from(item));
    }

    // -----------------------------
    // ADMIN: PENDING ITEMS
    // -----------------------------
    @GetMapping("/admin/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<ItemDto>> listPending(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {

        Page<ItemDto> dto = itemService.listPendingItems(PageRequest.of(page, size));
        return ResponseEntity.ok(dto);
    }

    // -----------------------------
    // ADMIN: APPROVE
    // -----------------------------
    @PostMapping("/admin/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> approveItem(@PathVariable Long id, Principal p) {
        itemService.approveItem(id, p.getName());
        return ResponseEntity.noContent().build();
    }

    // -----------------------------
    // ADMIN: REJECT
    // -----------------------------
    @PostMapping("/admin/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> rejectItem(
            @PathVariable Long id,
            @RequestParam(required = false) String reason,
            Principal p) {

        itemService.rejectItem(id, p.getName(), reason);
        return ResponseEntity.noContent().build();
    }

    // -----------------------------
    // PUBLIC: LIST ALL APPROVED ITEMS
    // -----------------------------
    @GetMapping
    public ResponseEntity<Page<ItemDto>> listAllApprovedItems(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<ItemDto> items = itemService.listAllApproved(PageRequest.of(page, size));
        return ResponseEntity.ok(items);
    }
}



