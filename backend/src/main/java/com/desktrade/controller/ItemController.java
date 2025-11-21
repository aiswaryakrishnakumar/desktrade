package com.desktrade.controller;

import com.desktrade.dto.CreateItemRequest;
import com.desktrade.model.Item;
import com.desktrade.service.ItemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
public class ItemController {
    private final ItemService itemService;

    @Operation(summary = "Create an item (PENDING approval). Sellers or admins can create.", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping
    public ResponseEntity<Item> createItem(@RequestBody CreateItemRequest req, Principal principal) {
        Item created = itemService.createItem(principal.getName(), req);
        return ResponseEntity.ok(created);
    }

    @Operation(summary = "List approved items by category (public)")
    @GetMapping("/by-category/{categoryId}")
    public ResponseEntity<Page<Item>> listByCategory(
            @PathVariable Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<Item> items = itemService.listApprovedItemsByCategory(categoryId, PageRequest.of(page, size));
        return ResponseEntity.ok(items);
    }

    @Operation(summary = "Get item details (if not approved only seller/admin can view)", security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/{id}")
    public ResponseEntity<Item> getItem(@PathVariable Long id, Principal principal) {
        String email = principal == null ? null : principal.getName();
        Item item = itemService.getItemDetails(id, email);
        return ResponseEntity.ok(item);
    }

    @Operation(summary = "Admin: list pending items", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/pending")
    public ResponseEntity<Page<Item>> listPending(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "50") int size) {
        Page<Item> pageItems = itemService.listPendingItems(PageRequest.of(page, size));
        return ResponseEntity.ok(pageItems);
    }

    @Operation(summary = "Admin: approve item", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/{id}/approve")
    public ResponseEntity<Void> approveItem(@PathVariable Long id, Principal p) {
        itemService.approveItem(id, p.getName());
        // return no content to avoid serializing JPA entities (prevents Hibernate proxy serialization errors)
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Admin: reject item", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/{id}/reject")
    public ResponseEntity<Void> rejectItem(@PathVariable Long id, @RequestParam(required = false) String reason, Principal p) {
        itemService.rejectItem(id, p.getName(), reason);
        // likewise return no content
        return ResponseEntity.noContent().build();
    }
}
