package com.ems.controller;

import com.ems.entity.Employee;
import com.ems.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    @PostMapping
    public ResponseEntity<Employee> create(@RequestBody Employee emp) {
        return new ResponseEntity<>(employeeService.create(emp), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Employee> getById(@PathVariable Long id) {
        return ResponseEntity.ok(employeeService.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<Employee>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long   departmentId,
            @RequestParam(required = false) String status) {

        if (search      != null) return ResponseEntity.ok(employeeService.search(search));
        if (departmentId != null) return ResponseEntity.ok(employeeService.getByDepartment(departmentId));
        if (status      != null) return ResponseEntity.ok(employeeService.getByStatus(status));
        return ResponseEntity.ok(employeeService.getAll());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Employee> update(@PathVariable Long id, @RequestBody Employee emp) {
        return ResponseEntity.ok(employeeService.update(id, emp));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        employeeService.delete(id);
        return ResponseEntity.ok("Employee deleted successfully");
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<Employee> toggleStatus(@PathVariable Long id) {
        return ResponseEntity.ok(employeeService.toggleStatus(id));
    }
}
