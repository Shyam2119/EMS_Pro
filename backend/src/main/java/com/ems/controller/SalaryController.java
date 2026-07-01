package com.ems.controller;

import com.ems.entity.Salary;
import com.ems.service.SalaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/salaries")
@RequiredArgsConstructor
public class SalaryController {

    private final SalaryService salaryService;

    @PostMapping("/{employeeId}")
    public ResponseEntity<Salary> create(@PathVariable Long employeeId, @RequestBody Salary salary) {
        return new ResponseEntity<>(salaryService.create(employeeId, salary), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Salary>> getAll(
            @RequestParam(required = false) Long   employeeId,
            @RequestParam(required = false) String month) {
        if (employeeId != null) return ResponseEntity.ok(salaryService.getByEmployee(employeeId));
        if (month      != null) return ResponseEntity.ok(salaryService.getByMonth(month));
        return ResponseEntity.ok(salaryService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Salary> getById(@PathVariable Long id) {
        return ResponseEntity.ok(salaryService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Salary> update(@PathVariable Long id, @RequestBody Salary salary) {
        return ResponseEntity.ok(salaryService.update(id, salary));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        salaryService.delete(id);
        return ResponseEntity.ok("Salary record deleted");
    }
}
