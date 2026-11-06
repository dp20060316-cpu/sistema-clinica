package com.clinica.repository;

import com.clinica.entity.Paciente;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PacienteRepository extends JpaRepository<Paciente, Long> {

    boolean existsByDocumentoAndIdNot(String documento, Long id);

    @Query("""
            select p from Paciente p
            where lower(p.documento) like lower(concat('%', :texto, '%'))
               or lower(p.nombres) like lower(concat('%', :texto, '%'))
               or lower(p.apellidos) like lower(concat('%', :texto, '%'))
            order by p.apellidos, p.nombres
            """)
    List<Paciente> buscar(@Param("texto") String texto);
}
