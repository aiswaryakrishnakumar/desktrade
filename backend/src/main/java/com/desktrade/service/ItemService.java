package com.desktrade.service;

import com.desktrade.dto.CreateItemRequest;
import com.desktrade.dto.ItemDto;
import com.desktrade.exception.BadRequestException;
import com.desktrade.exception.ResourceNotFoundException;
import com.desktrade.exception.ForbiddenException;
import com.desktrade.model.*;
import com.desktrade.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class ItemService {

    private final ItemRepository itemRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    @Transactional
    public Item createItem(String callerEmail, CreateItemRequest req) {
        if (req.getTitle() == null || req.getTitle().isBlank()) {
            throw new BadRequestException("title required");
        }

        Category cat = categoryRepository.findById(req.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + req.getCategoryId()));

        String sellerEmail = req.getSellerEmail();
        User seller;
        if (sellerEmail != null && !sellerEmail.isBlank()) {
            seller = userRepository.findByEmail(sellerEmail)
                    .orElseThrow(() -> new ResourceNotFoundException("Seller not found: " + sellerEmail));
        } else {
            seller = userRepository.findByEmail(callerEmail)
                    .orElseThrow(() -> new ResourceNotFoundException("Caller (seller) not found: " + callerEmail));
        }

        Item item = Item.builder()
                .title(req.getTitle().trim())
                .description(req.getDescription())
                .price(req.getPrice() == null ? BigDecimal.ZERO : req.getPrice())
                .quantity(req.getQuantity() == null ? 0 : req.getQuantity())
                .seller(seller)
                .category(cat)
                .status(ApprovalStatus.PENDING)
                .active(true)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        return itemRepository.save(item);
    }

    public Page<Item> listApprovedItemsByCategory(Long categoryId, Pageable p) {
        return itemRepository.findByCategoryIdAndStatusAndActiveTrue(categoryId, ApprovalStatus.APPROVED, p);
    }

    public Item getItemDetails(Long itemId, String requesterEmail) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found: " + itemId));

        if (item.getStatus() != ApprovalStatus.APPROVED) {
            if (requesterEmail == null) throw new ForbiddenException("Not allowed to view this item");

            User requester = userRepository.findByEmail(requesterEmail)
                    .orElseThrow(() -> new ResourceNotFoundException("Requester not found: " + requesterEmail));

            boolean isAdmin = "ROLE_ADMIN".equals(requester.getRole());
            boolean isSeller = item.getSeller() != null && item.getSeller().getId().equals(requester.getId());

            if (!isAdmin && !isSeller) {
                throw new ForbiddenException("Item not approved yet");
            }
        }

        return item;
    }

    @Transactional
    public ItemDto approveItem(Long id, String adminEmail) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found: " + id));

        item.setStatus(ApprovalStatus.APPROVED);
        item.setUpdatedAt(Instant.now());

        itemRepository.save(item);
        return ItemDto.from(item);
    }

    @Transactional
    public ItemDto rejectItem(Long itemId, String adminEmail, String reason) {
        Item it = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found: " + itemId));

        it.setStatus(ApprovalStatus.REJECTED);
        it.setActive(false);
        it.setUpdatedAt(Instant.now());

        itemRepository.save(it);
        return ItemDto.from(it);
    }

    @Transactional
    public Item changeQuantity(Long itemId, int delta) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found: " + itemId));

        int newQ = (item.getQuantity() == null ? 0 : item.getQuantity()) + delta;
        if (newQ < 0) throw new BadRequestException("Insufficient stock");

        item.setQuantity(newQ);
        item.setUpdatedAt(Instant.now());

        return itemRepository.save(item);
    }

    public Page<Item> listPendingItems(Pageable p) {
        return itemRepository.findByStatus(ApprovalStatus.PENDING, p);
    }
}
