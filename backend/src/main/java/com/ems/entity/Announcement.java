package com.ems.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity
@Table(name = "announcements")
public class Announcement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title",   nullable = false) private String title;
    @Column(name = "content", nullable = false, columnDefinition = "TEXT") private String content;
    @Column(name = "posted_by") private String postedBy;

    @Enumerated(EnumType.STRING) @Column(name = "priority") private Priority priority = Priority.NORMAL;
    @Enumerated(EnumType.STRING) @Column(name = "category") private Category category = Category.GENERAL;

    @Column(name = "is_active")   private boolean active = true;
    @Column(name = "expires_at")  private LocalDateTime expiresAt;
    @Column(name = "posted_at", updatable = false) private LocalDateTime postedAt;

    @PrePersist
    protected void onCreate() { postedAt = LocalDateTime.now(); }

    public enum Priority { LOW, NORMAL, HIGH, URGENT }
    public enum Category { GENERAL, POLICY, HOLIDAY, EVENT, ACHIEVEMENT, ALERT }
}
