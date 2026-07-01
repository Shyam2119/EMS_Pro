package com.ems.controller;

import com.ems.entity.PerformanceReview;
import com.ems.service.PerformanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/performance")
@RequiredArgsConstructor
public class PerformanceController {

    private final PerformanceService performanceService;

    @PostMapping("/{employeeId}")
    public ResponseEntity<PerformanceReview> create(@PathVariable Long employeeId,
                                                    @RequestBody PerformanceReview review) {
        return new ResponseEntity<>(performanceService.create(employeeId, review), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<PerformanceReview>> getAll(
            @RequestParam(required = false) Long employeeId) {
        if (employeeId != null) return ResponseEntity.ok(performanceService.getByEmployee(employeeId));
        return ResponseEntity.ok(performanceService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PerformanceReview> getById(@PathVariable Long id) {
        return ResponseEntity.ok(performanceService.getById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        performanceService.delete(id);
        return ResponseEntity.ok("Review deleted");
    }
}
