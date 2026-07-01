package com.ems.service;

import com.ems.dto.DashboardStats;
import com.ems.entity.*;
import com.ems.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final EmployeeRepository     employeeRepository;
    private final DepartmentRepository   departmentRepository;
    private final LeaveRequestRepository leaveRepository;
    private final AttendanceRepository   attendanceRepository;
    private final AuditLogRepository     auditLogRepository;

    public DashboardStats getStats() {
        // Dept distribution
        List<Map<String, Object>> deptDist = new ArrayList<>();
        employeeRepository.countGroupByDepartment().forEach(row -> {
            Map<String, Object> m = new HashMap<>();
            m.put("name", row[0]);
            m.put("count", row[1]);
            deptDist.add(m);
        });

        // Recent audit activities
        List<Map<String, Object>> activities = new ArrayList<>();
        auditLogRepository.findTop50ByOrderByTimestampDesc().stream().limit(10).forEach(log -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", log.getId());
            m.put("action", log.getAction());
            m.put("description", log.getDescription());
            m.put("performedBy", log.getPerformedBy());
            m.put("timestamp", log.getTimestamp());
            activities.add(m);
        });

        return DashboardStats.builder()
                .totalEmployees(employeeRepository.count())
                .activeEmployees(employeeRepository.countByStatus(Employee.EmployeeStatus.ACTIVE))
                .totalDepartments(departmentRepository.count())
                .pendingLeaves(leaveRepository.countByStatus(LeaveRequest.LeaveStatus.PENDING))
                .presentToday(attendanceRepository.countPresentOnDate(LocalDate.now()))
                .departmentDistribution(deptDist)
                .recentActivities(activities)
                .build();
    }
}
