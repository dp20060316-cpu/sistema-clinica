package com.clinica.repository;

import com.clinica.entity.Medico;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MedicoRepository extends JpaRepository<Medico, Long> {

    boolean existsByColegiaturaAndIdNot(String colegiatura, Long id);

    long countByActivoTrue();
}
