package com.application.quiz;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.application.quiz.security.JwtUtils;
import java.util.Optional;




@RestController
@RequestMapping("/auth")
public class AuthController{

    private final PasswordEncoder passwordEncoder;

    @Autowired
    private StudentRepo studentRepo;

    @Autowired
    private TeacherRepo teacherRepo;

    @Autowired 
    private JwtUtils jwtUtils;

    AuthController(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

@PostMapping("/register")
public String register(@RequestBody LoginRequest loginRequest){

      
     if(studentRepo.findByUsername(loginRequest.getUsername()).isPresent() || teacherRepo.findByUsername(loginRequest.getUsername()).isPresent()){
        return "Error username is already taken";
     }
     

     loginRequest.setPassword(passwordEncoder.encode(loginRequest.getPassword()));
     if(loginRequest.getRole().equals("student")){
        Student stu = new Student(loginRequest.getUsername(), loginRequest.getPassword(), loginRequest.getRole());
       
        studentRepo.save(stu);
     }else{
        Teacher teacher = new Teacher(loginRequest.getUsername(), loginRequest.getPassword(), loginRequest.getRole());
        teacherRepo.save(teacher);
     }
     return "user registered successfully";
}

@PostMapping("/login")
public String login(@RequestBody LoginRequest loginRequest) {
    // Prevent NullPointerException if role is omitted or null
    boolean isStudent = "student".equalsIgnoreCase(loginRequest.getRole());

    // 1. Fetch user by role; store credentials uniformly
    String dbPassword;
    String dbUsername;

    if (isStudent) {
        Optional<Student> studentOpt = studentRepo.findByUsername(loginRequest.getUsername());
        if (studentOpt.isEmpty()) {
            return "error: user not found";
        }
        Student student = studentOpt.get();
        dbPassword = student.getPassword();
        dbUsername = student.getUsername();
    } else {
        Optional<Teacher> teacherOpt = teacherRepo.findByUsername(loginRequest.getUsername());
        if (teacherOpt.isEmpty()) {
            return "error: user not found";
        }
        Teacher teacher = teacherOpt.get();
        dbPassword = teacher.getPassword();
        dbUsername = teacher.getUsername();
    }

    // 2. Validate password
    if (!passwordEncoder.matches(loginRequest.getPassword(), dbPassword)) {
        return "Error: username or password is not correct";
    }

    // 3. Generate JWT
    String token = jwtUtils.generateToken(dbUsername);
    return "logged in successfully. Token: " + token;
}
}