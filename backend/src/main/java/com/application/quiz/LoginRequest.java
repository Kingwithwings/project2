package com.application.quiz;

import jakarta.persistence.Entity;



public class LoginRequest {
    
    
    private String username;
    private String password;
    private String role;

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
}
