package com.antigravity.employeemanager.service;

import com.antigravity.employeemanager.model.Employee;
import com.antigravity.employeemanager.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class EmployeeService {

    private final EmployeeRepository repository;

    @Autowired
    public EmployeeService(EmployeeRepository repository) {
        this.repository = repository;
    }

    public List<Employee> getAllEmployees() {
        return repository.findAll();
    }

    public Optional<Employee> getEmployeeById(Long id) {
        return repository.findById(id);
    }

    public List<Employee> searchEmployees(String search, String department, String status) {
        String searchParam = (search == null || search.trim().isEmpty()) ? "" : search.trim();
        String deptParam = (department == null || department.trim().isEmpty() || department.equalsIgnoreCase("All")) ? null : department.trim();
        String statusParam = (status == null || status.trim().isEmpty() || status.equalsIgnoreCase("All")) ? null : status.trim();
        return repository.searchEmployees(searchParam, deptParam, statusParam);
    }

    @Transactional
    public Employee createEmployee(Employee employee) {
        if (repository.findByEmail(employee.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Employee with email " + employee.getEmail() + " already exists!");
        }
        validateEmployee(employee);
        return repository.save(employee);
    }

    @Transactional
    public Employee updateEmployee(Long id, Employee employeeDetails) {
        Employee employee = repository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Employee not found with id: " + id));

        // Check email uniqueness if email is being updated
        if (!employee.getEmail().equalsIgnoreCase(employeeDetails.getEmail())) {
            if (repository.findByEmail(employeeDetails.getEmail()).isPresent()) {
                throw new IllegalArgumentException("Employee with email " + employeeDetails.getEmail() + " already exists!");
            }
        }

        validateEmployee(employeeDetails);

        employee.setFirstName(employeeDetails.getFirstName());
        employee.setLastName(employeeDetails.getLastName());
        employee.setEmail(employeeDetails.getEmail());
        employee.setPhone(employeeDetails.getPhone());
        employee.setDepartment(employeeDetails.getDepartment());
        employee.setRole(employeeDetails.getRole());
        employee.setSalary(employeeDetails.getSalary());
        employee.setJoiningDate(employeeDetails.getJoiningDate());
        employee.setStatus(employeeDetails.getStatus());

        return repository.save(employee);
    }

    @Transactional
    public void deleteEmployee(Long id) {
        Employee employee = repository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Employee not found with id: " + id));
        repository.delete(employee);
    }

    public Map<String, Object> getDashboardStats() {
        List<Employee> allEmployees = repository.findAll();
        Map<String, Object> stats = new HashMap<>();

        long totalCount = allEmployees.size();
        stats.put("totalEmployees", totalCount);

        double avgSalary = allEmployees.stream()
                .mapToDouble(Employee::getSalary)
                .average()
                .orElse(0.0);
        stats.put("averageSalary", Math.round(avgSalary * 100.0) / 100.0);

        Map<String, Long> departmentCounts = allEmployees.stream()
                .collect(Collectors.groupingBy(Employee::getDepartment, Collectors.counting()));
        stats.put("departmentBreakdown", departmentCounts);

        Map<String, Long> statusCounts = allEmployees.stream()
                .collect(Collectors.groupingBy(Employee::getStatus, Collectors.counting()));
        stats.put("statusBreakdown", statusCounts);

        // Find highest paying department
        Map<String, Double> departmentAvgSalaries = allEmployees.stream()
                .collect(Collectors.groupingBy(
                        Employee::getDepartment,
                        Collectors.averagingDouble(Employee::getSalary)
                ));
        String topDepartment = departmentAvgSalaries.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("None");
        stats.put("topDepartment", topDepartment);

        return stats;
    }

    public String exportToCsv() {
        List<Employee> employees = repository.findAll();
        StringBuilder csv = new StringBuilder();
        csv.append("ID,First Name,Last Name,Email,Phone,Department,Role,Salary,Joining Date,Status\n");

        for (Employee e : employees) {
            csv.append(e.getId()).append(",")
               .append(escapeCsvField(e.getFirstName())).append(",")
               .append(escapeCsvField(e.getLastName())).append(",")
               .append(escapeCsvField(e.getEmail())).append(",")
               .append(escapeCsvField(e.getPhone())).append(",")
               .append(escapeCsvField(e.getDepartment())).append(",")
               .append(escapeCsvField(e.getRole())).append(",")
               .append(e.getSalary()).append(",")
               .append(e.getJoiningDate()).append(",")
               .append(e.getStatus()).append("\n");
        }
        return csv.toString();
    }

    @Transactional
    public int importFromCsv(InputStream inputStream) throws Exception {
        int importCount = 0;
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {
            String line;
            boolean isHeader = true;
            while ((line = reader.readLine()) != null) {
                if (isHeader) {
                    isHeader = false;
                    continue; // Skip header
                }
                
                String[] tokens = line.split(",(?=([^\"]*\"[^\"]*\")*[^\"]*$)"); // Split by comma outside quotes
                if (tokens.length < 9) {
                    continue; // Invalid line
                }

                // Strip quotes if present
                String firstName = stripQuotes(tokens[1]);
                String lastName = stripQuotes(tokens[2]);
                String email = stripQuotes(tokens[3]);
                String phone = stripQuotes(tokens[4]);
                String department = stripQuotes(tokens[5]);
                String role = stripQuotes(tokens[6]);
                double salary = Double.parseDouble(stripQuotes(tokens[7]));
                LocalDate joiningDate = LocalDate.parse(stripQuotes(tokens[8]));
                String status = tokens.length > 9 ? stripQuotes(tokens[9]) : "Active";

                if (repository.findByEmail(email).isPresent()) {
                    continue; // Skip existing emails
                }

                Employee employee = new Employee(firstName, lastName, email, phone, department, role, salary, joiningDate, status);
                validateEmployee(employee);
                repository.save(employee);
                importCount++;
            }
        }
        return importCount;
    }

    private void validateEmployee(Employee employee) {
        if (employee.getFirstName() == null || employee.getFirstName().trim().isEmpty()) {
            throw new IllegalArgumentException("First name is required.");
        }
        if (employee.getLastName() == null || employee.getLastName().trim().isEmpty()) {
            throw new IllegalArgumentException("Last name is required.");
        }
        if (employee.getEmail() == null || !employee.getEmail().contains("@")) {
            throw new IllegalArgumentException("A valid email address is required.");
        }
        if (employee.getSalary() == null || employee.getSalary() < 0) {
            throw new IllegalArgumentException("Salary must be a non-negative number.");
        }
        if (employee.getJoiningDate() == null) {
            throw new IllegalArgumentException("Joining date is required.");
        }
        if (employee.getStatus() == null || (!employee.getStatus().equals("Active") &&
                !employee.getStatus().equals("On Leave") && !employee.getStatus().equals("Terminated"))) {
            throw new IllegalArgumentException("Invalid employee status.");
        }
    }

    private String escapeCsvField(String field) {
        if (field == null) return "";
        if (field.contains(",") || field.contains("\"") || field.contains("\n")) {
            return "\"" + field.replace("\"", "\"\"") + "\"";
        }
        return field;
    }

    private String stripQuotes(String field) {
        if (field == null) return "";
        field = field.trim();
        if (field.startsWith("\"") && field.endsWith("\"")) {
            return field.substring(1, field.length() - 1).replace("\"\"", "\"");
        }
        return field;
    }
}
