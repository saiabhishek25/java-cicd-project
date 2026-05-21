package com.antigravity.employeemanager;

import com.antigravity.employeemanager.model.Employee;
import com.antigravity.employeemanager.repository.EmployeeRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.time.LocalDate;
import java.util.Arrays;

@SpringBootApplication
public class EmployeeManagerApplication {

    public static void main(String[] args) {
        SpringApplication.run(EmployeeManagerApplication.class, args);
    }

    @Bean
    public CommandLineRunner initData(EmployeeRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                repository.saveAll(Arrays.asList(
                    new Employee("Sarah", "Connor", "sarah.connor@cyberdyne.com", "+1-555-0199", "Engineering", "Principal Security Engineer", 135000.0, LocalDate.of(2023, 3, 15), "Active"),
                    new Employee("John", "Doe", "john.doe@company.com", "+1-555-0143", "Engineering", "Senior Software Developer", 98000.0, LocalDate.of(2024, 1, 10), "Active"),
                    new Employee("Alice", "Smith", "alice.smith@company.com", "+1-555-0122", "HR", "People Operations Manager", 85000.0, LocalDate.of(2022, 6, 20), "Active"),
                    new Employee("Robert", "Chen", "robert.chen@company.com", "+1-555-0158", "Marketing", "Growth Lead", 92000.0, LocalDate.of(2024, 2, 1), "Active"),
                    new Employee("Emily", "Watson", "emily.watson@company.com", "+1-555-0177", "Finance", "Senior Financial Analyst", 105000.0, LocalDate.of(2023, 9, 12), "On Leave"),
                    new Employee("David", "Miller", "david.miller@company.com", "+1-555-0111", "Sales", "Enterprise Account Executive", 115000.0, LocalDate.of(2025, 1, 5), "Active"),
                    new Employee("Jessica", "Taylor", "jessica.taylor@company.com", "+1-555-0188", "Marketing", "Social Media Coordinator", 65000.0, LocalDate.of(2025, 3, 10), "Active")
                ));
                System.out.println(">>> Sample employee records initialized in H2 database successfully!");
            }
        };
    }
}
