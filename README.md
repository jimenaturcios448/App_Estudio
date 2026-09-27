# Estudio

Aplicación web para convertir tus apuntes en tarjetas de estudio y cuestionarios. Sube un PDF o una foto de tus notas, la app extrae el texto automáticamente (con OCR si hace falta), y en segundos tienes un mazo de flashcards listo para repasar o un quiz para ponerte a prueba.

**[Ver el proyecto en vivo →](https://jimenaturcios448.github.io/App_Estudio/)**

![Página de inicio](capturas/inicio.png)

## Qué hace

- Importa PDFs e imágenes (PNG/JPG) y extrae el texto automáticamente, usando OCR cuando el documento no tiene texto seleccionable.
- Genera tarjetas de pregunta/respuesta a partir de ese texto, listas para editar antes de guardarlas.
- Modo flashcards: tarjetas que se voltean, con opción de mezclar el orden.
- Modo quiz: preguntas de opción múltiple generadas del mismo mazo, con resultados al final.
- Organiza el contenido por temas, y todo se guarda en el navegador (`localStorage`) sin necesidad de servidor.

![Importación de documentos](capturas/importacion.png)

## Cómo se ve estudiando

![Modo de estudio](capturas/estudio.png)

![Cuestionario](capturas/quiz.png)

## Tecnologías

HTML, CSS y JavaScript puro — sin frameworks ni backend. Para la extracción de texto usa [PDF.js](https://mozilla.github.io/pdf.js/) (lectura de PDFs) y [Tesseract.js](https://tesseract.projectnaptha.com/) (OCR sobre imágenes).

## Estructura del proyecto

```
App_Estudio/
├── capturas/
├── index.html
├── style.css
├── script.js
└── README.md
```

## Cómo probarlo localmente

Clona el repositorio y abre `index.html` en tu navegador (o usa la extensión Live Server en VS Code):

```bash
git clone https://github.com/jimenaturcios448/App_Estudio.git
cd App_Estudio
```

## Por qué lo hice

Proyecto de portafolio para practicar manipulación del DOM sin frameworks, manejo de `localStorage` como persistencia, e integración de librerías externas (PDF.js y Tesseract.js) en un flujo real de usuario.

## Autora

**Jimena Turcios** — [github.com/jimenaturcios448](https://github.com/jimenaturcios448)