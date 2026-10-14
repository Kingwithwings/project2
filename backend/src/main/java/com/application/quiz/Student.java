package com.application.quiz;

import jakarta.persistence.*;

@Entity 

public class Student {
    @Id
     @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(unique = true ,nullable = false)
    private String username;
    @Column(nullable = false)
    private String password;
    
    private String role;
    
    private Integer semester;
    
    private String Dept;
    
    private String email;
    public Student(){
        
    }

    public Student(String username, String password,String role) {
        this.username = username;
        this.password = password;
        this.role = role;
      
    }
    
     public long getId(){
        return this.id;
     }
    public String getUsername(){
        return this.username;
    }
    public void setUsername(String username){
        this.username = username;
    }
    public String getPassword(){
         return this.password;
    }
    public void setPassword(String password){
        this.password = password;
    }
    
    public String getRole(){
        return this.role;
    }
    public void setRole(String role){
        this.role = role;
    }
    public Integer getSemester(){
        return this.semester;
    }
    public void setSemester(Integer semester){
        this.semester = semester;
    }
    public String getDept(){
        return this.Dept;
    }
    public void setDept(String Dept){
        this.Dept = Dept;
    }
    public String getEmail(){
        return this.email;
    }
    public void setEmail(String email){
        this.email = email;
    }

}
