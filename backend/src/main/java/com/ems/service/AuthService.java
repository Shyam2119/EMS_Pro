package com.ems.service;

import com.ems.dto.*;
import com.ems.entity.*;
import com.ems.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.ems.security.JwtTokenProvider;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authManager;
    private final JwtTokenProvider      jwtTokenProvider;
    private final UserRepository        userRepository;
    private final EmployeeRepository    employeeRepository;
    private final PasswordEncoder       passwordEncoder;

    public LoginResponse login(LoginRequest req) {
        var auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword()));

        String token = jwtTokenProvider.generateToken(auth);
        User user = userRepository.findByUsername(req.getUsername()).orElseThrow();

        LoginResponse.LoginResponseBuilder b = LoginResponse.builder()
                .token(token).tokenType("Bearer")
                .username(user.getUsername()).role(user.getRole().name());

        if (user.getEmployee() != null) {
            Employee e = user.getEmployee();
            b.employeeId(e.getId()).firstName(e.getFirstName())
             .lastName(e.getLastName()).email(e.getEmail());
        }
        return b.build();
    }

    public String register(RegisterRequest req) {
        if (userRepository.existsByUsername(req.getUsername()))
            throw new RuntimeException("Username already taken: " + req.getUsername());

        // Security: always register new users as EMPLOYEE to prevent role escalation via API
        User.UserBuilder ub = User.builder()
            .username(req.getUsername())
            .password(passwordEncoder.encode(req.getPassword()))
            .role(Employee.Role.EMPLOYEE)
            .enabled(true);

        if (req.getEmployeeId() != null) {
            if (!employeeRepository.existsById(req.getEmployeeId()))
                throw new RuntimeException("Employee not found");
            if (userRepository.existsByEmployee_Id(req.getEmployeeId()))
                throw new RuntimeException("Employee already has an associated user account");
            Employee e = employeeRepository.findById(req.getEmployeeId())
                    .orElseThrow(() -> new RuntimeException("Employee not found"));
            ub.employee(e);
        }
        userRepository.save(ub.build());
        return "User registered successfully";
    }
}
