# Changelog del asistente

## 2026-11-10

### Qué se modificó
- Reestructuré la base documental para que use registros ordenados y reutilizables.
- Separé la lógica de recuperación en `js/assistant/retrieval.js` para centralizar la normalización, aliases y sanitización.
- Reforcé la detección de intentos de prompt injection y la validación de respuestas con evidencia.
- Mejoré el worker para incluir `requestId`, notificación de progreso y fallback documentado.
- Ajusté la UI del chat para volver al modo documentado cuando WebLLM falla o se queda sin memoria.

### Por qué
- El asistente anterior validaba demasiado severamente las cifras y no distinguía bien entre información documentada y contenido suelto.
- El sistema de recuperación era demasiado rígido para preguntas con sinónimos o reformulaciones.
- Cuando decía "No se pudo inicializar el modelo", el usuario quedaba sin respuesta útil.

### Problemas corregidos
- alucinaciones por ausencia de comprobación de evidencia
- respuestas con cifras no documentadas
- flujo de error que bloqueaba la conversación
- falta de robustez ante consultas con sinónimos y variaciones de lenguaje

### Funcionalidades agregadas
- recuperación documental con validación de evidencia
- modo alternativo sin WebGPU
- fallback seguro basado en documentos recuperados
- mejor protocolo de mensajes entre worker y frontend

### Pruebas ejecutadas
- validación de sintaxis de los archivos JavaScript del proyecto
- verificación HTTP del sitio estático en `http://localhost:8000/index.html`
- comprobación de carga de rutas relativas en servidor local

### Observaciones
- No se registraron contradicciones documentadas entre el CV y el portfolio en los datos actualmente incorporados.
- La base documental sigue siendo estática y compatible con GitHub Pages, sin backend ni API externa.
