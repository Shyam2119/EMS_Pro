package com.ems.service;

import com.ems.entity.*;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PerformanceService {

    private final PerformanceReviewRepository reviewRepository;
    private final EmployeeRepository          employeeRepository;

    public PerformanceReview create(Long employeeId, PerformanceReview review) {
        review.setEmployee(employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found: " + employeeId)));
        return reviewRepository.save(review);
    }

    public PerformanceReview getById(Long id) {
        return reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found: " + id));
    }

    public List<PerformanceReview> getAll()                 { return reviewRepository.findAll(); }
    public List<PerformanceReview> getByEmployee(Long empId){ return reviewRepository.findByEmployeeId(empId); }
    public void delete(Long id)                             { reviewRepository.deleteById(id); }
}
