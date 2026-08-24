package com.vsb.erp.dto;

import lombok.*;

import java.util.List;

/**
 * Generic paginated response wrapper.
 *
 * @param <T> the type of items in the page
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PagedResponse<T> {
    private List<T> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    private boolean last;
    private boolean first;
}
