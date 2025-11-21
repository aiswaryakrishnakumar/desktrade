package com.desktrade.dto;

import com.desktrade.model.Item;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;    // <-- REQUIRED
import java.time.Instant;       // <-- REQUIRED

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ItemDto {

    private Long id;
    private String title;
    private String description;
    private BigDecimal price;
    private Integer quantity;
    private String status;
    private Long categoryId;
    private String sellerEmail;
    private Instant createdAt;
    private Instant updatedAt;

    public static ItemDto from(Item item) {
        if (item == null) return null;

        return new ItemDto(
                item.getId(),
                item.getTitle(),
                item.getDescription(),
                item.getPrice(),
                item.getQuantity(),
                item.getStatus() == null ? null : item.getStatus().name(),
                item.getCategory() == null ? null : item.getCategory().getId(),
                item.getSeller() == null ? null : item.getSeller().getEmail(),
                item.getCreatedAt(),
                item.getUpdatedAt()
        );
    }
}
