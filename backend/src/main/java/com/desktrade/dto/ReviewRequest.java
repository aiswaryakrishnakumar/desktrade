package com.desktrade.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewRequest {
    private Integer rating;
    private String comment;
}
