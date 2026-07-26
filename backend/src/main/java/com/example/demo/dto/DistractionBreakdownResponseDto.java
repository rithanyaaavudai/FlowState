package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DistractionBreakdownResponseDto {
    private Map<String, Long> countByCategory;
    private Map<String, Long> durationSecondsByCategory;
}