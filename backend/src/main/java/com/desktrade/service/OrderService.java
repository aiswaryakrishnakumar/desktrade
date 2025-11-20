package com.desktrade.service;

import com.desktrade.dto.*;
import com.desktrade.exception.BadRequestException;
import com.desktrade.exception.ResourceNotFoundException;
import com.desktrade.model.*;
import com.desktrade.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;
    private final OrderItemRepository orderItemRepository;

    /**
     * Create an order for the buyer identified by buyerEmail.
     * The method is transactional: checks stock, decrements, and saves order + items atomically.
     */
    @Transactional
    public OrderResponseDto createOrder(String buyerEmail, List<OrderRequestItemDto> items) {
        if (items == null || items.isEmpty()) throw new BadRequestException("No items in order");

        User buyer = userRepository.findByEmail(buyerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Buyer not found: " + buyerEmail));

        Order order = Order.builder()
                .buyer(buyer)
                .status(OrderStatus.CREATED)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        order = orderRepository.save(order);

        BigDecimal total = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (OrderRequestItemDto req : items) {
            Item item = itemRepository.findById(req.getItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("Item not found: " + req.getItemId()));

            // Only approved and active items can be bought
            if (item.getStatus() != ApprovalStatus.APPROVED || !Boolean.TRUE.equals(item.isActive())) {
                throw new BadRequestException("Item is not available for purchase: " + item.getId());
            }

            int qty = req.getQuantity() == null ? 1 : req.getQuantity();
            if (qty <= 0) throw new BadRequestException("Quantity must be >= 1 for item: " + item.getId());

            // verify stock
            int current = item.getQuantity() == null ? 0 : item.getQuantity();
            if (current < qty) throw new BadRequestException("Insufficient stock for item: " + item.getId());

            // decrement immediately (within transaction)
            item.setQuantity(current - qty);
            itemRepository.save(item); // will flush on commit

            OrderItem oi = OrderItem.builder()
                    .order(order)
                    .item(item)
                    .quantity(qty)
                    .priceAtPurchase(item.getPrice())
                    .build();
            orderItems.add(oi);
        }

        // persist orderItems
        orderItemRepository.saveAll(orderItems);
        order.setItems(orderItems);

        // compute total
        for (OrderItem oi : orderItems) {
            total = total.add(oi.getPriceAtPurchase().multiply(new BigDecimal(oi.getQuantity())));
        }
        order.setTotalAmount(total);
        order.setStatus(OrderStatus.PAID); // mark paid for this simplified flow; in real system integrate payment gateway
        order.setUpdatedAt(Instant.now());

        Order saved = orderRepository.save(order);

        return new OrderResponseDto(saved.getId(), saved.getTotalAmount(), saved.getStatus().name());
    }

    public List<Order> getOrdersForBuyer(String buyerEmail) {
        User buyer = userRepository.findByEmail(buyerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Buyer not found: " + buyerEmail));
        return orderRepository.findByBuyerId(buyer.getId(), org.springframework.data.domain.Pageable.unpaged()).getContent();
    }

    public List<Order> getAllOrdersAsAdmin(String adminEmail) {
        // authorization check expected at controller level; just return all
        return orderRepository.findAll();
    }

    @Transactional
    public Order updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order o = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));
        o.setStatus(newStatus);
        o.setUpdatedAt(Instant.now());
        return orderRepository.save(o);
    }
}
