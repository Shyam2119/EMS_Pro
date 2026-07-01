package com.ems.dto;

import lombok.*;
import java.util.List;
import java.util.Map;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DashboardStats {
    private long totalEmployees;
    private long activeEmployees;
    private long totalDepartments;
    private long pendingLeaves;
    private long presentToday;
    private List<Map<String, Object>> departmentDistribution;
    private List<Map<String, Object>> recentActivities;
}
