package com.flowstate.config;

import com.flowstate.entity.FlowUser;
import com.flowstate.repository.FlowUserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final FlowUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(FlowUserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            FlowUser admin = new FlowUser();
            admin.setUsername("admin");
            admin.setEmail("admin@flowstate.io");
            admin.setPasswordHash(passwordEncoder.encode("admin123"));
            admin.setRole(FlowUser.UserRole.PLATFORM_ADMIN);
            admin.setFullName("Platform Admin");
            admin.setIsActive(true);
            userRepository.save(admin);

            FlowUser coach = new FlowUser();
            coach.setUsername("coach1");
            coach.setEmail("coach@flowstate.io");
            coach.setPasswordHash(passwordEncoder.encode("coach123"));
            coach.setRole(FlowUser.UserRole.FLOW_COACH);
            coach.setFullName("Default Coach");
            coach.setIsActive(true);
            userRepository.save(coach);

            FlowUser practitioner = new FlowUser();
            practitioner.setUsername("practitioner1");
            practitioner.setEmail("practitioner@flowstate.io");
            practitioner.setPasswordHash(passwordEncoder.encode("pract123"));
            practitioner.setRole(FlowUser.UserRole.PRACTITIONER);
            practitioner.setFullName("Default Practitioner");
            practitioner.setIsActive(true);
            userRepository.save(practitioner);

            System.out.println("[DataSeeder] Demo users created.");
        }
    }
}
