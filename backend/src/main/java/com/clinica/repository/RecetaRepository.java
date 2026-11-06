package com.clinica.repository;

import com.clinica.entity.Receta;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecetaRepository extends JpaRepository<Receta, Long> {

    List<Receta> findAllByOrderByFechaDesc();

    List<Receta> findByPacienteIdOrderByFechaDesc(Long pacienteId);
}
