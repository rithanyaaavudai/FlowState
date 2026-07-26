package com.example.demo.config;

import com.example.demo.entity.FlowUser;
import com.example.demo.repository.FlowUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final FlowUserRepository flowUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (flowUserRepository.count() == 0) {
            FlowUser admin = FlowUser.builder()
                    .username("admin")
                    .email("admin@flowstate.com")
                    .passwordHash(passwordEncoder.encode("Admin@123"))
                    .fullName("Platform Admin")
                    .role(FlowUser.UserRole.PLATFORM_ADMIN)
                    .isActive(true)
                    .build();

            FlowUser coach = FlowUser.builder()
                    .username("coach")
                    .email("coach@flowstate.com")
                    .passwordHash(passwordEncoder.encode("Coach@123"))
                    .fullName("Flow Coach")
                    .role(FlowUser.UserRole.FLOW_COACH)
                    .isActive(true)
                    .build();

            FlowUser practitioner = FlowUser.builder()
                    .username("practitioner")
                    .email("practitioner@flowstate.com")
                    .passwordHash(passwordEncoder.encode("Practitioner@123"))
                    .fullName("John Doe")
                    .role(FlowUser.UserRole.PRACTITIONER)
                    .isActive(true)
                    .build();

            flowUserRepository.save(admin);
            flowUserRepository.save(coach);
            flowUserRepository.save(practitioner);
        }
    }
}