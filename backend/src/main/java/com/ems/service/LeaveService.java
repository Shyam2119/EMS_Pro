package com.ems.service;

import com.ems.entity.*;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaveService {

    private final LeaveRequestRepository leaveRepository;
    private final EmployeeRepository     employeeRepository;
    private final AuditLogService        auditLogService;

    public LeaveRequest apply(Long employeeId, LeaveRequest request) {
        Employee emp = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found: " + employeeId));
        request.setEmployee(emp);
        request.setStatus(LeaveRequest.LeaveStatus.PENDING);
        LeaveRequest saved = leaveRepository.save(request);
        auditLogService.log("LEAVE_APPLY", "LeaveRequest", saved.getId(),
                emp.getFirstName(), "Applied: " + request.getLeaveType());
        return saved;
    }

    public LeaveRequest process(Long leaveId, String status, String remarks, String processedBy) {
        LeaveRequest leave = getById(leaveId);
        leave.setStatus(LeaveRequest.LeaveStatus.valueOf(status));
        leave.setAdminRemarks(remarks);
        leave.setApprovedBy(processedBy);
        leave.setProcessedAt(LocalDateTime.now());
        return leaveRepository.save(leave);
    }

    public LeaveRequest getById(Long id) {
        return leaveRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave not found: " + id));
    }

    public List<LeaveRequest> getAll()                     { return leaveRepository.findAll(); }
    public List<LeaveRequest> getByEmployee(Long empId)    { return leaveRepository.findByEmployeeId(empId); }
    public List<LeaveRequest> getByStatus(String status)   { return leaveRepository.findByStatus(LeaveRequest.LeaveStatus.valueOf(status)); }
    public void delete(Long id)                            { leaveRepository.deleteById(id); }
}
