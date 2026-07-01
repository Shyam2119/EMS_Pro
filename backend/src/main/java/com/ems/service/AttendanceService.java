package com.ems.service;

import com.ems.entity.*;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository   employeeRepository;

    public Attendance checkIn(Long employeeId) {
        Employee emp  = findEmployee(employeeId);
        LocalDate today = LocalDate.now();
        Optional<Attendance> existing = attendanceRepository.findByEmployeeIdAndDate(employeeId, today);
        if (existing.isPresent()) return existing.get();

        return attendanceRepository.save(Attendance.builder()
                .employee(emp).date(today)
                .checkIn(LocalTime.now())
                .status(Attendance.AttendanceStatus.PRESENT).build());
    }

    public Attendance checkOut(Long employeeId) {
        Attendance record = attendanceRepository.findByEmployeeIdAndDate(employeeId, LocalDate.now())
                .orElseThrow(() -> new ResourceNotFoundException("No check-in found for today"));
        record.setCheckOut(LocalTime.now());
        if (record.getCheckIn() != null) {
            double hours = Duration.between(record.getCheckIn(), record.getCheckOut()).toMinutes() / 60.0;
            record.setWorkingHours(hours);
        }
        return attendanceRepository.save(record);
    }

    public Attendance mark(Long employeeId, Attendance req) {
        req.setEmployee(findEmployee(employeeId));
        return attendanceRepository.save(req);
    }

    public List<Attendance> getByEmployee(Long empId)             { return attendanceRepository.findByEmployeeId(empId); }
    public List<Attendance> getByMonth(Long empId, int yr, int m) { return attendanceRepository.findByEmployeeAndMonth(empId, yr, m); }
    public List<Attendance> getToday()                            { return attendanceRepository.findByDate(LocalDate.now()); }
    public List<Attendance> getAll()                              { return attendanceRepository.findAll(); }
    public long countPresentToday()                               { return attendanceRepository.countPresentOnDate(LocalDate.now()); }

    private Employee findEmployee(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found: " + id));
    }
}
