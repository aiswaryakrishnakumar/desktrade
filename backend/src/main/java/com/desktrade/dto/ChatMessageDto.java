package com.desktrade.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDto {
    private Long chatId;
    private String content;
}
