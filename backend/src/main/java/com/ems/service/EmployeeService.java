package com.ems.service;

import com.ems.entity.Employee;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.DepartmentRepository;
import com.ems.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository   employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final AuditLogService      auditLogService;

    public Employee create(Employee emp) {
        if (employeeRepository.existsByEmail(emp.getEmail()))
            throw new RuntimeException("Email already in use: " + emp.getEmail());

        emp.setEmployeeCode("EMP" + String.format("%04d", employeeRepository.count() + 1));
        if (emp.getHireDate() == null) emp.setHireDate(LocalDate.now());

        Employee saved = employeeRepository.save(emp);
        auditLogService.log("CREATE", "Employee", saved.getId(), "system",
                "Created employee: " + saved.getFirstName() + " " + saved.getLastName());
        return saved;
    }

    public Employee getById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found: " + id));
    }

    public List<Employee> getAll()                         { return employeeRepository.findAll(); }
    public List<Employee> search(String q)                 { return employeeRepository.search(q); }
    public List<Employee> getByDepartment(Long deptId)     { return employeeRepository.findByDepartmentId(deptId); }
    public List<Employee> getByStatus(String status)       { return employeeRepository.findByStatus(Employee.EmployeeStatus.valueOf(status)); }

    public Employee update(Long id, Employee updated) {
        Employee e = getById(id);
        e.setFirstName(updated.getFirstName());
        e.setLastName(updated.getLastName());
        e.setEmail(updated.getEmail());
        e.setPhone(updated.getPhone());
        e.setJobTitle(updated.getJobTitle());
        e.setAddress(updated.getAddress());
        e.setStatus(updated.getStatus());
        e.setGender(updated.getGender());
        e.setDateOfBirth(updated.getDateOfBirth());
        e.setEmergencyContactName(updated.getEmergencyContactName());
        e.setEmergencyContactPhone(updated.getEmergencyContactPhone());
        e.setBasicSalary(updated.getBasicSalary());
        if (updated.getRole() != null) e.setRole(updated.getRole());

        if (updated.getDepartment() != null && updated.getDepartment().getId() != null) {
            departmentRepository.findById(updated.getDepartment().getId()).ifPresent(e::setDepartment);
        }
        Employee saved = employeeRepository.save(e);
        auditLogService.log("UPDATE", "Employee", id, "system", "Updated: " + e.getFirstName());
        return saved;
    }

    public void delete(Long id) {
        Employee e = getById(id);
        employeeRepository.deleteById(id);
        auditLogService.log("DELETE", "Employee", id, "system",
                "Deleted: " + e.getFirstName() + " " + e.getLastName());
    }

    public Employee toggleStatus(Long id) {
        Employee e = getById(id);
        e.setStatus(e.getStatus() == Employee.EmployeeStatus.ACTIVE
                ? Employee.EmployeeStatus.INACTIVE
                : Employee.EmployeeStatus.ACTIVE);
        Employee saved = employeeRepository.save(e);
        auditLogService.log("UPDATE", "Employee", id, "system",
                "Toggled status to " + saved.getStatus());
        return saved;
    }
}
