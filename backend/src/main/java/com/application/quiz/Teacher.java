package com.application.quiz;

import jakarta.persistence.*;

@Entity 

public class Teacher {
    @Id
     @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(unique = true ,nullable = false)
    private String username;
    @Column(nullable = false)
    private String password;
    
    private String role;

    
    private String Dept;

    
    private String email;
    public Teacher(){
        
    }

    public Teacher(String username, String password, String role){
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
    public void setPassword(String password){
        this.password = password;
    }
    public String getPassword(){
         return this.password;
    }
    public String getRole(){
        return this.role;
    }
    public void setRole(String role){
        this.role = role;
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
