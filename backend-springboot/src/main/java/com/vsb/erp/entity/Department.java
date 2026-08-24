package com.vsb.erp.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "departments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String code; // CSE, AIDS, ECE, EEE, MECH, CIVIL, IT, ALL

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 150)
    private String hodName;
}
