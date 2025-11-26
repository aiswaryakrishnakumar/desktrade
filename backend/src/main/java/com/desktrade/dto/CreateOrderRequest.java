// src/main/java/com/desktrade/dto/CreateOrderRequest.java
package com.desktrade.dto;

public class CreateOrderRequest {
    private Long itemId;
    private Integer quantity = 1; // optional

    public Long getItemId() { return itemId; }
    public void setItemId(Long itemId) { this.itemId = itemId; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
}
