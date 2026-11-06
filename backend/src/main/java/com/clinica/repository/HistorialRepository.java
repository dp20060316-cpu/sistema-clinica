package com.clinica.repository;

import com.clinica.entity.HistorialClinico;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HistorialRepository extends JpaRepository<HistorialClinico, Long> {

    List<HistorialClinico> findByPacienteIdOrderByFechaDesc(Long pacienteId);
}
