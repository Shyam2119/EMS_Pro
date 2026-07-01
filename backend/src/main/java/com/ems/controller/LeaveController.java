package com.ems.controller;

import com.ems.entity.LeaveRequest;
import com.ems.service.LeaveService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leaves")
@RequiredArgsConstructor
public class LeaveController {

    private final LeaveService leaveService;

    @PostMapping("/apply/{employeeId}")
    public ResponseEntity<LeaveRequest> apply(@PathVariable Long employeeId,
                                              @RequestBody LeaveRequest request) {
        return new ResponseEntity<>(leaveService.apply(employeeId, request), HttpStatus.CREATED);
    }

    @PatchMapping("/{id}/process")
    public ResponseEntity<LeaveRequest> process(@PathVariable Long id,
                                                @RequestBody Map<String, String> body,
                                                Principal principal) {
        return ResponseEntity.ok(leaveService.process(
                id, body.get("status"), body.get("remarks"),
                principal != null ? principal.getName() : "admin"));
    }

    @GetMapping
    public ResponseEntity<List<LeaveRequest>> getAll(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long   employeeId) {
        if (employeeId != null) return ResponseEntity.ok(leaveService.getByEmployee(employeeId));
        if (status     != null) return ResponseEntity.ok(leaveService.getByStatus(status));
        return ResponseEntity.ok(leaveService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LeaveRequest> getById(@PathVariable Long id) {
        return ResponseEntity.ok(leaveService.getById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        leaveService.delete(id);
        return ResponseEntity.ok("Leave request deleted");
    }
}
