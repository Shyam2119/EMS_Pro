package com.ems.repository;

import com.ems.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByEmail(String email);
    boolean existsByEmail(String email);
    List<Employee> findByDepartmentId(Long departmentId);
    List<Employee> findByStatus(Employee.EmployeeStatus status);
    long countByStatus(Employee.EmployeeStatus status);

    @Query("SELECT e FROM Employee e WHERE " +
           "LOWER(e.firstName) LIKE LOWER(CONCAT('%',:q,'%')) OR " +
           "LOWER(e.lastName)  LIKE LOWER(CONCAT('%',:q,'%')) OR " +
           "LOWER(e.email)     LIKE LOWER(CONCAT('%',:q,'%')) OR " +
           "LOWER(e.jobTitle)  LIKE LOWER(CONCAT('%',:q,'%'))")
    List<Employee> search(@Param("q") String query);

    @Query("SELECT COALESCE(e.department.name,'No Department'), COUNT(e) FROM Employee e GROUP BY e.department.name")
    List<Object[]> countGroupByDepartment();
}
