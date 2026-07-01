package com.ems.service;

import com.ems.entity.*;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SalaryService {

    private final SalaryRepository   salaryRepository;
    private final EmployeeRepository employeeRepository;

    public Salary create(Long employeeId, Salary salary) {
        salary.setEmployee(employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found: " + employeeId)));
        salary.setNetPay(calcNet(salary));
        return salaryRepository.save(salary);
    }

    public Salary update(Long id, Salary updated) {
        Salary s = getById(id);
        s.setBasicSalary(updated.getBasicSalary());
        s.setHra(updated.getHra());
        s.setTransport(updated.getTransport());
        s.setMedical(updated.getMedical());
        s.setOtherAllowances(updated.getOtherAllowances());
        s.setPfDeduction(updated.getPfDeduction());
        s.setTaxDeduction(updated.getTaxDeduction());
        s.setOtherDeductions(updated.getOtherDeductions());
        s.setNetPay(calcNet(s));
        s.setPaymentStatus(updated.getPaymentStatus());
        s.setPaymentDate(updated.getPaymentDate());
        s.setRemarks(updated.getRemarks());
        return salaryRepository.save(s);
    }

    public Salary  getById(Long id)              { return salaryRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Salary not found: " + id)); }
    public List<Salary> getAll()                 { return salaryRepository.findAll(); }
    public List<Salary> getByEmployee(Long empId){ return salaryRepository.findByEmployeeId(empId); }
    public List<Salary> getByMonth(String month) { return salaryRepository.findByMonth(month); }
    public void delete(Long id)                  { salaryRepository.deleteById(id); }

    private BigDecimal calcNet(Salary s) {
        BigDecimal earn = sum(s.getBasicSalary(), s.getHra(), s.getTransport(), s.getMedical(), s.getOtherAllowances());
        BigDecimal dedu = sum(s.getPfDeduction(), s.getTaxDeduction(), s.getOtherDeductions());
        return earn.subtract(dedu);
    }

    private BigDecimal sum(BigDecimal... vals) {
        BigDecimal t = BigDecimal.ZERO;
        for (BigDecimal v : vals) if (v != null) t = t.add(v);
        return t;
    }
}
