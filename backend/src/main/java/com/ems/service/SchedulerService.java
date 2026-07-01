package com.ems.service;

import com.ems.entity.*;
import com.ems.repository.*;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.function.Supplier;

@Slf4j
@Service
@RequiredArgsConstructor
public class SchedulerService {

    public static final String JOB_AUTO_ABSENT      = "AUTO_MARK_ABSENT";
    public static final String JOB_EXPIRE_ANNOUNCE  = "EXPIRE_ANNOUNCEMENTS";
    public static final String JOB_GENERATE_SALARY  = "GENERATE_SALARIES";
    public static final String JOB_ATTENDANCE_SUM   = "ATTENDANCE_SUMMARY";

    private final SchedulerJobRepository schedulerJobRepository;
    private final AttendanceRepository   attendanceRepository;
    private final EmployeeRepository     employeeRepository;
    private final AnnouncementRepository announcementRepository;
    private final SalaryRepository       salaryRepository;
    private final AuditLogService        auditLogService;

    @PostConstruct
    public void seedJobs() {
        seedJob(JOB_AUTO_ABSENT,     "Auto Mark Absent",        "Mark employees absent if no check-in by 10 PM",           "0 0 22 * * *");
        seedJob(JOB_EXPIRE_ANNOUNCE, "Expire Announcements",    "Deactivate announcements past their expiry date",       "0 0 0 * * *");
        seedJob(JOB_GENERATE_SALARY, "Generate Monthly Salaries","Create salary records for all active employees",         "0 0 1 1 * *");
        seedJob(JOB_ATTENDANCE_SUM,  "Daily Attendance Summary","Log present vs active employee count every evening",       "0 0 18 * * *");
    }

    private void seedJob(String key, String name, String desc, String cron) {
        if (schedulerJobRepository.findByJobKey(key).isEmpty()) {
            schedulerJobRepository.save(SchedulerJobConfig.builder()
                .jobKey(key).name(name).description(desc)
                .cronExpression(cron).enabled(true).build());
        }
    }

    public List<SchedulerJobConfig> getAllJobs() {
        return schedulerJobRepository.findAll();
    }

    @Transactional
    public SchedulerJobConfig toggleJob(String jobKey, boolean enabled) {
        SchedulerJobConfig job = findJob(jobKey);
        job.setEnabled(enabled);
        return schedulerJobRepository.save(job);
    }

    @Transactional
    public SchedulerJobConfig runJob(String jobKey) {
        return switch (jobKey) {
            case JOB_AUTO_ABSENT      -> recordRun(jobKey, autoMarkAbsent());
            case JOB_EXPIRE_ANNOUNCE  -> recordRun(jobKey, expireAnnouncements());
            case JOB_GENERATE_SALARY  -> recordRun(jobKey, generateMonthlySalaries());
            case JOB_ATTENDANCE_SUM   -> recordRun(jobKey, dailyAttendanceSummary());
            default -> throw new RuntimeException("Unknown job: " + jobKey);
        };
    }

    public void runIfEnabled(String jobKey, Supplier<String> task) {
        schedulerJobRepository.findByJobKey(jobKey).ifPresent(job -> {
            if (job.isEnabled()) {
                recordRun(jobKey, task.get());
            } else {
                log.debug("[Scheduler] Job '{}' is disabled — skipping.", jobKey);
            }
        });
    }

    private SchedulerJobConfig recordRun(String jobKey, String result) {
        SchedulerJobConfig job = findJob(jobKey);
        job.setLastRunAt(LocalDateTime.now());
        job.setLastRunResult(result);
        return schedulerJobRepository.save(job);
    }

    private SchedulerJobConfig findJob(String jobKey) {
        return schedulerJobRepository.findByJobKey(jobKey)
            .orElseThrow(() -> new RuntimeException("Scheduler job not found: " + jobKey));
    }

    // ── Job implementations ────────────────────────────────────────────────

    public String autoMarkAbsent() {
        log.info("[Scheduler] Running auto-mark-absent job...");
        LocalDate today = LocalDate.now();
        List<Employee> activeEmployees = employeeRepository.findByStatus(Employee.EmployeeStatus.ACTIVE);
        int marked = 0;
        for (Employee emp : activeEmployees) {
            boolean alreadyMarked = attendanceRepository.findByEmployeeIdAndDate(emp.getId(), today).isPresent();
            if (!alreadyMarked) {
                attendanceRepository.save(Attendance.builder()
                    .employee(emp).date(today)
                    .status(Attendance.AttendanceStatus.ABSENT)
                    .notes("Auto-marked absent by scheduler")
                    .build());
                marked++;
            }
        }
        if (marked > 0) {
            auditLogService.log("SCHEDULER_ABSENT", "Attendance", null, "system",
                "Auto-marked " + marked + " employees as absent for " + today);
        }
        String result = "Marked " + marked + " employees absent for " + today;
        log.info("[Scheduler] {}", result);
        return result;
    }

    public String expireAnnouncements() {
        log.info("[Scheduler] Checking for expired announcements...");
        List<Announcement> active = announcementRepository.findByActiveTrueOrderByPostedAtDesc();
        LocalDateTime now = LocalDateTime.now();
        int expired = 0;
        for (Announcement a : active) {
            if (a.getExpiresAt() != null && a.getExpiresAt().isBefore(now)) {
                a.setActive(false);
                announcementRepository.save(a);
                expired++;
            }
        }
        String result = "Expired " + expired + " announcements";
        log.info("[Scheduler] {}", result);
        return result;
    }

    public String generateMonthlySalaries() {
        String month = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
        log.info("[Scheduler] Generating salary records for month: {}", month);
        List<Employee> activeEmployees = employeeRepository.findByStatus(Employee.EmployeeStatus.ACTIVE);
        int generated = 0;
        for (Employee emp : activeEmployees) {
            boolean exists = salaryRepository.findByEmployeeIdAndMonth(emp.getId(), month).isPresent();
            if (!exists && emp.getBasicSalary() != null) {
                BigDecimal basic = emp.getBasicSalary();
                BigDecimal hra   = basic.multiply(new BigDecimal("0.20"));
                BigDecimal trans = new BigDecimal("2000");
                BigDecimal pf    = basic.multiply(new BigDecimal("0.12"));
                BigDecimal tax   = basic.multiply(new BigDecimal("0.10"));
                BigDecimal net   = basic.add(hra).add(trans).subtract(pf).subtract(tax);

                salaryRepository.save(Salary.builder()
                    .employee(emp).month(month)
                    .basicSalary(basic).hra(hra).transport(trans)
                    .pfDeduction(pf).taxDeduction(tax)
                    .netPay(net)
                    .paymentStatus(Salary.PaymentStatus.PENDING)
                    .build());
                generated++;
            }
        }
        auditLogService.log("SCHEDULER_SALARY", "Salary", null, "system",
            "Auto-generated " + generated + " salary records for " + month);
        String result = "Generated " + generated + " salary records for " + month;
        log.info("[Scheduler] {}", result);
        return result;
    }

    public String dailyAttendanceSummary() {
        LocalDate today = LocalDate.now();
        long present = attendanceRepository.countPresentOnDate(today);
        long total   = employeeRepository.countByStatus(Employee.EmployeeStatus.ACTIVE);
        auditLogService.log("SCHEDULER_ATTENDANCE_SUMMARY", "Attendance", null, "system",
            "Daily summary: " + present + "/" + total + " employees present on " + today);
        String result = present + "/" + total + " present on " + today;
        log.info("[Scheduler] Daily summary: {}", result);
        return result;
    }
}
