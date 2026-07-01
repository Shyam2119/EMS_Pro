package com.ems.service;

import com.ems.entity.AuditLog;
import com.ems.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public void log(String action, String entityType, Long entityId,
                    String performedBy, String description) {
        auditLogRepository.save(AuditLog.builder()
                .action(action).entityType(entityType).entityId(entityId)
                .performedBy(performedBy).description(description).build());
    }

    public List<AuditLog> getRecent()               { return auditLogRepository.findTop50ByOrderByTimestampDesc(); }
    public List<AuditLog> getAll()                  { return auditLogRepository.findAll(); }
    public List<AuditLog> getByUser(String user)    { return auditLogRepository.findByPerformedBy(user); }
}
