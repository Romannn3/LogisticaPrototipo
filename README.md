# PrototipoLogistico

Este proyecto es un MVP (Producto Minimo Viable) desarrollado para mostrar de forma practica y visual como funciona un sistema de gestion logistica enfocado en el transporte y distribucion de pedidos.

El objetivo principal es permitir que cualquier persona pueda probar el flujo completo del sistema navegando entre los distintos roles que intervienen en la operacion diaria, sin requerir configuraciones complejas ni registros previos.

---

## Como surgio este MVP y el uso de Inteligencia Artificial

Este desarrollo nacio a partir de la necesidad de tomar la logica y el funcionamiento de un sistema de gestion mas grande y complejo que ya existia, y traducirlo en un prototipo funcional, liviano y facil de mostrar a clientes o interesados.

Para lograrlo, utilice herramientas de inteligencia artificial como soporte durante el proceso:
- Analisis y recorte del alcance: Se usaron modelos de lenguaje para revisar la logica del sistema original y definir cuales eran las funciones indispensables para una primera version de muestra.
- Estructuracion de la base de datos y endpoints: La IA ayudo a simplificar las tablas y definir una API clara para manejar pedidos, hojas de ruta y recursos basicos.
- Desarrollo del frontend y experiencia de usuario: Se trabajo en conjunto con la IA para generar una interfaz limpia y comoda, organizando las pantallas segun las tareas que realiza cada usuario en la vida real.
- Asistencia en la programacion: La IA funciono como un asistente paso a paso para resolver dudas de codigo, conectar el frontend con el backend y aplicar buenas practicas de seguridad basica para una demo publica.

---

## Roles y funciones del sistema

El sistema esta dividido en tres perfiles operativos, que se pueden alternar facilmente desde la barra superior de la pantalla:

1. Responsable de Logistica
   - Panel de control con metricas generales de pedidos y viajes.
   - Planificacion de viajes y asignacion de pedidos a camiones.
   - Control de capacidad de carga de los vehiculos para no exceder limites.
   - Seguimiento del estado de la flota y choferes disponibles.

2. Vendedor
   - Carga de nuevos pedidos de forma manual mediante formulario.
   - Carga automatica pegando mensajes de texto o WhatsApp, donde el sistema identifica productos, cantidades y direcciones.
   - Listado y seguimiento de las solicitudes enviadas para ver si fueron aprobadas o despachadas.

3. Chofer
   - Visualizacion directa del viaje asignado en curso.
   - Consulta de la hoja de ruta con el detalle de las entregas y direcciones.
   - Notificacion de finalizacion del viaje una vez completado el recorrido.

---

## Modo Demo y datos aislados

Para que varias personas puedan probar la aplicacion sin interferir entre si:
- Cada navegador que ingresa a la demo trabaja con una copia temporal de los datos de prueba.
- Si un usuario crea un pedido nuevo o finaliza un viaje, esos cambios solo los ve el en su sesion.
- En la parte superior hay un boton para restaurar los datos iniciales de la sesion en cualquier momento.

---

## Tecnologias utilizadas

- Frontend: React con Vite, React Router y CSS personalizado.
- Backend: Python con Flask y SQLAlchemy.
- Base de datos: SQLite con datos de prueba precargados.

---

## Como ejecutarlo en local

### 1. Iniciar el Backend
Es necesario tener Python 3.10 o superior instalado.

Desde la carpeta del backend:
```bash
cd backend
pip install -r requirements.txt
python run.py
```
El servidor quedara escuchando en http://localhost:5000.

### 2. Iniciar el Frontend
Es necesario tener Node.js instalado.

Desde la carpeta del frontend:
```bash
cd frontend
npm install
npm run dev
```
La aplicacion estara disponible en http://localhost:5173.

---

## Despliegue en Internet

La aplicacion esta preparada para subirse a servicios en la nube gratuitos o de bajo costo:

- Frontend (Vercel):
  Se sube seleccionando la carpeta `frontend` como directorio raiz. El proyecto incluye el archivo `vercel.json` necesario para que la navegacion entre rutas funcione correctamente al refrescar la pagina. Debe configurarse la variable de entorno `VITE_API_BASE_URL` apuntando a la direccion publica del backend.

- Backend (Render o Railway):
  Se despliega seleccionando la carpeta `backend` como un Web Service en Python. El repositorio incluye un archivo `Procfile` configurado para iniciar el servidor de manera segura utilizando Gunicorn (`gunicorn -w 2 -b 0.0.0.0:$PORT run:app`).
