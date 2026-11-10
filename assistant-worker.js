const MODEL_PREFERENCES = [
  [
    "Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
    "Qwen2.5-1.5B-Instruct-q4f16_1",
    "Qwen2.5-1.5B-Instruct-q4f32_1"
  ],
  [
    "Qwen2.5-0.5B-Instruct-q4f16_1-MLC",
    "Qwen2.5-0.5B-Instruct-q4f16_1",
    "Qwen2.5-0.5B-Instruct-q4f32_1"
  ]
];
const MODEL_LIBRARY_BASE_URL = "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-models/v0_2_87/base/";
const QWEN_MODEL_RECORDS = [
  {
    model: "https://huggingface.co/mlc-ai/Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
    model_id: "Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
    model_lib: `${MODEL_LIBRARY_BASE_URL}Qwen2-1.5B-Instruct-q4f16_1_cs1k-webgpu.wasm`,
    low_resource_required: true,
    vram_required_MB: 1629.75,
    overrides: { context_window_size: 4096 }
  },
  {
    model: "https://huggingface.co/mlc-ai/Qwen2.5-0.5B-Instruct-q4f16_1-MLC",
    model_id: "Qwen2.5-0.5B-Instruct-q4f16_1-MLC",
    model_lib: `${MODEL_LIBRARY_BASE_URL}Qwen2-0.5B-Instruct-q4f16_1_cs1k-webgpu.wasm`,
    low_resource_required: true,
    overrides: { context_window_size: 4096 }
  }
];
const WASM_MODEL_ID = "onnx-community/Qwen2.5-0.5B-Instruct";

let engine = null;
let activeModelId = null;
let wasmGeneratorPromise = null;

function normalizeModelId(modelId) {
  return String(modelId || "").trim();
}

function postEvent(type, payload = {}, requestId) {
  postMessage({
    type,
    ...(requestId ? { requestId } : {}),
    ...payload
  });
}

async function importWebLLM() {
  return import("https://esm.run/@mlc-ai/web-llm@0.2.87");
}

function getAvailableModelIds(webllm) {
  const modelList = webllm.prebuiltAppConfig?.model_list;
  if (!Array.isArray(modelList)) {
    throw new Error("La configuración precompilada de WebLLM no contiene una lista de modelos válida.");
  }

  const availableIds = new Set(
    [...modelList, ...QWEN_MODEL_RECORDS].map((model) => normalizeModelId(model.model_id))
  );

  const supportedPreferences = MODEL_PREFERENCES.map((aliases) =>
    aliases.find((modelId) => availableIds.has(modelId))
  ).filter(Boolean);

  if (supportedPreferences.length === 0) {
    throw new Error("Esta versión de WebLLM no incluye los modelos Qwen 1.5B ni 0.5B requeridos.");
  }

  return supportedPreferences;
}

async function ensureEngine(webllm, modelId) {
  if (engine && activeModelId === modelId) {
    return engine;
  }

  const baseAppConfig = webllm.prebuiltAppConfig;
  if (!baseAppConfig || !Array.isArray(baseAppConfig.model_list)) {
    throw new Error("WebLLM no expuso una configuración precompilada válida.");
  }

  const appConfig = {
    ...baseAppConfig,
    model_list: [
      ...baseAppConfig.model_list.filter(
        (model) => !QWEN_MODEL_RECORDS.some((qwenModel) => qwenModel.model_id === model.model_id)
      ),
      ...QWEN_MODEL_RECORDS
    ],
    cacheBackend: "indexeddb"
  };

  const modelToLoad = normalizeModelId(modelId);
  try {
    const loadedEngine = await webllm.CreateMLCEngine(modelToLoad, {
      appConfig,
      initProgressCallback: (progress) => {
        const payload = {
          type: "progress",
          percent: Number.isFinite(progress?.progress) ? Math.round(progress.progress * 100) : null,
          text: progress?.text || "Preparando el asistente en tu navegador...",
          downloaded: progress?.downloaded || null,
          total: progress?.total || null
        };
        postEvent("progress", payload);
      }
    });
    engine = loadedEngine;
    activeModelId = modelToLoad;
    return engine;
  } catch (error) {
    engine = null;
    activeModelId = null;
    throw error;
  }
}

async function destroyEngine() {
  const engineToDestroy = engine;
  engine = null;
  activeModelId = null;

  if (typeof engineToDestroy?.unload === "function") {
    try {
      await engineToDestroy.unload();
    } catch (error) {
      console.warn("No se pudo liberar limpiamente el motor WebLLM.", error);
    }
  }
}

async function generateWithWasm({ question, context, systemPrompt, history = [] }, requestId) {
  if (!wasmGeneratorPromise) {
    wasmGeneratorPromise = (async () => {
      const { env, pipeline } = await import("https://esm.run/@huggingface/transformers@3.7.2");
      env.allowRemoteModels = true;
      env.allowLocalModels = false;
      env.backends.onnx.wasm.numThreads = 1;
      return pipeline("text-generation", WASM_MODEL_ID, {
        device: "wasm",
        dtype: "q4",
        progress_callback: (progress) => {
          postEvent("progress", {
            percent: Number.isFinite(progress?.progress) ? Math.round(progress.progress * 100) : null,
            text: progress?.status ? `Preparando modelo CPU: ${progress.status}` : "Preparando modelo CPU..."
          }, requestId);
        }
      });
    })().catch((error) => {
      wasmGeneratorPromise = null;
      throw error;
    });
  }

  postEvent("status", { text: "Modo CPU (lento) | preparando el modelo..." }, requestId);
  const generator = await wasmGeneratorPromise;
  const messages = [
    { role: "system", content: systemPrompt },
    ...(Array.isArray(history) ? history.slice(-4) : []),
    {
      role: "user",
      content: `Pregunta del usuario: ${question}\n\nContexto recuperado:\n${context}\n\nResponde en el idioma del usuario, con 2 a 4 oraciones y citando la sección o proyecto cuando sea relevante.`
    }
  ];

  const result = await generator(messages, {
    max_new_tokens: 200,
    do_sample: false
  });

  const generatedText = result?.[0]?.generated_text;
  const response = Array.isArray(generatedText)
    ? generatedText[generatedText.length - 1]?.content
    : generatedText;

  if (typeof response !== "string" || !response.trim()) {
    throw new Error("El modelo CPU no generó una respuesta.");
  }

  return response.trim();
}

self.addEventListener("message", async (event) => {
  const { type, payload = {}, requestId } = event.data || {};

  if (type === "destroy-engine") {
    try {
      await destroyEngine();
      postEvent("engine-destroyed", { text: "Motor liberado." }, requestId);
    } catch (error) {
      postEvent("error", { text: "No se pudo liberar el motor de forma limpia." }, requestId);
    }
    return;
  }

  if (type === "generate-wasm") {
    try {
      const response = await generateWithWasm(payload || {}, requestId);
      postEvent("done", { text: response }, requestId);
    } catch (error) {
      console.error("Error al ejecutar el modelo local en modo CPU.", error);
      postEvent("error", {
        text: "El asistente está usando el modo de compatibilidad por CPU. No se pudo cargar o ejecutar el modelo local; intentá nuevamente."
      }, requestId);
    }
    return;
  }

  if (type !== "generate") {
    return;
  }

  try {
    const { question, context, systemPrompt, history = [] } = payload;
    const webllm = await importWebLLM();
    const modelCandidates = getAvailableModelIds(webllm);

    let modelEngine = null;
    let lastError = null;

    for (let index = 0; index < modelCandidates.length; index += 1) {
      const candidate = modelCandidates[index];
      try {
        postEvent("status", { text: `Preparando modelo ${candidate}...` }, requestId);
        modelEngine = await ensureEngine(webllm, candidate);
        break;
      } catch (error) {
        lastError = error;
        const nextCandidate = modelCandidates[index + 1];
        if (nextCandidate) {
          postEvent("status", { text: `El modelo ${candidate} falló; reintentando con ${nextCandidate}...` }, requestId);
        }
      }
    }

    if (!modelEngine) {
      throw lastError || new Error("No se pudo cargar ningún modelo compatible.");
    }

    const messages = [
      { role: "system", content: systemPrompt },
      ...(Array.isArray(history) ? history.slice(-4) : []),
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
      postEvent("token", { token: delta }, requestId);
    }

    postEvent("done", { text: response.trim() || "No pude obtener una respuesta con la información disponible." }, requestId);
  } catch (error) {
    console.error("Error al ejecutar el modelo local en worker.", error);
    await destroyEngine().catch(() => undefined);

    if (/gpu|adapter|memory/i.test(error?.message || "")) {
      postEvent("model-reset", {
        text: "Se perdió la conexión con la GPU o quedó sin memoria suficiente. El asistente volvió al modo documentado para seguir respondiendo con evidencia."
      }, requestId);
      return;
    }

    const fallbackText = error?.message?.includes("modelos Qwen")
      ? error.message
      : "No se pudo inicializar el modelo local. El asistente sigue disponible con respuestas basadas en evidencia documental.";
    postEvent("error", { text: fallbackText }, requestId);
  }
});
