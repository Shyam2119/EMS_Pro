package com.ems.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "action",       nullable = false) private String action;
    @Column(name = "entity_type")                    private String entityType;
    @Column(name = "entity_id")                      private Long   entityId;
    @Column(name = "performed_by", nullable = false) private String performedBy;
    @Column(name = "description",  columnDefinition = "TEXT") private String description;
    @Column(name = "ip_address")                     private String ipAddress;

    @Column(name = "timestamp", updatable = false)
    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() { timestamp = LocalDateTime.now(); }
}
