@echo off
rem Abre el backend y el frontend en dos ventanas y luego el navegador.
rem Para apagar el sistema, cierra esas dos ventanas.

start "Clinica - Backend (no cerrar)" /d "%~dp0backend" cmd /k mvn spring-boot:run
start "Clinica - Frontend (no cerrar)" /d "%~dp0frontend" cmd /k "(if not exist node_modules npm install) & npm run dev"

echo Esperando a que el backend responda...
echo Si tarda mas de 2 minutos, revisa el error en la ventana del backend.

:esperar
timeout /t 2 /nobreak >nul
curl -s -o nul http://localhost:8080/api/resumen
if errorlevel 1 goto esperar

start "" http://localhost:5173
