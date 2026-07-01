package com.ems.dto;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class RegisterRequest {
    private String username;
    private String password;
    private String role;       // ADMIN | EMPLOYEE | MANAGER | HR
    private Long   employeeId; // optional — link to existing employee
}
