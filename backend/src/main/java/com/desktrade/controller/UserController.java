package com.desktrade.controller;
 
import com.desktrade.model.User;
import com.desktrade.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
 
import java.util.List;
 
@RestController
@RequestMapping("/api/employees")
public class UserController {
 
    private final UserRepository userRepository;
 
    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
 
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllEmployees() {
        List<User> employees = userRepository.findByRole("EMPLOYEE");
        return ResponseEntity.ok(employees);
    }
 
    @SuppressWarnings("null")
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> getEmployeeById(@PathVariable Long id) {
        return userRepository.findById(id)
                .filter(u -> "EMPLOYEE".equals(u.getRole()))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
 
 