package com.vsb.erp.service;

import com.vsb.erp.dto.*;
import com.vsb.erp.entity.PasswordResetToken;
import com.vsb.erp.entity.User;
import com.vsb.erp.enums.UserStatus;
import com.vsb.erp.repository.PasswordResetTokenRepository;
import com.vsb.erp.repository.UserRepository;
import com.vsb.erp.security.JwtUtils;
import com.vsb.erp.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    public AuthResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();

        if (UserStatus.INACTIVE.name().equalsIgnoreCase(userPrincipal.getStatus())) {
            throw new BadCredentialsException("Account is currently INACTIVE. Please contact Office Administrator.");
        }

        String jwt = jwtUtils.generateJwtToken(authentication, loginRequest.isRememberMe());

        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User error"));

        String deptCode = user.getDepartment() != null ? user.getDepartment().getCode() : "ALL";
        String deptName = user.getDepartment() != null ? user.getDepartment().getName() : "All Departments";

        long expiresIn = loginRequest.isRememberMe() ? 604800000L : 86400000L;

        return AuthResponse.builder()
                .token(jwt)
                .type("Bearer")
                .id(userPrincipal.getId())
                .username(userPrincipal.getUsername())
                .email(userPrincipal.getEmail())
                .fullName(userPrincipal.getFullName())
                .role(userPrincipal.getRole())
                .departmentCode(deptCode)
                .departmentName(deptName)
                .status(userPrincipal.getStatus())
                .expiresInMs(expiresIn)
                .build();
    }

    @Transactional
    public MessageResponse forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("No user account found with email: " + request.getEmail()));

        tokenRepository.findByUser(user).ifPresent(tokenRepository::delete);

        String tokenStr = UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(tokenStr)
                .user(user)
                .expiryDate(LocalDateTime.now().plusHours(24))
                .build();

        tokenRepository.save(resetToken);

        // Simulated secure password reset link (printed in log for demo)
        System.out.println("=================================================================");
        System.out.println("🔑 PASSWORD RESET TOKEN GENERATED FOR: " + user.getEmail());
        System.out.println("   Token: " + tokenStr);
        System.out.println("   Reset Link: http://localhost:5173/reset-password?token=" + tokenStr);
        System.out.println("=================================================================");

        return new MessageResponse("Password reset instructions sent to " + request.getEmail());
    }

    @Transactional
    public MessageResponse resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = tokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new RuntimeException("Invalid or expired password reset token"));

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            tokenRepository.delete(resetToken);
            throw new RuntimeException("Password reset token has expired");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        tokenRepository.delete(resetToken);

        return new MessageResponse("Password reset successfully. You can now login with your new password.");
    }

    @Transactional
    public MessageResponse changePassword(String username, ChangePasswordRequest request) {
        User user = userRepository.findByUsernameOrEmail(username, username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadCredentialsException("Current password does not match");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return new MessageResponse("Password changed successfully");
    }
}
