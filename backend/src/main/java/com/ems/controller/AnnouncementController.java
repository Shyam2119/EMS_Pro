package com.ems.controller;

import com.ems.entity.Announcement;
import com.ems.service.AnnouncementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;

    @PostMapping
    public ResponseEntity<Announcement> create(@RequestBody Announcement a) {
        return new ResponseEntity<>(announcementService.create(a), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Announcement>> getAll(
            @RequestParam(defaultValue = "false") boolean activeOnly) {
        return ResponseEntity.ok(activeOnly ? announcementService.getActive() : announcementService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Announcement> getById(@PathVariable Long id) {
        return ResponseEntity.ok(announcementService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Announcement> update(@PathVariable Long id, @RequestBody Announcement a) {
        return ResponseEntity.ok(announcementService.update(id, a));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        announcementService.delete(id);
        return ResponseEntity.ok("Announcement deleted");
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<Announcement> toggleActive(@PathVariable Long id) {
        return ResponseEntity.ok(announcementService.toggleActive(id));
    }
}
