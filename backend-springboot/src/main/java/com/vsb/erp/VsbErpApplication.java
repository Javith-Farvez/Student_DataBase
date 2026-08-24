package com.vsb.erp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class VsbErpApplication {

    public static void main(String[] args) {
        SpringApplication.run(VsbErpApplication.class, args);
        System.out.println("=================================================================");
        System.out.println("   VSB Engineering College ERP - Spring Boot 3 Auth Live!       ");
        System.out.println("   Server URL: http://localhost:8080                              ");
        System.out.println("   Swagger UI: http://localhost:8080/swagger-ui.html              ");
        System.out.println("=================================================================");
    }
}
