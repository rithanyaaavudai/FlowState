package com.example.demo.controller;

import com.example.demo.service.FocusBlockService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/blocks")
public class FocusBlockController {

    private final FocusBlockService focusBlockService;

    public FocusBlockController(FocusBlockService focusBlockService) {
        this.focusBlockService = focusBlockService;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBlock(
            @PathVariable Long id,
            HttpServletRequest request) {

        Long userId = request != null && request.getAttribute("authenticatedUserId") != null
                ? (Long) request.getAttribute("authenticatedUserId")
                : 1L;

        focusBlockService.deleteBlock(id, userId);

        return ResponseEntity.noContent().build();
    }
}