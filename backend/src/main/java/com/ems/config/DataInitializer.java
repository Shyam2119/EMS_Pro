package com.ems.config;

import com.ems.entity.Department;
import com.ems.entity.Employee;
import com.ems.entity.User;
import com.ems.repository.DepartmentRepository;
import com.ems.repository.EmployeeRepository;
import com.ems.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository       userRepository;
    private final EmployeeRepository   employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder      passwordEncoder;

    @Override
    public void run(String... args) {
        seedDepartments();
        seedAdminUser();
        seedSampleEmployees();
    }

    // ── Departments ────────────────────────────────────────────────────────
    private void seedDepartments() {
        if (departmentRepository.count() > 0) return;
        log.info("Seeding departments...");

        List<Department> departments = List.of(
            Department.builder().name("Engineering")     .description("Software development and architecture").location("Floor 3").managerName("Alice Johnson").budget(1500000.0).build(),
            Department.builder().name("Human Resources") .description("People operations and recruitment")    .location("Floor 1").managerName("Bob Smith")    .budget(500000.0) .build(),
            Department.builder().name("Finance")         .description("Accounts and financial planning")       .location("Floor 2").managerName("Carol Davis")  .budget(800000.0) .build(),
            Department.builder().name("Marketing")       .description("Brand and digital marketing")           .location("Floor 2").managerName("Dan Wilson")   .budget(700000.0) .build(),
            Department.builder().name("Operations")      .description("Business operations and logistics")     .location("Floor 1").managerName("Eve Moore")    .budget(600000.0) .build()
        );
        departmentRepository.saveAll(departments);
        log.info("Seeded {} departments.", departments.size());
    }

    // ── Admin User ─────────────────────────────────────────────────────────
    private void seedAdminUser() {
        if (userRepository.existsByUsername("admin")) {
            log.info("Admin user already exists — skipping.");
            return;
        }
        log.info("Creating default admin user...");

        // Create admin employee record
        Employee adminEmp = Employee.builder()
            .firstName("System")
            .lastName("Administrator")
            .email("admin@ems.com")
            .phone("+91 9000000000")
            .jobTitle("System Administrator")
            .status(Employee.EmployeeStatus.ACTIVE)
            .role(Employee.Role.ADMIN)
            .hireDate(LocalDate.now())
            .employeeCode("EMP0001")
            .basicSalary(new BigDecimal("150000"))
            .build();

        Department dept = departmentRepository.findByName("Human Resources").orElse(null);
        if (dept != null) adminEmp.setDepartment(dept);

        Employee savedEmp = employeeRepository.save(adminEmp);

        // Create login credentials
        User adminUser = User.builder()
            .username("admin")
            .password(passwordEncoder.encode("admin123"))
            .role(Employee.Role.ADMIN)
            .employee(savedEmp)
            .enabled(true)
            .build();
        userRepository.save(adminUser);

        log.info("✅ Admin user created — username: admin | password: admin123");
    }

    // ── Sample Employees ───────────────────────────────────────────────────
    private void seedSampleEmployees() {
        if (employeeRepository.count() > 1) {
            log.info("Sample employees already exist — skipping.");
            return;
        }
        log.info("Seeding sample employees...");

        Department eng  = departmentRepository.findByName("Engineering")    .orElse(null);
        Department hr   = departmentRepository.findByName("Human Resources") .orElse(null);
        Department fin  = departmentRepository.findByName("Finance")         .orElse(null);
        Department mkt  = departmentRepository.findByName("Marketing")       .orElse(null);
        Department ops  = departmentRepository.findByName("Operations")      .orElse(null);

        List<Employee> employees = List.of(
            buildEmp("EMP0002","Priya",  "Sharma",   "priya@ems.com",  "+91 9111111111","Senior Java Developer",      eng,  Employee.Role.EMPLOYEE, Employee.EmployeeStatus.ACTIVE,    "2022-03-15", 95000),
            buildEmp("EMP0003","Rahul",  "Verma",    "rahul@ems.com",  "+91 9222222222","React Developer",             eng,  Employee.Role.EMPLOYEE, Employee.EmployeeStatus.ACTIVE,    "2021-07-01", 80000),
            buildEmp("EMP0004","Anjali", "Singh",    "anjali@ems.com", "+91 9333333333","HR Manager",                  hr,   Employee.Role.MANAGER,  Employee.EmployeeStatus.ACTIVE,    "2020-01-10", 70000),
            buildEmp("EMP0005","Kiran",  "Patel",    "kiran@ems.com",  "+91 9444444444","Financial Analyst",            fin,  Employee.Role.EMPLOYEE, Employee.EmployeeStatus.ACTIVE,    "2023-06-01", 65000),
            buildEmp("EMP0006","Arjun",  "Nair",     "arjun@ems.com",  "+91 9555555555","Marketing Lead",              mkt,  Employee.Role.MANAGER,  Employee.EmployeeStatus.ACTIVE,    "2021-09-15", 85000),
            buildEmp("EMP0007","Sneha",  "Reddy",    "sneha@ems.com",  "+91 9666666666","Operations Manager",           ops,  Employee.Role.MANAGER,  Employee.EmployeeStatus.ACTIVE,    "2019-04-20", 90000),
            buildEmp("EMP0008","Vikram", "Kumar",    "vikram@ems.com", "+91 9777777777","DevOps Engineer",              eng,  Employee.Role.EMPLOYEE, Employee.EmployeeStatus.ACTIVE,    "2022-11-01", 78000),
            buildEmp("EMP0009","Meera",  "Joshi",    "meera@ems.com",  "+91 9888888888","UI/UX Designer",              mkt,  Employee.Role.EMPLOYEE, Employee.EmployeeStatus.ON_LEAVE,  "2023-02-14", 72000),
            buildEmp("EMP0010","Suresh", "Menon",    "suresh@ems.com", "+91 9999999999","QA Engineer",                 eng,  Employee.Role.EMPLOYEE, Employee.EmployeeStatus.ACTIVE,    "2020-08-08", 68000),
            buildEmp("EMP0011","Divya",  "Iyer",     "divya@ems.com",  "+91 9100000000","Accountant",                  fin,  Employee.Role.EMPLOYEE, Employee.EmployeeStatus.ACTIVE,    "2021-03-01", 60000)
        );

        employeeRepository.saveAll(employees);

        // Create login accounts for sample employees
        employees.forEach(emp -> {
            String uname = emp.getFirstName().toLowerCase();
            if (!userRepository.existsByUsername(uname)) {
                userRepository.save(User.builder()
                    .username(uname)
                    .password(passwordEncoder.encode("password123"))
                    .role(emp.getRole())
                    .employee(emp)
                    .enabled(true)
                    .build());
            }
        });

        log.info("✅ Seeded {} sample employees (each can login with 'firstname' / 'password123').", employees.size());
    }

    private Employee buildEmp(String code, String first, String last, String email, String phone,
                              String title, Department dept, Employee.Role role,
                              Employee.EmployeeStatus status, String hireDate, int salary) {
        return Employee.builder()
            .employeeCode(code)
            .firstName(first).lastName(last)
            .email(email).phone(phone)
            .jobTitle(title)
            .department(dept)
            .role(role).status(status)
            .hireDate(LocalDate.parse(hireDate))
            .basicSalary(new BigDecimal(salary))
            .build();
    }
}
