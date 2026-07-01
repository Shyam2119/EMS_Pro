package com.ems.repository;

import com.ems.entity.Salary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SalaryRepository extends JpaRepository<Salary, Long> {
    List<Salary>     findByEmployeeId(Long employeeId);
    List<Salary>     findByMonth(String month);
    Optional<Salary> findByEmployeeIdAndMonth(Long employeeId, String month);
}
