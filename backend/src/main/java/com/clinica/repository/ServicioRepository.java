package com.clinica.repository;

import com.clinica.entity.Servicio;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServicioRepository extends JpaRepository<Servicio, Long> {

    boolean existsByNombreIgnoreCaseAndIdNot(String nombre, Long id);
}
