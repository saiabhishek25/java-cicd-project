package com.antigravity.employeemanager.repository;

import com.antigravity.employeemanager.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    Optional<Employee> findByEmail(String email);

    List<Employee> findByDepartmentIgnoreCase(String department);

    List<Employee> findByStatusIgnoreCase(String status);

    @Query("SELECT e FROM Employee e WHERE " +
           "(LOWER(e.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(e.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(e.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(e.role) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:department IS NULL OR LOWER(e.department) = LOWER(:department)) AND " +
           "(:status IS NULL OR LOWER(e.status) = LOWER(:status))")
    List<Employee> searchEmployees(@Param("search") String search,
                                   @Param("department") String department,
                                   @Param("status") String status);

    @Query("SELECT DISTINCT e.department FROM Employee e")
    List<String> findDistinctDepartments();
}
