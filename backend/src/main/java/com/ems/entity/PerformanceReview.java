package com.ems.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity
@Table(name = "performance_reviews")
public class PerformanceReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "reviewer_name", nullable = false)
    private String reviewerName;

    @Column(name = "review_period")
    private String reviewPeriod;        // e.g. "Q1 2024"

    @Column(name = "review_date")
    private LocalDate reviewDate;

    @Column(name = "overall_rating")    private Integer overallRating;  // 1–5
    @Column(name = "technical_skills") private Integer technicalSkills;
    @Column(name = "communication")     private Integer communication;
    @Column(name = "teamwork")          private Integer teamwork;
    @Column(name = "leadership")        private Integer leadership;
    @Column(name = "punctuality")       private Integer punctuality;

    @Column(name = "strengths",            columnDefinition = "TEXT") private String strengths;
    @Column(name = "areas_of_improvement", columnDefinition = "TEXT") private String areasOfImprovement;
    @Column(name = "comments",             columnDefinition = "TEXT") private String comments;

    @Enumerated(EnumType.STRING)
    @Column(name = "recommendation")
    private Recommendation recommendation;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); }

    public enum Recommendation { PROMOTE, RETAIN, IMPROVE, TERMINATE }
}
