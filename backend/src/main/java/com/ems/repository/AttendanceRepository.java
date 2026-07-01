package com.ems.repository;

import com.ems.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByEmployeeId(Long employeeId);
    List<Attendance> findByDate(LocalDate date);
    Optional<Attendance> findByEmployeeIdAndDate(Long employeeId, LocalDate date);

    @Query("SELECT a FROM Attendance a WHERE a.employee.id = :empId " +
           "AND YEAR(a.date) = :year AND MONTH(a.date) = :month")
    List<Attendance> findByEmployeeAndMonth(@Param("empId")  Long empId,
                                            @Param("year")   int  year,
                                            @Param("month")  int  month);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.status = 'PRESENT' AND a.date = :date")
    long countPresentOnDate(@Param("date") LocalDate date);
}
