// // package com.desktrade.dto;

// // import com.desktrade.model.Item;
// // import lombok.AllArgsConstructor;
// // import lombok.Data;
// // import lombok.NoArgsConstructor;

// // import java.math.BigDecimal;    // <-- REQUIRED
// // import java.time.Instant;       // <-- REQUIRED

// // @Data
// // @AllArgsConstructor
// // @NoArgsConstructor
// // public class ItemDto {

// //     private Long id;
// //     private String title;
// //     private String description;
// //     private BigDecimal price;
// //     private Integer quantity;
// //     private String status;
// //     private Long categoryId;
// //     private String sellerEmail;
// //     private Instant createdAt;
// //     private Instant updatedAt;

// //     public static ItemDto from(Item item) {
// //         if (item == null) return null;

// //         return new ItemDto(
// //                 item.getId(),
// //                 item.getTitle(),
// //                 item.getDescription(),
// //                 item.getPrice(),
// //                 item.getQuantity(),
// //                 item.getStatus() == null ? null : item.getStatus().name(),
// //                 item.getCategory() == null ? null : item.getCategory().getId(),
// //                 item.getSeller() == null ? null : item.getSeller().getEmail(),
// //                 item.getCreatedAt(),
// //                 item.getUpdatedAt()
// //         );
// //     }
// // }

// package com.desktrade.dto;

// import com.desktrade.model.Item;
// import com.desktrade.model.User;
// import lombok.*;
// import java.math.BigDecimal;
// import java.time.Instant;
// import java.lang.reflect.Method;

// /**
//  * DTO for exposing Item safely to controllers / clients.
//  */
// @Data
// @Builder
// @NoArgsConstructor
// @AllArgsConstructor
// public class ItemDto {
//     private Long id;
//     private String title;
//     private String description;
//     private BigDecimal price;
//     private Integer quantity;
//     private Long categoryId;
//     private String categoryName;
//     private String sellerEmail;
//     private String image;
//     private String status;
//     private Boolean active;
//     private Instant createdAt;
//     private Instant updatedAt;

//     public static ItemDto from(Item item) {
//         if (item == null) return null;

//         Long catId = null;
//         String catName = null;
//         if (item.getCategory() != null) {
//             Object cid = item.getCategory().getId();
//             if (cid instanceof Long) catId = (Long) cid;
//             else if (cid instanceof Integer) catId = Long.valueOf((Integer) cid);
//             else if (cid != null) {
//                 try { catId = Long.valueOf(String.valueOf(cid)); } catch (Exception ignored) {}
//             }
//             catName = item.getCategory().getName();
//         }

//         String sellerEmail = null;
//         User seller = item.getSeller();
//         if (seller != null) sellerEmail = seller.getEmail();

//         // Determine active flag using reflection to avoid compile-time coupling
//         Boolean activeValue = null;
//         try {
//             // Try isActive()
//             Method isActive = item.getClass().getMethod("isActive");
//             Object v = isActive.invoke(item);
//             if (v instanceof Boolean) activeValue = (Boolean) v;
//         } catch (NoSuchMethodException e1) {
//             try {
//                 // Try getActive()
//                 Method getActive = item.getClass().getMethod("getActive");
//                 Object v2 = getActive.invoke(item);
//                 if (v2 instanceof Boolean) activeValue = (Boolean) v2;
//             } catch (NoSuchMethodException e2) {
//                 // No accessor found: leave as null
//                 activeValue = null;
//             } catch (Throwable t2) {
//                 activeValue = null;
//             }
//         } catch (Throwable t) {
//             // Unexpected reflection error: swallow and continue
//             activeValue = null;
//         }

//         return ItemDto.builder()
//                 .id(item.getId())
//                 .title(item.getTitle())
//                 .description(item.getDescription())
//                 .price(item.getPrice())
//                 .quantity(item.getQuantity())
//                 .categoryId(catId)
//                 .categoryName(catName)
//                 .sellerEmail(sellerEmail)
//                 .image(item.getImage())
//                 .status(item.getStatus() != null ? item.getStatus().name() : null)
//                 .active(activeValue)
//                 .createdAt(item.getCreatedAt())
//                 .updatedAt(item.getUpdatedAt())
//                 .build();
//     }
// }


package com.desktrade.dto;

import com.desktrade.model.Item;
import lombok.Data;

@Data
public class ItemDto {
    private Long id;
    private String title;
    private String description;
    private String status;
    private String image;
    private Integer quantity;
    private Double price;
    private String categoryName;
    private Long categoryId;
    private String sellerEmail;

    public static ItemDto from(Item item) {
        ItemDto d = new ItemDto();
        d.setId(item.getId());
        d.setTitle(item.getTitle());
        d.setDescription(item.getDescription());
        d.setStatus(item.getStatus().name());
        d.setQuantity(item.getQuantity());
        d.setPrice(item.getPrice() != null ? item.getPrice().doubleValue() : 0);

        if (item.getCategory() != null) {
            d.setCategoryId(item.getCategory().getId());
            d.setCategoryName(item.getCategory().getName());
        }

        if (item.getSeller() != null) {
            d.setSellerEmail(item.getSeller().getEmail());
        }

        return d;
    }
}



