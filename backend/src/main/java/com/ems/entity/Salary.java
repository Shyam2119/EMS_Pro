package com.ems.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity
@Table(name = "salaries")
public class Salary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "month", nullable = false)
    private String month;               // e.g. "2024-01"

    @Column(name = "basic_salary",      precision = 12, scale = 2) private BigDecimal basicSalary;
    @Column(name = "hra",               precision = 12, scale = 2) private BigDecimal hra;
    @Column(name = "transport",         precision = 12, scale = 2) private BigDecimal transport;
    @Column(name = "medical",           precision = 12, scale = 2) private BigDecimal medical;
    @Column(name = "other_allowances",  precision = 12, scale = 2) private BigDecimal otherAllowances;
    @Column(name = "pf_deduction",      precision = 12, scale = 2) private BigDecimal pfDeduction;
    @Column(name = "tax_deduction",     precision = 12, scale = 2) private BigDecimal taxDeduction;
    @Column(name = "other_deductions",  precision = 12, scale = 2) private BigDecimal otherDeductions;
    @Column(name = "net_pay",           precision = 12, scale = 2) private BigDecimal netPay;

    @Column(name = "payment_date")
    private LocalDate paymentDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status")
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Column(name = "remarks")
    private String remarks;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); }

    public enum PaymentStatus { PENDING, PAID, ON_HOLD }
}
