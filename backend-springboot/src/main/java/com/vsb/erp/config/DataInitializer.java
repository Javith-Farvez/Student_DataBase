package com.vsb.erp.config;

import com.vsb.erp.entity.Department;
import com.vsb.erp.entity.Role;
import com.vsb.erp.entity.User;
import com.vsb.erp.enums.RoleName;
import com.vsb.erp.enums.UserStatus;
import com.vsb.erp.repository.DepartmentRepository;
import com.vsb.erp.repository.RoleRepository;
import com.vsb.erp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed 4 Core Roles
        Map<RoleName, Role> rolesMap = new HashMap<>();
        for (RoleName roleName : RoleName.values()) {
            Role role = roleRepository.findByName(roleName)
                    .orElseGet(() -> roleRepository.save(Role.builder()
                            .name(roleName)
                            .description("VSB College ERP Role - " + roleName.name())
                            .build()));
            rolesMap.put(roleName, role);
        }

        // 2. Seed Departments
        String[][] depts = {
                {"CSE", "Computer Science & Engineering", "Dr. A. Ramesh"},
                {"AIDS", "Artificial Intelligence & Data Science", "Dr. K. Senthil Kumar"},
                {"ECE", "Electronics & Communication Engineering", "Dr. P. Murugan"},
                {"EEE", "Electrical & Electronics Engineering", "Dr. R. Vignesh"},
                {"MECH", "Mechanical Engineering", "Dr. S. Karthik"},
                {"ALL", "All College Departments", "Principal Office"}
        };

        Map<String, Department> deptsMap = new HashMap<>();
        for (String[] d : depts) {
            Department dept = departmentRepository.findByCode(d[0])
                    .orElseGet(() -> departmentRepository.save(Department.builder()
                            .code(d[0])
                            .name(d[1])
                            .hodName(d[2])
                            .build()));
            deptsMap.put(d[0], dept);
        }

        // 3. Seed Accounts for the 4 Roles
        String[][] defaultUsers = {
                {"ADMIN001", "admin@vsb.ac.in", "Dr. V.S.B Administrator", "ADMIN", "ALL", "admin123"},
                {"PRIN001", "principal@vsb.ac.in", "Dr. V.S.B Principal", "PRINCIPAL", "ALL", "pass123"},
                {"HOD001", "hod.aids@vsb.ac.in", "Dr. K. Senthil Kumar (HOD AI&DS)", "HOD", "AIDS", "pass123"},
                {"STF001", "staff.aids@vsb.ac.in", "Prof. M. Rajesh (Faculty AI&DS)", "STAFF", "AIDS", "pass123"}
        };

        for (String[] u : defaultUsers) {
            String username = u[0];
            String email = u[1];
            String fullName = u[2];
            RoleName roleName = RoleName.valueOf(u[3]);
            String deptCode = u[4];
            String rawPass = u[5];

            if (!userRepository.existsByUsername(username)) {
                User user = User.builder()
                        .username(username)
                        .email(email)
                        .password(passwordEncoder.encode(rawPass))
                        .fullName(fullName)
                        .role(rolesMap.get(roleName))
                        .department(deptsMap.get(deptCode))
                        .status(UserStatus.ACTIVE)
                        .build();
                userRepository.save(user);
                System.out.println("✅ Seeded ERP Account: " + username + " (" + roleName + ")");
            }
        }
    }
}
