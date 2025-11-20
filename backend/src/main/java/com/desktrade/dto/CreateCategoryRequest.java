package com.desktrade.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateCategoryRequest {
    private String name;
    private String description;
}
