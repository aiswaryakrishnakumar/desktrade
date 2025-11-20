package com.desktrade.dto;

import lombok.*;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequestItemDto implements Serializable {
    private Long itemId;
    private Integer quantity;
}
