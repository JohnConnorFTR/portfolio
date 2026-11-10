const PREFERRED_MODELS = [
  "Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
  "Qwen2.5-0.5B-Instruct-q4f16_1-MLC",
  "Qwen2-1.5B-Instruct-q4f16_1",
  "Qwen2-0.5B-Instruct-q4f16_1",
  "Qwen2-1.5B-Instruct-q4f32_1",
  "Qwen2-0.5B-Instruct-q4f32_1"
];

let engine = null;
let activeModelId = null;

function normalizeModelId(modelId) {
  return String(modelId || "").trim();
}

async function importWebLLM() {
  return import("https://esm.run/@mlc-ai/web-llm@0.2.87");
}

function resolveModelIds() {
  const preferred = [...PREFERRED_MODELS];
  const canonical = {
    "Qwen2.5-1.5B-Instruct-q4f16_1-MLC": [
      "Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
      "Qwen2-1.5B-Instruct-q4f16_1",
      "Qwen2-1.5B-Instruct-q4f32_1"
    ],
    "Qwen2.5-0.5B-Instruct-q4f16_1-MLC": [
      "Qwen2.5-0.5B-Instruct-q4f16_1-MLC",
      "Qwen2-0.5B-Instruct-q4f16_1",
      "Qwen2-0.5B-Instruct-q4f32_1"
    ]
  };

  return { preferred, canonical };
}

async function pickModelId() {
  const { preferred, canonical } = resolveModelIds();
  try {
    const webllm = await importWebLLM();
    const modelList = webllm.prebuiltAppConfig?.model_list ?? [];
    const knownNames = modelList.map((model) => normalizeModelId(model.model_id || model.model || model.name));
    for (const candidate of preferred) {
      if (knownNames.includes(candidate)) return candidate;
    }
    for (const candidate of preferred) {
      const aliases = canonical[candidate] || [candidate];
      if (aliases.some((alias) => knownNames.some((name) => name === alias || name.includes(alias.replace(/-MLC$/, ""))))) {
        return candidate;
      }
    }
  } catch (error) {
    console.warn("No se pudo consultar la lista de modelos de WebLLM; se usa la estrategia de fallbacks por nombre.", error);
  }

  return preferred[0];
}

async function ensureEngine(modelId) {
  if (engine && activeModelId === modelId) {
    return engine;
  }

  const webllm = await importWebLLM();
  const appConfig = {
    cacheBackend: "indexeddb"
  };

  const modelToLoad = normalizeModelId(modelId);
  engine = await webllm.CreateMLCEngine(modelToLoad, {
    appConfig,
    initProgressCallback: (progress) => {
      const payload = {
        type: "progress",
        percent: Number.isFinite(progress?.progress) ? Math.round(progress.progress * 100) : null,
        text: progress?.text || "Preparando el asistente en tu navegador...",
        downloaded: progress?.downloaded || null,
        total: progress?.total || null
      };
      postMessage(payload);
    }
  });
  activeModelId = modelToLoad;
  return engine;
}

self.addEventListener("message", async (event) => {
  const { type, payload } = event.data || {};

  if (type !== "generate") {
    return;
  }

  try {
    const { question, context, systemPrompt, history = [] } = payload;
    let chosenModel = await pickModelId();
    const modelCandidates = [
      chosenModel,
      "Qwen2.5-0.5B-Instruct-q4f16_1-MLC",
      "Qwen2-0.5B-Instruct-q4f16_1"
    ].filter((value, index, array) => value && array.indexOf(value) === index);

    let modelEngine = null;
    let lastError = null;

    for (let index = 0; index < modelCandidates.length; index += 1) {
      const candidate = modelCandidates[index];
      try {
        postMessage({ type: "status", text: `Preparando modelo ${candidate}...` });
        modelEngine = await ensureEngine(candidate);
        break;
      } catch (error) {
        lastError = error;
        const nextCandidate = modelCandidates[index + 1];
        if (nextCandidate) {
          postMessage({ type: "status", text: `El modelo ${candidate} falló; reintentando con ${nextCandidate}...` });
        }
      }
    }

    if (!modelEngine) {
      throw lastError || new Error("No se pudo cargar ningún modelo compatible.");
    }

    const messages = [
      { role: "system", content: systemPrompt },
      ...history,
      {
        role: "user",
        content: `Pregunta del usuario: ${question}\n\nContexto recuperado:\n${context}\n\nResponde en el idioma del usuario, con 2 a 4 oraciones y citando la sección o proyecto cuando sea relevante.`
      }
    ];

    const stream = await modelEngine.chat.completions.create({
      messages,
      temperature: 0.2,
      top_p: 0.9,
      max_tokens: 280,
      seed: 1234,
      stream: true
    });

    let response = "";
    for await (const chunk of stream) {
      const delta = chunk?.choices?.[0]?.delta?.content || "";
      if (!delta) {
        continue;
      }
      response += delta;
      postMessage({ type: "token", token: delta });
    }

    postMessage({ type: "done", text: response.trim() || "No pude obtener una respuesta con la información disponible." });
  } catch (error) {
    console.error("Error al ejecutar el modelo local en worker.", error);
    const fallbackText = "No se pudo inicializar el modelo local. Intentá nuevamente o escribí directamente a facundorinaldi91@gmail.com.";
    postMessage({ type: "error", text: fallbackText });
  }
});
