package com.desktrade.dto;

import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateItemRequest {
    private String title;
    private String description;
    private BigDecimal price;
    private Integer quantity;
    private Long categoryId;
    // sellerEmail optional (admin can create for another seller); otherwise server uses authenticated user as seller
    private String sellerEmail;
}
