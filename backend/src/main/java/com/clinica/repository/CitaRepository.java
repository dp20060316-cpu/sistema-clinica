package com.clinica.repository;

import com.clinica.entity.Cita;
import com.clinica.entity.EstadoCita;
import java.time.LocalDateTime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface CitaRepository extends JpaRepository<Cita, Long>, JpaSpecificationExecutor<Cita> {

    boolean existsByMedicoIdAndEstadoNotAndFechaHoraBetweenAndIdNot(
            Long medicoId, EstadoCita estado, LocalDateTime desde, LocalDateTime hasta, Long id);

    boolean existsByPacienteIdAndEstadoNotAndFechaHoraBetweenAndIdNot(
            Long pacienteId, EstadoCita estado, LocalDateTime desde, LocalDateTime hasta, Long id);

    long countByFechaHoraBetweenAndEstadoNot(LocalDateTime desde, LocalDateTime hasta, EstadoCita estado);
}
