package com.ems.repository;

import com.ems.entity.SchedulerJobConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface SchedulerJobRepository extends JpaRepository<SchedulerJobConfig, Long> {
    Optional<SchedulerJobConfig> findByJobKey(String jobKey);
}
