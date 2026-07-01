package com.ems.controller;

import com.ems.entity.Attendance;
import com.ems.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/checkin/{employeeId}")
    public ResponseEntity<Attendance> checkIn(@PathVariable Long employeeId) {
        return ResponseEntity.ok(attendanceService.checkIn(employeeId));
    }

    @PatchMapping("/checkout/{employeeId}")
    public ResponseEntity<Attendance> checkOut(@PathVariable Long employeeId) {
        return ResponseEntity.ok(attendanceService.checkOut(employeeId));
    }

    @PostMapping("/mark/{employeeId}")
    public ResponseEntity<Attendance> mark(@PathVariable Long employeeId,
                                           @RequestBody Attendance attendance) {
        return new ResponseEntity<>(attendanceService.mark(employeeId, attendance), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Attendance>> getAll(
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {

        if (employeeId != null && year != null && month != null)
            return ResponseEntity.ok(attendanceService.getByMonth(employeeId, year, month));
        if (employeeId != null)
            return ResponseEntity.ok(attendanceService.getByEmployee(employeeId));
        return ResponseEntity.ok(attendanceService.getAll());
    }

    @GetMapping("/today")
    public ResponseEntity<List<Attendance>> getToday() {
        return ResponseEntity.ok(attendanceService.getToday());
    }

    @GetMapping("/present-count")
    public ResponseEntity<Long> getPresentCount() {
        return ResponseEntity.ok(attendanceService.countPresentToday());
    }
}
