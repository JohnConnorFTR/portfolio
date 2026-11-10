# Asistente del portfolio

## Arquitectura

El asistente de perfil está integrado en un sitio estático sin backend ni dependencias adicionales. La lógica principal sigue en `index.html`, pero la recuperación documental se separó en un módulo seguro bajo `js/assistant/retrieval.js` para mantener una base de conocimiento reutilizable y menos propensa a errores.

La estructura actual es:

- `index.html`: estructura visual, formulario del chat, estados de UI y conexión con el worker.
- `knowledge-base.js`: datos del CV y del portfolio en formato estructurado.
- `js/assistant/retrieval.js`: normalización, sinónimos, relevancia, filtros de prompt injection y sanitización.
- `assistant-worker.js`: administración del motor WebLLM, downloads diferidos, fallbacks y manejo de streaming.

## Base de conocimientos

La base documental está estructurada con registros con:

- `id`
- `category`
- `title`
- `source`
- `content`
- `keywords`
- `aliases`
- `relatedProjectIds`
- `tags`

Esto permite recuperar información más robusta incluso cuando el usuario engloba conceptos con sinónimos o reformulaciones.

## Recuperación de información

El algoritmo usa una estrategia híbrida leve basada en:

- normalización Unicode y acentos
- tokenización de frases, tecnologías y nombres compuestos
- sinónimos y aliases para `.NET`, `C#`, `Semantic Kernel`, `RAG`, `Angular`, `SQL`, etc.
- ponderación por coincidencias en texto, categorías y título
- selección de hasta 4 documentos relevantes por consulta

La salida devuelve:

- `documents`
- `score`
- `confidence`
- `sources`
- `queryCategory`
- `text`

Importante: `confidence` es una medida de calidad de evidencia documental, no una probabilidad estadística.

## WebGPU y WebLLM

El asistente sigue usando WebLLM con WebGPU cuando existe soporte. La inicialización es diferida y sólo ocurre cuando el usuario formula una consulta que requiere IA.

La lógica del worker:

- prepara el motor sólo bajo demanda
- reintenta con modelos alternativos cuando el primero falla
- usa caché IndexedDB del entorno WebLLM
- se reinicia de forma segura cuando hay fallo de GPU o memoria insuficiente
- en modo sin GPU o con engine caído, vuelve al modo documentado con evidencia

## Modo alternativo sin WebGPU

Si la GPU no está disponible o WebLLM no puede inicializarse, el sistema no bloquea la consulta. En ese caso:

- se ejecuta la recuperación documental
- se responde con evidencia del CV y del portfolio
- se informa claramente si la respuesta no está respaldada en la documentación
- se mantiene la funcionalidad principal del asistente

## Manejo de errores y seguridad

Se evita responder con información no documentada:

- prompt injection se filtra con un control más conservador
- respuestas con datos sensibles o cifras no respaldadas se rechazan
- el texto de la IA se renderiza con `textContent` y no con `innerHTML`

## Cómo incorporar nueva información

1. Editá `knowledge-base.js`.
2. Agregá el documento con `id`, `category`, `title`, `content`, `keywords`, `aliases` y `tags`.
3. Mantén la fuente original del CV o del portfolio.
4. Si se detecta una contradicción, documentala para revisión y no la inventes.

## Cómo probar

Se validó sintaxis JavaScript y se comprobó que la página sirve correctamente en un servidor estático. El flujo recomendado para pruebas manuales:

- abrir la página en navegador
- consultar perfil, experiencia, proyectos, stack y formación
- probar un navegador sin WebGPU
- probar preguntas en inglés y en español
- probar preguntas ambiguas y de prompt injection
- limpiar historial y volver a consultar

## Requisitos de navegador

- navegador moderno con soporte WebGPU (opcional, mejora la experiencia)
- HTTPS o localhost recomendado para WebGPU y WebLLM
- GitHub Pages compatible con rutas relativas
