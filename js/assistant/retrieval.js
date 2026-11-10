(() => {
  const knowledgeBase = Array.isArray(window.PORTFOLIO_KB) ? window.PORTFOLIO_KB : [];
  const STOP_WORDS = new Set([
    "a","al","algo","algun","alguna","algunas","algunos","ante","aqui","asi","bajo","bien","cada",
    "como","con","contra","cual","cuales","cuando","cuanto","cuantos","de","del","desde","donde","dos",
    "el","ella","ellas","ellos","en","entre","era","es","esa","esas","ese","eso","esos","esta","estas",
    "este","esto","estos","fue","ha","hacia","hasta","hay","la","las","le","les","lo","los","mas",
    "me","mi","mis","mucha","muchas","mucho","muchos","muy","nada","ni","no","nos","o","otra","otras",
    "otro","otros","para","pero","poco","por","porque","que","quien","quienes","se","sea","ser","si",
    "sin","sobre","son","su","sus","te","tener","tiene","tienen","tu","tus","un","una","unas","uno",
    "unos","y","ya","donde","como","cuanto","puedo","podria","quisiera","quiero"
  ]);

  const ALIAS_MAP = {
    ".net": [".net", "dotnet", "net", "c#", "csharp", "aspnet", "asp.net"],
    "banca": ["banca", "banking", "bancarias", "banco", "santander"],
    "seguros": ["seguros", "seguro", "insurance", "siniestro", "siniestros", "la caja", "sancor"],
    "experiencia": ["experiencia", "trayectoria", "trabajo", "trabaja", "empleo", "cv"],
    "desarrollo": ["desarrollo", "software", "engineering", "programacion", "full stack"],
    "ia": ["ia", "inteligencia artificial", "ai", "agentes", "rag", "llm", "semantic kernel"],
    "datos": ["datos", "sql", "database", "postgresql", "mysql", "redis", "qdrant", "pinecone"],
    "cloud": ["cloud", "nube", "devops", "gcp", "docker", "kubernetes", "ci/cd"],
    "formacion": ["formacion", "educacion", "estudios", "universidad", "utn"],
    "idiomas": ["idioma", "ingles", "english"],
    "proyectos": ["proyecto", "proyectos", "copilot", "alumbra", "workflow", "erp"],
    "chatbots": ["chatbots", "chatbot"],
    "frontend": ["frontend", "angular", "react", "typescript", "javascript", "html", "css"],
    "backend": ["backend", "aspnet", "api", "microservicios", "fastapi", "node", ".net"],
    "disponibilidad": ["disponibilidad", "disponible", "trabajo", "oportunidad", "contratacion", "consultoria"],
    "contacto": ["contacto", "email", "linkedin", "telefono", "direccion"],
    "python": ["python", "fastapi"],
    "javascript": ["javascript", "typescript", "node"],
    "c": ["c", "c++", "cpp"],
    "csharp": ["c#", "csharp", "dotnet"],
    "langchain": ["langchain", "lang chain"],
    "semantic": ["semantic kernel", "semantic"],
    "qdrant": ["qdrant"]
  };

  const CATEGORY_RULES = [
    { category: "PERFIL", pattern: /\b(quien|perfil|resumen|facundo|rinaldi|sobre quien|sobre facundo)\b/ },
    { category: "EXPERIENCIA", pattern: /\b(experiencia|trayectoria|trabajo|empleo|puesto|banca|banking|seguros|santander|la caja|sancor|sspv|insurance|consultor)\b/ },
    { category: "FRONTEND", pattern: /\b(frontend|angular|react|typescript|javascript|html|css|ui)\b/ },
    { category: "BACKEND", pattern: /\b(backend|asp\.net|api|microservicios|fastapi|node|dotnet|c#|sql server|postgresql|redis)\b/ },
    { category: "IA", pattern: /\b(ia|ai|inteligencia artificial|rag|semantic kernel|langchain|autogen|agentes|llm|prompt)\b/ },
    { category: "PROYECTOS", pattern: /\b(proyecto|proyectos|copilot|alumbra|erp|workflow|claims|rag)\b/ },
    { category: "FORMACION", pattern: /\b(formacion|educacion|estudios|universidad|utn|diplomatura|bachiller|humanidades)\b/ },
    { category: "IDIOMAS", pattern: /\b(ingles|idioma|idiomas|english)\b/ },
    { category: "CLOUD", pattern: /\b(cloud|nube|devops|gcp|docker|kubernetes|ci\/cd|github actions)\b/ },
    { category: "DISPONIBILIDAD", pattern: /\b(disponibilidad|disponible|trabajo|contratacion|oportunidad)\b/ },
    { category: "UBICACION", pattern: /\b(ubicacion|ciudad|donde vive|residencia|pais|argentina|buenos aires)\b/ }
  ];

  function normalizeText(value) {
    if (typeof value !== "string") return "";
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function tokenizeText(value) {
    const normalized = normalizeText(value);
    return (normalized.match(/c\+\+|c#|\.net|[a-z0-9]+/g) || []).filter(Boolean);
  }

  function expandAliases(queryTerms) {
    const expanded = new Set();
    queryTerms.forEach((term) => {
      expanded.add(term);
      const aliases = ALIAS_MAP[term] || [term];
      aliases.forEach((alias) => expanded.add(normalizeText(alias)));
    });
    return [...expanded].filter(Boolean);
  }

  function detectQueryCategories(question) {
    const normalized = normalizeText(question);
    const categories = CATEGORY_RULES
      .filter((rule) => rule.pattern.test(normalized))
      .map((rule) => rule.category);
    return [...new Set(categories)];
  }

  function buildQueryTerms(question) {
    const tokens = tokenizeText(question)
      .filter((token) => !STOP_WORDS.has(token) && token.length > 1)
      .map((token) => normalizeText(token));
    return [...new Set(expandAliases(tokens))];
  }

  function scoreDocument(document, queryTerms, categoryMatches, question) {
    const text = normalizeText(`${document.title} ${document.content}`);
    const keywordTerms = [...new Set([...(document.keywords || []), ...(document.aliases || [])])].map((item) => normalizeText(item));
    const phraseBoost = queryTerms.filter((term) => text.includes(term)).length;
    const keywordBoost = queryTerms.filter((term) => keywordTerms.includes(term)).length;
    const titleBoost = queryTerms.filter((term) => normalizeText(document.title).includes(term)).length;
    const categoryBoost = categoryMatches.some((category) => category === document.category || document.category.startsWith(`${category}_`)) ? 3 : 0;
    const questionTypeBoost = /\b(quien|que|cual|cuando|donde|como|porque)\b/.test(normalizeText(question)) && /\b(facundo|perfil|experiencia|stack|proyecto|tecnologia|ai|rag|dotnet|angular|seguro|banca)\b/.test(normalizeText(document.content)) ? 2 : 0;
    const score = phraseBoost * 3 + keywordBoost * 2 + titleBoost * 2 + categoryBoost + questionTypeBoost;
    return { ...document, score, matchedTerms: phraseBoost + keywordBoost };
  }

  function findRelevantContext(question) {
    const cleanedQuestion = String(question || "").trim();
    if (!cleanedQuestion) {
      return { documents: [], score: 0, confidence: 0, sources: [], queryCategory: [], text: "" };
    }

    const queryTerms = buildQueryTerms(cleanedQuestion);
    const queryCategory = detectQueryCategories(cleanedQuestion);
    const effectiveCategories = queryCategory.length ? queryCategory : ["PERFIL"];

    const rankedDocuments = knowledgeBase
      .map((document) => scoreDocument(document, queryTerms, effectiveCategories, cleanedQuestion))
      .filter((document) => document.score > 0)
      .sort((a, b) => b.score - a.score || a.title.length - b.title.length);

    if (rankedDocuments.length === 0) {
      return {
        documents: [],
        score: 0,
        confidence: 0,
        sources: [],
        queryCategory: effectiveCategories,
        text: ""
      };
    }

    const bestScore = rankedDocuments[0].score;
    const selectedDocuments = rankedDocuments
      .filter((document) => document.score >= Math.max(2, bestScore - 2))
      .slice(0, 4);

    const docs = selectedDocuments.map((document) => ({
      id: document.id,
      category: document.category,
      title: document.title,
      source: document.source,
      content: document.content,
      url: document.url || null,
      score: document.score,
      matchedTerms: document.matchedTerms
    }));

    const confidence = Math.min(1, Math.max(0.15, bestScore / Math.max(10, bestScore + 3)));

    return {
      documents: docs,
      score: bestScore,
      confidence,
      sources: [...new Set(docs.map((doc) => doc.source))],
      queryCategory: effectiveCategories,
      text: docs.map((doc) => `[${doc.category} | ${doc.source}] ${doc.content}`).join("\n")
    };
  }

  function buildEvidenceFallback(retrieval) {
    const documents = Array.isArray(retrieval?.documents) ? retrieval.documents : [];
    if (documents.length === 0) {
      return {
        text: "No encontre esa información documentada en el portfolio ni en el CV. Si querés, podés dejar tu consulta por contacto.",
        sources: [],
        documents: [],
        score: 0,
        confidence: 0,
        queryCategory: retrieval?.queryCategory || []
      };
    }

    return {
      text: documents.map((doc) => `• ${doc.content}`).join("\n"),
      sources: [...new Set(documents.map((doc) => doc.source))],
      documents,
      score: retrieval?.score || 0,
      confidence: retrieval?.confidence || 0,
      queryCategory: retrieval?.queryCategory || []
    };
  }

  function containsPromptInjection(message) {
    const normalized = normalizeText(message || "");
    const suspiciousPatterns = [
      /ignora.*(instrucciones|reglas|prompt|sistema)/,
      /olvida.*(instrucciones|reglas|prompt|sistema)/,
      /developer mode|jailbreak|override system|system prompt/i,
      /reveal.*(prompt|instructions|system)/,
      /actua como.*(assistant|ai|chatgpt|llm)/
    ];
    const legitimatePromptPatterns = [
      /que es.*prompt/i,
      /explica.*prompt/i,
      /prompt injection/i,
      /instrucciones del sistema/i
    ];

    if (legitimatePromptPatterns.some((pattern) => pattern.test(normalized))) {
      return false;
    }

    return suspiciousPatterns.some((pattern) => pattern.test(normalized));
  }

  function sanitizeAnswer(answer, retrievalText) {
    const answerText = String(answer || "").trim();
    if (!answerText) {
      return "No tengo esa información confirmada en el portfolio o en los CV. Si querés, podés dejar tu consulta por contacto.";
    }

    const normalizedAnswer = normalizeText(answerText);
    const evidence = normalizeText(String(retrievalText || ""));
    const sensitivePatterns = /\b(edad|nacimiento|fecha de nacimiento|telefono|direccion|dni|documento|email|linkedin|passport)\b/;
    if (sensitivePatterns.test(normalizedAnswer) && !sensitivePatterns.test(evidence)) {
      return "No tengo esa información confirmada en el portfolio o en los CV. Si querés, podés dejar tu consulta por contacto.";
    }

    const numbersInAnswer = Array.from(new Set((answerText.match(/\d+(?:[.,]\d+)?%?/g) || [])));
    const numbersInEvidence = Array.from(new Set((String(retrievalText || "").match(/\d+(?:[.,]\d+)?%?/g) || [])));
    const hasUnconfirmedNumber = numbersInAnswer.some((value) => !numbersInEvidence.includes(value)) && !/\b(mas de|alrededor de|aproximadamente|sobre|desde|hasta)\b/.test(normalizedAnswer);
    if (hasUnconfirmedNumber) {
      return "No puedo confirmar esa cifra con la documentación disponible. Te cuento lo que sí está respaldado por el portfolio y el CV.";
    }

    return answerText;
  }

  window.AssistantRetrieval = {
    normalizeText,
    tokenizeText,
    buildQueryTerms,
    findRelevantContext,
    buildEvidenceFallback,
    containsPromptInjection,
    sanitizeAnswer
  };
})();
