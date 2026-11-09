import type { Experience } from "./types";

// Work and volunteer experience. Add an entry to the array; `order` (lower = first) controls the sequence.
// Also feeds the CVs (scripts/make-cv.mjs).
export const experience: Experience[] = [
  {
    id: "ministry-of-education",
    order: 1,
    type: "job",
    role: { en: "Fullstack Engineer", es: "Ingeniero Fullstack" },
    organization: { en: "Ministry of Education of the Dominican Republic (MINERD)", es: "Ministerio de Educación de la República Dominicana (MINERD)" },
    location: "Santo Domingo",
    start: "2025-08",
    end: "2026-10",
    highlights: [
      { en: "Built and maintained the GET platform (equipment, component and shared-tool management) with ReactJS, ASP.NET and MSSQL; shared components helped converge products.", es: "Construí y mantuve la plataforma GET (gestión de equipos, componentes y herramientas compartidas) con ReactJS, ASP.NET y MSSQL; los componentes compartidos ayudaron a converger los productos." },
      { en: "Built RESTful APIs with ASP.NET Core consumed by React front ends.", es: "Construí APIs RESTful con ASP.NET Core consumidas por interfaces en React." },
      { en: "Designed the CI/CD strategy in Azure DevOps with parallel CI jobs, cutting errors and deployment times by more than 73%; used Rust to speed up builds and MinIO to host documentation.", es: "Diseñé la estrategia de CI/CD en Azure DevOps con jobs de CI en paralelo, reduciendo los errores y los tiempos de despliegue en más de un 73%; usé Rust para acelerar las compilaciones y MinIO para alojar la documentación." },
      { en: "Improved SIGERD database performance with 3NF normalization, stored procedures and indexes.", es: "Mejoré el rendimiento de la base de datos SIGERD con normalización 3NF, procedimientos almacenados e índices." },
      { en: "Built a cross-cutting cookie and consent management tool reused across products.", es: "Construí una herramienta transversal de gestión de cookies y consentimiento reutilizada en todos los productos." },
    ],
    stack: ["react", "typescript", "aspnet-core", "mssql", "azure-devops", "minio", "rust"],
  },
  {
    id: "freelance",
    order: 2,
    type: "job",
    role: { en: "Freelance Full-Stack Software Engineer", es: "Ingeniero de Software Full-Stack Freelance" },
    organization: { en: "Independent", es: "Independiente" },
    location: { en: "Remote / Santo Domingo", es: "Remoto / Santo Domingo" },
    start: "2022-08",
    end: "2025-08",
    highlights: [
      { en: "Delivered full-stack systems for healthcare (reservations, supervised psychological testing), automotive workshops and religious organizations: multi-language support, priority and FIFO queues, tracking, billing and dashboards.", es: "Entregué sistemas full-stack para salud (reservas, pruebas psicológicas supervisadas), talleres automotrices y organizaciones religiosas: soporte multilenguaje, colas por prioridad y FIFO, seguimiento, facturación y paneles de control." },
      { en: "Achieved ~58% average improvement in organization, traceability and response time, serving 10,000+ clients per day.", es: "Logré una mejora promedio de ~58% en organización, trazabilidad y tiempo de respuesta, atendiendo a más de 10,000 clientes por día." },
    ],
    stack: ["react", "expressjs", "nodejs", "mongodb", "aspnet-core", "minio", "azure-devops"],
  },
  {
    id: "health-pastoral",
    order: 3,
    type: "volunteer",
    role: { en: "Full-Stack Software Engineer (Volunteer)", es: "Ingeniero de Software Full-Stack (Voluntario)" },
    organization: { en: "The Health Pastoral", es: "Pastoral de la Salud" },
    location: "Santo Domingo",
    start: "2023-04",
    end: "2023-08",
    highlights: [
      { en: "Built an appointment system for the archdiocese's doctors using FIFO ordering for arrivals plus time slots with scheduling and buffer logic.", es: "Construí un sistema de citas para los médicos de la arquidiócesis con orden FIFO para las llegadas, más franjas horarias con lógica de agenda y margen." },
      { en: "Reduced response time by ~73% and improved organization by ~68%, supporting 5,000+ patients per day.", es: "Reduje el tiempo de respuesta en ~73% y mejoré la organización en ~68%, atendiendo a más de 5,000 pacientes por día." },
    ],
    stack: ["react", "expressjs", "mongodb", "sass", "github"],
  },
];
