package com.ems.service;

import com.ems.entity.Announcement;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.AnnouncementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;

    public Announcement create(Announcement a)    { return announcementRepository.save(a); }
    public List<Announcement> getActive()         { return announcementRepository.findByActiveTrueOrderByPostedAtDesc(); }
    public List<Announcement> getAll()            { return announcementRepository.findAll(); }

    public Announcement getById(Long id) {
        return announcementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement not found: " + id));
    }

    public Announcement update(Long id, Announcement updated) {
        Announcement a = getById(id);
        a.setTitle(updated.getTitle());
        a.setContent(updated.getContent());
        a.setPriority(updated.getPriority());
        a.setCategory(updated.getCategory());
        a.setActive(updated.isActive());
        a.setExpiresAt(updated.getExpiresAt());
        return announcementRepository.save(a);
    }

    public void delete(Long id) { announcementRepository.deleteById(id); }

    public Announcement toggleActive(Long id) {
        Announcement a = getById(id);
        a.setActive(!a.isActive());
        return announcementRepository.save(a);
    }
}
