package com.ems.config;

import com.ems.service.SchedulerService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Cron triggers — actual logic lives in SchedulerService (toggleable via API).
 */
@Component
@RequiredArgsConstructor
public class SchedulerConfig {

    private final SchedulerService schedulerService;

    @Scheduled(cron = "0 0 22 * * *")
    public void autoMarkAbsent() {
        schedulerService.runIfEnabled(SchedulerService.JOB_AUTO_ABSENT, schedulerService::autoMarkAbsent);
    }

    @Scheduled(cron = "0 0 0 * * *")
    public void expireAnnouncements() {
        schedulerService.runIfEnabled(SchedulerService.JOB_EXPIRE_ANNOUNCE, schedulerService::expireAnnouncements);
    }

    @Scheduled(cron = "0 0 1 1 * *")
    public void generateMonthlySalaries() {
        schedulerService.runIfEnabled(SchedulerService.JOB_GENERATE_SALARY, schedulerService::generateMonthlySalaries);
    }

    @Scheduled(cron = "0 0 18 * * *")
    public void dailyAttendanceSummary() {
        schedulerService.runIfEnabled(SchedulerService.JOB_ATTENDANCE_SUM, schedulerService::dailyAttendanceSummary);
    }
}
