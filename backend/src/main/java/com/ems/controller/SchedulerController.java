package com.ems.controller;

import com.ems.entity.SchedulerJobConfig;
import com.ems.service.SchedulerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/scheduler")
@RequiredArgsConstructor
public class SchedulerController {

    private final SchedulerService schedulerService;

    @GetMapping("/jobs")
    public ResponseEntity<List<SchedulerJobConfig>> getJobs() {
        return ResponseEntity.ok(schedulerService.getAllJobs());
    }

    @PatchMapping("/jobs/{jobKey}/toggle")
    public ResponseEntity<SchedulerJobConfig> toggleJob(
            @PathVariable String jobKey,
            @RequestBody Map<String, Boolean> body) {
        boolean enabled = body.getOrDefault("enabled", true);
        return ResponseEntity.ok(schedulerService.toggleJob(jobKey, enabled));
    }

    @PostMapping("/jobs/{jobKey}/run")
    public ResponseEntity<SchedulerJobConfig> runJob(@PathVariable String jobKey) {
        return ResponseEntity.ok(schedulerService.runJob(jobKey));
    }
}
