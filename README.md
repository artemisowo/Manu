Readme Técnico

# 1. Descripción técnica del proyecto

MANU es una aplicación orientada a la reducción de animales en situación de calle, facilitando la conexión entre la comunidad, organizaciones y procesos de ayuda animal.
El sistema centraliza información relacionada con animales abandonados, promueve acciones responsables y apoya la gestión de rescates, adopciones y seguimiento. El mapa se utilizaría para localizar la ubicación de cada animal callejero, facilitando su busqueda.

El proyecto está diseñado para ser escalable, modular y adaptable a distintos contextos territoriales.

# 2. Objetivos del Sistema

Reducir la cantidad de animales callejeros.

Facilitar la visibilidad de animales en situación de abandono.

Apoyar procesos de rescate, adopción y cuidado responsable.

Centralizar información relevante para usuarios y colaboradores.

# 3. Arquitectura del sistema

La aplicación sigue una arquitectura cliente-servidor, separando claramente la lógica de presentación, negocio y datos.

Componentes principales:

Cliente: Interfaz de usuario para interacción con el sistema.

Servidor: API que gestiona la lógica del negocio.

Base de datos: Persistencia de información de usuarios, animales y acciones.

# 4. Tecnologías y herramientas

Frontend: Angular

Backend: TypeScript integrado + Firebase

Base de datos: Firebase

Hosting: * Aún no existe *

# 5. Lenguajes 

Frontend: Html, CSS, Typescript

Backend: TypeScript

# 6. Cambios dentro del Front-End y Back-End

## Actualización técnica – Semana 2

### Front-End (Angular)

- Creación inicial del proyecto en Angular y configuración base del entorno.
- Correcciones visuales y de experiencia de usuario (UI):
  - Ajustes de márgenes y eliminación de líneas sobrantes en las páginas de Inicio, Nosotros y Contacto.
  - Reducción y adaptación responsiva del botón “(+)” en la vista del mapa.
  - Ajuste de tamaño y comportamiento de botones de contacto, incluyendo corrección de estados hover.
- Reestructuración de la sección “Nosotros”, organizando la información en formato de cuadrícula para mejorar la legibilidad.
- Modificación del formulario de ingreso de animales:
  - Reemplazo de selección cerrada de enfermedades por un campo de texto libre.
- Incorporación de comunas de Viña del Mar en el formulario de registro de usuarios.
- Corrección de problemas de estilos provocados por cambios globales de CSS.
- Ajuste de fondos utilizando `min-height: 100vh` para asegurar compatibilidad con distintos tamaños de pantalla.
- Integración visual del mapa y corrección de iconos de marcadores.

### Back-End (TypeScript + Firebase)

- Integración de Firebase Firestore como base de datos persistente.
- Creación del servicio `ServicioAnimal` para la comunicación entre la aplicación y Firestore.
- Implementación de lógica para:
  - Guardar animales en la base de datos.
  - Leer animales desde Firestore al iniciar la aplicación.
  - Mostrar animales almacenados directamente en el mapa.
- Configuración correcta del archivo `angular.json` para servir los assets necesarios (iconos del mapa).
- Corrección de errores relacionados con:
  - Rutas de archivos.  
  - Inyección de dependencias.
  - Tipado en TypeScript (`number | null`).
- Ajuste de reglas de Firestore para permitir lecturas y escrituras durante la etapa de desarrollo.
- Implementación correcta de métodos como `addDoc` y `collectionData`.
- Verificación de persistencia de datos mediante la consola de Firebase.
- Creación de cuenta en Cloudinary para futura gestión de imágenes subidas por usuarios (pendiente de integración completa).

# 7. Decisiones técnicas

Durante el desarrollo del proyecto MANU se tomaron diversas decisiones técnicas orientadas a mejorar la experiencia de usuario, la coherencia visual y la usabilidad de la aplicación, considerando tanto aspectos funcionales como de diseño.

- Se decidió realizar un rediseño parcial de las páginas “Nosotros” y “Contacto”, con el objetivo de mejorar su atractivo visual, orden de la información y facilidad de navegación para el usuario.

- Se optó por cambiar el ícono que representa la ubicación de los animales en el mapa por un ícono personalizado, con el fin de reforzar la identidad visual y de marca del proyecto MANU.

- Se decidió adaptar de forma responsiva las páginas de Inicio de sesión, Registro, Mapa y el popup de ingreso de datos de animales, debido a que en dispositivos con pantallas más pequeñas los elementos no se visualizaban correctamente, afectando la experiencia del usuario.

- Se determinó limitar la visualización del mapa únicamente a la ciudad de Viña del Mar, con el propósito de evitar que el usuario navegue fuera del área de cobertura del proyecto, previniendo confusión y mejorando la usabilidad.

- Se modificaron los estilos del menú que muestra los datos de los animales ingresados, con el objetivo de mantener coherencia visual y reforzar la identidad de marca de MANU.

- Se realizaron cambios en los estilos del panel de filtros, alineándolos con la identidad visual del proyecto para ofrecer una experiencia de usuario más consistente.

- Se decidió crear una página de perfil en su versión mínima viable (MVP), con el fin de mejorar la experiencia del usuario y sentar las bases para futuras funcionalidades relacionadas con la gestión de cuentas.

- Se decidió actualizar el apartado de edad para los animales. En vez de generar una edad específica para el animal, se categorizaría de mejor manera entre 3 secciones: (Joven, Adulto y Viejo) De esa forma se organizaría mejor.
