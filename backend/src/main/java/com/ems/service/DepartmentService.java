package com.ems.service;

import com.ems.entity.Department;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public Department create(Department dept) {
        if (departmentRepository.existsByName(dept.getName()))
            throw new RuntimeException("Department already exists: " + dept.getName());
        return departmentRepository.save(dept);
    }

    public Department getById(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found: " + id));
    }

    public List<Department> getAll() { return departmentRepository.findAll(); }

    public Department update(Long id, Department updated) {
        Department d = getById(id);
        d.setName(updated.getName());
        d.setDescription(updated.getDescription());
        d.setLocation(updated.getLocation());
        d.setManagerName(updated.getManagerName());
        d.setBudget(updated.getBudget());
        return departmentRepository.save(d);
    }

    public void delete(Long id) {
        getById(id);
        departmentRepository.deleteById(id);
    }
}
