package com.vsb.erp.config;

import io.swagger.v3.oas.models.*;
import io.swagger.v3.oas.models.info.*;
import io.swagger.v3.oas.models.security.*;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * OpenAPI 3.0 configuration — generates full Swagger documentation
 * with JWT Bearer authentication scheme.
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI vsbErpOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("VSB Engineering College ERP — Student Master API")
                        .version("3.0.0")
                        .description("""
                                ## Student Master Module REST API
                                
                                Production-grade API for managing student profiles at
                                **V.S.B. Engineering College, Karur — 639 111**.
                                
                                ### Features
                                - Full CRUD for student master profiles (50+ fields)
                                - Passport photo upload (base64)
                                - Advanced filtering: Department, Year, Semester, Section, Community, Batch, Gender
                                - Sorted, paginated list with search
                                - Swagger UI with JWT Bearer authentication
                                
                                ### Authentication
                                Use the **Authorize** button to enter your JWT Bearer token.
                                """)
                        .contact(new Contact()
                                .name("VSB ERP Team")
                                .email("erp@vsb.ac.in")
                                .url("https://vsb.ac.in"))
                        .license(new License()
                                .name("Proprietary")
                                .url("https://vsb.ac.in")))
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("Local Development"),
                        new Server().url("https://api.vsb.ac.in").description("Production")))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth",
                                new SecurityScheme()
                                        .name("bearerAuth")
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Enter your JWT token (without 'Bearer ' prefix)")));
    }
}
