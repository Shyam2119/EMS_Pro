package com.ems.dto;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class LoginResponse {
    private String token;
    private String tokenType = "Bearer";
    private String username;
    private String role;
    private Long   employeeId;
    private String firstName;
    private String lastName;
    private String email;
}
