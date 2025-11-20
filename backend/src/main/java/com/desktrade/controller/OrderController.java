package com.desktrade.controller;

import com.desktrade.dto.*;
import com.desktrade.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;

    @Operation(summary = "Create an order (authenticated)", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping
    public ResponseEntity<OrderResponseDto> createOrder(@RequestBody List<OrderRequestItemDto> items, Principal principal) {
        OrderResponseDto resp = orderService.createOrder(principal.getName(), items);
        return ResponseEntity.ok(resp);
    }

    @Operation(summary = "Get current user's orders", security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/me")
    public ResponseEntity<List<?>> myOrders(Principal principal) {
        List<?> orders = orderService.getOrdersForBuyer(principal.getName());
        return ResponseEntity.ok(orders);
    }

    @Operation(summary = "Admin: get all orders", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/all")
    public ResponseEntity<List<?>> allOrders(Principal principal) {
        List<?> orders = orderService.getAllOrdersAsAdmin(principal.getName());
        return ResponseEntity.ok(orders);
    }

    @Operation(summary = "Admin: update order status", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/{orderId}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long orderId, @RequestParam String status) {
        // convert status string to enum
        var s = com.desktrade.model.OrderStatus.valueOf(status);
        var updated = orderService.updateOrderStatus(orderId, s);
        return ResponseEntity.ok(updated);
    }
}
