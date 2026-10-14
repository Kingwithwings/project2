package com.application.quiz.Dto;

public class UserProfileDto {
    private Long id;
    private String username;
    private String role;
    private String email;
    private String dept;
    private Integer semester;
    private String token;

    // No-arg constructor (required for Jackson deserialization on @RequestBody)
    public UserProfileDto() {
    }

    // All-args constructor
    public UserProfileDto(Long id, String username, String role, String email, String dept, Integer semester, String token) {
        this.id = id;
        this.username = username;
        this.role = role;
        this.email = email;
        this.dept = dept;
        this.semester = semester;
        this.token = token;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDept() {
        return dept;
    }

    public void setDept(String dept) {
        this.dept = dept;
    }

    public Integer getSemester() {
        return semester;
    }

    public void setSemester(Integer semester) {
        this.semester = semester;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}