# Sistema de Gestión de Servicios de una Clínica

Aplicación web para manejar pacientes, historial clínico, médicos, servicios, citas y recetas impresas.

| Capa | Tecnología |
|---|---|
| Frontend | React 18, JavaScript, HTML, CSS (Vite) |
| Backend | Spring Boot 3.5, Java 17 o superior, Spring Data JPA |
| Base de datos | SQL Server 2016 o superior |

## 1. Qué necesitas instalar

| Programa | Para qué | Dónde |
|---|---|---|
| JDK 17 o 21 | Ejecutar el backend | https://adoptium.net |
| Maven 3.9 | Compilar el backend | https://maven.apache.org/download.cgi |
| Node.js LTS | Ejecutar el frontend | https://nodejs.org |
| SQL Server Express o Developer | Base de datos | https://www.microsoft.com/es-es/sql-server/sql-server-downloads |
| SQL Server Management Studio (SSMS) | Ejecutar el script | https://aka.ms/ssmsfullsetup |

Para instalar Maven, descomprime el zip y agrega su carpeta `bin` a la variable `Path` de Windows.

Abre una terminal nueva y comprueba las instalaciones:

```bash
java -version
```

```bash
mvn -v
```

```bash
node -v
```

## 2. Preparar SQL Server (solo la primera vez)

El backend se conecta por TCP en el puerto 1433 con tu sesión de Windows, así que no necesita usuario ni contraseña. Tu usuario de Windows debe tener acceso a SQL Server.

**Activar TCP en el puerto 1433**

1. Abre **SQL Server Configuration Manager**.
2. Entra a **SQL Server Network Configuration** > **Protocols for** tu instancia y habilita **TCP/IP**.
3. Abre las propiedades de TCP/IP > pestaña **IP Addresses** > sección **IPAll**.
4. Deja vacío **TCP Dynamic Ports** y escribe `1433` en **TCP Port**.
5. En **SQL Server Services**, reinicia el servicio **SQL Server**.

## 3. Crear la base de datos

En SSMS: **File > Open > File**, elige `database/clinica.sql` y pulsa **Execute**. También se puede ejecutar desde la carpeta `clinica`:

```bash
sqlcmd -S localhost -E -C -i database/clinica.sql
```

El script usa la base `MiBaseDeDatos` (la crea si no existe), y crea las tablas y datos de ejemplo ficticios.

> Ejecutarlo otra vez **borra las tablas del sistema** y deja solo los datos de ejemplo. Sirve para reiniciar la demo antes de exponer.

Para comprobar la conexión por TCP, ejecuta esto en una terminal (debe mostrar `4`):

```bash
sqlcmd -S "tcp:localhost,1433" -E -C -d MiBaseDeDatos -Q "SELECT COUNT(*) FROM paciente"
```

## 4. Correr el sistema

**Forma rápida en Windows:** haz doble clic en `iniciar-sistema.bat`. Abre el backend y el frontend en dos ventanas y luego el navegador. Para apagar el sistema, cierra esas ventanas.

**Desde VS Code:** abre esta carpeta y pulsa `Ctrl+Shift+B`. Si pregunta si confías en la carpeta, responde que sí.

**Forma manual:** necesitas dos terminales abiertas al mismo tiempo. Si la terminal es PowerShell y bloquea `npm`, escribe `cmd` primero.

**Terminal 1, backend** (queda en http://localhost:8080):

```bash
cd backend
```

```bash
mvn spring-boot:run
```

**Terminal 2, frontend**:

```bash
cd frontend
```

```bash
npm install
```

```bash
npm run dev
```

Abre **http://localhost:5173** en el navegador.

## 5. Recorrido para la demostración

1. **Inicio:** muestra los totales y la agenda del día.
2. **Citas > Nueva cita:** elige paciente, médico, servicio y hora. Si repites el horario, el sistema lo rechaza.
3. **Atender:** registra signos vitales y diagnóstico. La cita pasa a *Atendida* y se guarda en el historial.
4. **Guardar y crear receta:** agrega medicamentos. Si el paciente tiene alergias, aparece un aviso.
5. **Imprimir:** abre la receta lista para imprimir, sin menú ni botones. Se puede guardar como PDF.
6. **Pacientes > (un paciente):** muestra su ficha y las pestañas de historial, citas y recetas.

La paciente María Torres Paredes ya trae una atención y una receta de ejemplo.

## 6. Reglas del sistema

- El documento del paciente, la colegiatura del médico y el nombre del servicio no se repiten.
- Cada cita ocupa 30 minutos: ni el médico ni el paciente pueden tener dos citas que se crucen.
- No se pueden crear citas en fechas pasadas.
- Solo las citas programadas se pueden editar, cancelar o atender.
- Atender una cita crea su entrada en el historial y la marca como atendida.
- Un médico o servicio inactivo no se puede elegir para citas nuevas. Un médico inactivo tampoco puede emitir recetas.
- No se puede eliminar un paciente, médico o servicio que ya tenga registros relacionados.

## 7. Estructura

```
clinica/
├── database/clinica.sql      Tablas y datos de ejemplo
├── backend/src/main/java/com/clinica/
│   ├── controller/           Endpoints REST
│   ├── service/              Reglas del sistema
│   ├── repository/           Acceso a datos (Spring Data JPA)
│   ├── entity/               Tablas como clases Java
│   ├── dto/                  Datos que entran y salen de la API
│   └── exception/            Errores convertidos a JSON
└── frontend/src/
    ├── pages/                Una pantalla por archivo
    ├── components/           Formularios y piezas compartidas
    ├── api.js                Llamadas al backend
    ├── hooks.js              Carga de datos y formularios
    └── styles.css            Estilos, incluido el de impresión
```

**Relaciones entre tablas**

```
paciente 1─N cita N─1 medico
              │ N
              └─ 1 servicio

cita 1─0..1 historial_clinico     (paciente y medico también 1─N)
historial_clinico 1─N receta      (opcional: una receta puede no venir de una atención)
receta 1─N receta_detalle
```

## 8. Endpoints de la API

| Método | Ruta | Descripción |
|---|---|---|
| GET, POST | `/api/pacientes` | Listar (`?q=` para buscar) y crear |
| GET, PUT, DELETE | `/api/pacientes/{id}` | Ver, editar y eliminar |
| GET | `/api/pacientes/{id}/historial` | Historial del paciente |
| GET, POST | `/api/medicos` | Listar y crear |
| GET, PUT, DELETE | `/api/medicos/{id}` | Ver, editar y eliminar |
| GET, POST | `/api/servicios` | Listar y crear |
| GET, PUT, DELETE | `/api/servicios/{id}` | Ver, editar y eliminar |
| GET, POST | `/api/citas` | Listar (`?fecha=&pacienteId=&medicoId=&estado=`) y crear |
| GET, PUT | `/api/citas/{id}` | Ver y editar |
| PATCH | `/api/citas/{id}/cancelar` | Cancelar |
| POST | `/api/historial` | Registrar una atención (con `citaId`, atiende la cita) |
| GET, PUT | `/api/historial/{id}` | Ver y editar |
| GET, POST | `/api/recetas` | Listar (`?pacienteId=`) y crear |
| GET, DELETE | `/api/recetas/{id}` | Ver y eliminar |
| GET | `/api/resumen` | Totales de la pantalla de inicio |

## 9. Problemas comunes

| Mensaje o síntoma | Causa y solución |
|---|---|
| `The TCP/IP connection to the host localhost, port 1433 has failed` | TCP/IP está desactivado o el servicio no se reinició. Repite el paso 2. |
| `Unable to load authentication DLL` o `no mssql-jdbc_auth` | Arranca el backend con `mvn spring-boot:run` desde la carpeta `backend`: ese comando prepara la DLL. El botón Run de un editor no la carga. |
| `Login failed for user` | Tu usuario de Windows no tiene acceso a SQL Server o a la base. |
| `Cannot open database "MiBaseDeDatos"` | Falta ejecutar `clinica.sql`. |
| `Port 8080 was already in use` | Otro programa usa el puerto. Ciérralo o cambia `server.port` en `application.properties`. |
| La página dice "El servidor no respondió bien" | El backend no está corriendo. Revisa la terminal 1. |
| `mvn` o `npm` no se reconoce | Falta agregarlo al `Path`, o hay que abrir una terminal nueva tras instalarlo. |

## 10. Personalizar

- Nombre, dirección y teléfono de la clínica, y la moneda: `frontend/src/utils.js`.
- Conexión a la base de datos: `backend/src/main/resources/application.properties`.

## Alcance

Es un proyecto académico de uso local en Windows: **no tiene inicio de sesión ni roles**. No se debe usar con datos reales de pacientes sin agregar antes esa seguridad.
