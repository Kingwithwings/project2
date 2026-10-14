package com.application.quiz.Dto;

import com.application.quiz.security.JwtUtils;
import com.application.quiz.Student;
import com.application.quiz.Teacher;
import com.application.quiz.StudentRepo;
import com.application.quiz.TeacherRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private StudentRepo studentRepo;

    @Autowired
    private TeacherRepo teacherRepo;

    @Autowired
    private JwtUtils jwtUtils;

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        String currentUsername = authentication.getName();

        Optional<Student> studentOpt = studentRepo.findByUsername(currentUsername);
        if (studentOpt.isPresent()) {
            Student s = studentOpt.get();
            return ResponseEntity.ok(new UserProfileDto(
                    s.getId(), s.getUsername(),  "STUDENT",
                    s.getEmail(), s.getDept(), s.getSemester(), null
            ));
        }

        Optional<Teacher> teacherOpt = teacherRepo.findByUsername(currentUsername);
        if (teacherOpt.isPresent()) {
            Teacher t = teacherOpt.get();
            return ResponseEntity.ok(new UserProfileDto(
                    t.getId(), t.getUsername(),  "TEACHER",
                    t.getEmail(), t.getDept(), null, null
            ));
        }

        return ResponseEntity.status(404).body("User not found");
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(Authentication authentication, 
                                           @RequestBody UserProfileDto updateDto) {
        String currentUsername = authentication.getName();
        String newUsername = updateDto.getUsername().trim();

        if (!newUsername.equalsIgnoreCase(currentUsername)) {
            boolean usernameTaken = studentRepo.findByUsername(newUsername).isPresent() ||
                                   teacherRepo.findByUsername(newUsername).isPresent();
            if (usernameTaken) {
                return ResponseEntity.status(409).body("Username '" + newUsername + "' is already taken.");
            }
        }

        Optional<Student> studentOpt = studentRepo.findByUsername(currentUsername);
        if (studentOpt.isPresent()) {
            Student student = studentOpt.get();
            student.setUsername(newUsername);
            student.setEmail(updateDto.getEmail());
            student.setDept(updateDto.getDept());
            student.setSemester(updateDto.getSemester());
            studentRepo.save(student);

            String newToken = null;
            if (!newUsername.equalsIgnoreCase(currentUsername)) {
                newToken = jwtUtils.generateToken(newUsername);
            }

            return ResponseEntity.ok(new UserProfileDto(
                    student.getId(), student.getUsername(), student.getRole(),
                    student.getEmail(), student.getDept(), student.getSemester(), newToken
            ));
        }

        Optional<Teacher> teacherOpt = teacherRepo.findByUsername(currentUsername);
        if (teacherOpt.isPresent()) {
            Teacher teacher = teacherOpt.get();
            teacher.setUsername(newUsername);
            teacher.setEmail(updateDto.getEmail());
            teacher.setDept(updateDto.getDept());
            teacherRepo.save(teacher);

            String newToken = null;
            if (!newUsername.equalsIgnoreCase(currentUsername)) {
                newToken = jwtUtils.generateToken(newUsername);
            }

            return ResponseEntity.ok(new UserProfileDto(
                    teacher.getId(), teacher.getUsername(), teacher.getRole(),
                    teacher.getEmail(), teacher.getDept(), null, newToken
            ));
        }

        return ResponseEntity.status(404).body("User not found");
    }
}