package com.desktrade.controller;

import com.desktrade.model.Item;
import com.desktrade.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;   // <-- jakarta annotation
import java.io.IOException;
import java.net.InetAddress;
import java.nio.file.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
public class FileUploadController {

    private final ItemRepository itemRepository;

    /**
     * Directory for uploads. Default: ${user.home}/desktrade-uploads
     * You can override in application.properties with desktrade.upload.dir
     */
    @Value("${desktrade.upload.dir:${user.home}/desktrade-uploads}")
    private String uploadRootConfig;

    @Value("${server.port:8080}")
    private String serverPort;

    // resolved Path created at startup
    private Path uploadRoot;

    @PostConstruct
    public void init() throws IOException {
        uploadRoot = Paths.get(uploadRootConfig).toAbsolutePath().normalize();
        Files.createDirectories(uploadRoot);
    }

    /**
     * Upload an image for an item.
     * - Permission: authenticated (admins/sellers)
     * - Field name: "file"
     *
     * Returns JSON: { "url": "<public url>", "filename": "<stored filename>", "message": "uploaded" }
     */
    @PostMapping("/{id}/image")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> uploadItemImage(@PathVariable Long id, @RequestParam("file") MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "No file uploaded"));
        }

        Item item = itemRepository.findById(id).orElse(null);
        if (item == null) {
            return ResponseEntity.status(404).body(Map.of("message", "Item not found"));
        }

        String original = StringUtils.cleanPath(file.getOriginalFilename());
        String ext = "";
        int idx = original.lastIndexOf('.');
        if (idx >= 0) ext = original.substring(idx);
        // sanitize and create a unique filename
        String filename = "item-" + id + "-" + System.currentTimeMillis() + ext;

        Path target = uploadRoot.resolve(filename);
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

        String host = "localhost";
        try { host = InetAddress.getLocalHost().getHostAddress(); } catch (Exception ignored) {}

        String url = String.format("http://%s:%s/uploads/%s", host, serverPort, filename);

        item.setImage(url);
        itemRepository.save(item);

        Map<String, Object> resp = new HashMap<>();
        resp.put("url", url);
        resp.put("filename", filename);
        resp.put("message", "uploaded");
        return ResponseEntity.ok(resp);
    }
}
