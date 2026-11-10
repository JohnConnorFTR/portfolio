window.PORTFOLIO_KB = [
  {
    id: "profile-01",
    category: "PERFIL",
    title: "Perfil profesional",
    source: "CV",
    content: "Ingeniero de Software Senior con más de 10 años de trayectoria en desarrollo y 3+ años en banca y seguros. Especializado en .NET C#, Angular, Clean Architecture e integración de IA generativa, agentes autónomos y RAG.",
    keywords: ["facundo", "rinaldi", "software", "senior", "ingeniero", "ai", "rag"],
    aliases: ["facundo", "rinaldi", "ingeniero de software", "senior", "perfil", "software"],
    relatedProjectIds: ["project-rag-01", "project-erp-01"],
    tags: ["perfil", "ingenieria", "ai"]
  },
  {
    id: "exp-sspv-01",
    category: "EXPERIENCIA",
    title: "Experiencia en SSPV",
    source: "CV",
    content: "Analista Desarrollador Full Stack & AI Specialist en SSPV desde enero de 2022. Diseñó aplicaciones críticas en banca y seguros para Santander, La Caja, Federación Patronal y Sancor. Integró Semantic Kernel y .NET reduciendo validaciones en un 40%. Implementó RAG, visión por computadora, Docker, Kubernetes (GCP) y CI/CD.",
    keywords: ["sspv", "banca", "seguros", "santander", "la caja", "federacion patronal", "sancor", "semantic kernel", "rag", "docker", "kubernetes", "gcp", "ci/cd"],
    aliases: ["sspv", "banca", "banking", "seguros", "insurance", "santander", "la caja", "sancor", "semantic kernel", "rag"],
    relatedProjectIds: ["project-rag-01", "project-rag-02"],
    tags: ["banca", "seguros", "ai", "desarrollo"]
  },
  {
    id: "exp-freelance-01",
    category: "EXPERIENCIA",
    title: "Consultor y arquitecto de soluciones AI",
    source: "CV",
    content: "Consultor de Software & Arquitecto de Soluciones AI entre marzo de 2011 y enero de 2022. Diseñó plataformas con agentes autónomos, chatbots avanzados conectados a ERP y aplicaciones full-stack con React, Node y .NET.",
    keywords: ["consultor", "arquitecto", "soluciones ai", "agentes autonomos", "chatbots", "erp", "react", "node", ".net"],
    aliases: ["freelance", "consultor", "arquitecto", "ai", "chatbots", "erp", "agentes"],
    relatedProjectIds: ["project-agent-01"],
    tags: ["consultoria", "ia", "erp"]
  },
  {
    id: "skill-ai-01",
    category: "IA",
    title: "IA y agentes",
    source: "CV",
    content: "Especializado en Microsoft Semantic Kernel, LangChain, RAG, Function Calling, AutoGen, Agentic Workflows y Prompt Engineering. Modelos: OpenAI, Claude, Gemini y Ollama. Vectores: Qdrant, Pinecone y pgvector.",
    keywords: ["semantic kernel", "langchain", "rag", "function calling", "autogen", "agentic workflows", "prompt engineering", "openai", "claude", "gemini", "ollama", "qdrant", "pinecone", "pgvector"],
    aliases: ["semantic kernel", "langchain", "rag", "function calling", "autogen", "agentes", "llm", "vectores", "qdrant"],
    relatedProjectIds: ["project-rag-01"],
    tags: ["ia", "agentic", "vectores"]
  },
  {
    id: "skill-backend-01",
    category: "BACKEND",
    title: "Backend y arquitectura",
    source: "CV",
    content: "Stack backend basado en C#, .NET 8 / .NET Core, ASP.NET Web API, Clean Architecture, microservicios, Python con FastAPI, SQL Server, PostgreSQL, Entity Framework Core y Redis.",
    keywords: ["c#", ".net", "asp.net", "clean architecture", "microservicios", "python", "fastapi", "sql server", "postgresql", "redis"],
    aliases: ["csharp", "c#", ".net", "dotnet", "asp.net", "clean architecture", "fastapi", "sql server", "postgresql"],
    relatedProjectIds: ["project-erp-01"],
    tags: ["backend", ".net", "microservicios"]
  },
  {
    id: "skill-frontend-01",
    category: "FRONTEND",
    title: "Frontend y experiencia de usuario",
    source: "CV",
    content: "Experiencia en Angular, React, TypeScript, streaming UI, chat en tiempo real y renderizado de Markdown y JSON.",
    keywords: ["angular", "react", "typescript", "streaming ui", "chat", "markdown", "json"],
    aliases: ["angular", "react", "typescript", "frontend", "ui", "markdown", "json"],
    relatedProjectIds: ["project-erp-01"],
    tags: ["frontend", "react", "angular"]
  },
  {
    id: "skill-cloud-01",
    category: "CLOUD",
    title: "Cloud y DevOps",
    source: "CV",
    content: "Experiencia con Docker, Kubernetes, Google Cloud Platform (GCP), CI/CD y GitHub Actions.",
    keywords: ["docker", "kubernetes", "gcp", "google cloud", "ci/cd", "github actions"],
    aliases: ["docker", "kubernetes", "gcp", "cloud", "devops", "ci/cd"],
    relatedProjectIds: ["project-rag-01"],
    tags: ["cloud", "devops", "docker"]
  },
  {
    id: "project-rag-01",
    category: "PROYECTOS",
    title: "Enterprise RAG & Claims Copilot",
    source: "Portfolio",
    content: "Microservicio desarrollado en .NET 8 con Semantic Kernel y Qdrant para automatizar expedientes de aseguradoras y consultas semánticas sobre documentación no estructurada.",
    keywords: ["enterprise rag", "claims copilot", ".net 8", "semantic kernel", "qdrant", "azure openai"],
    aliases: ["rag", "claims copilot", "enterprise rag", "semantic kernel", "qdrant", "azure openai"],
    relatedProjectIds: ["exp-sspv-01"],
    tags: ["rag", "seguros", ".net"]
  },
  {
    id: "project-erp-01",
    category: "PROYECTOS",
    title: "Alumbra Gestión — ERP inteligente",
    source: "Portfolio",
    content: "Sistema integral de gestión con Angular, .NET Core y SQL Server para stock, facturación y logística, con tablero predictivo e integración de facturación electrónica en tiempo real.",
    keywords: ["alumbra", "erp", "angular", ".net core", "sql server", "facturacion", "logistica"],
    aliases: ["alumbra", "erp", "facturacion", "logistica", "stock"],
    relatedProjectIds: ["exp-freelance-01"],
    tags: ["erp", "angular", ".net"]
  },
  {
    id: "project-agent-01",
    category: "PROYECTOS",
    title: "Agentic Workflow Engine",
    source: "Portfolio",
    content: "Motor de workflows con Python, FastAPI y LangChain para automatizar procesos y orquestar agentes con consultas a sistemas internos y aplicaciones full-stack.",
    keywords: ["agentic workflow", "python", "fastapi", "langchain", "agentes"],
    aliases: ["workflow", "agentic", "python", "fastapi", "langchain"],
    relatedProjectIds: ["exp-freelance-01"],
    tags: ["agentic", "python", "workflow"]
  },
  {
    id: "education-01",
    category: "FORMACION",
    title: "Formación académica",
    source: "CV",
    content: "Experto Universitario en DB SQL por UTN BA (2024). Diplomatura en Videojuegos por UTN BA (2014-2015). Bachiller en Humanidades por Fasta Niño Jesús.",
    keywords: ["sql", "utn", "diplomatura", "videojuegos", "bachiller", "humanidades"],
    aliases: ["utn", "sql", "videojuegos", "formacion", "educacion"],
    relatedProjectIds: [],
    tags: ["sql", "utn", "educacion"]
  },
  {
    id: "skills-language-01",
    category: "IDIOMAS",
    title: "Idiomas",
    source: "CV",
    content: "Inglés intermedio/avanzado con fluidez técnica en lectura, escritura y comunicación.",
    keywords: ["ingles", "idioma", "fluidez", "lectura", "escritura", "comunicacion"],
    aliases: ["ingles", "idiomas", "english"],
    relatedProjectIds: [],
    tags: ["ingles", "idiomas"]
  }
];

window.ASSISTANT_CONFIG = {
  knowledgeBase: window.PORTFOLIO_KB,
  cacheVersion: "portfolio-v1",
  maxDocumentMatches: 4,
  fallbackModeLabel: "Modo documentado"
};
