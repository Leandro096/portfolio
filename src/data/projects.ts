import type { Project } from "./types";

// Case studies. Add an entry to the array; `order` (lower = first) controls the sequence.
export const projects: Project[] = [
  {
    id: "get-platform",
    order: 1,
    title: { en: "GET: one platform for the Ministry's services and equipment", es: "GET: una plataforma para los servicios y equipos del Ministerio" },
    organization: { en: "Ministry of Education of the Dominican Republic", es: "Ministerio de Educación de la República Dominicana" },
    role: { en: "Fullstack Engineer", es: "Ingeniero Fullstack" },
    summary: { en: "A platform of components and tools that brings the institution's services and equipment onto a shared technical base, so new services reach staff faster.", es: "Una plataforma de componentes y herramientas que lleva los servicios y equipos de la institución a una base técnica común, para que los nuevos servicios lleguen más rápido al personal." },
    outcomes: [
      {
        lead: { en: "Faster, safer releases.", es: "Despliegues más rápidos y seguros." },
        text: { en: "CI/CD on Azure DevOps with parallelized jobs and Rust-accelerated builds reduced errors and deploy time by over 73%.", es: "CI/CD en Azure DevOps con jobs en paralelo y compilaciones aceleradas con Rust redujeron los errores y el tiempo de despliegue en más de un 73%." },
      },
      {
        lead: { en: "A faster SIGERD database.", es: "Una base de datos SIGERD más rápida." },
        text: { en: "Improved performance with 3NF normalization, stored procedures and indexes.", es: "Mejoré el rendimiento con normalización 3NF, procedimientos almacenados e índices." },
      },
      {
        lead: { en: "Consent compliance in every product.", es: "Cumplimiento de consentimiento en cada producto." },
        text: { en: "Built one cookie management tool shared across all products to meet user consent laws.", es: "Construí una herramienta única de gestión de cookies compartida por todos los productos para cumplir las leyes de consentimiento del usuario." },
      },
      {
        lead: { en: "Scalable interfaces on a clean API.", es: "Interfaces escalables sobre una API limpia." },
        text: { en: "React and TypeScript front ends on a RESTful ASP.NET Core API, with project documentation stored in MinIO.", es: "Interfaces en React y TypeScript sobre una API RESTful en ASP.NET Core, con la documentación del proyecto almacenada en MinIO." },
      },
    ],
    metrics: [
      {
        value: 73,
        suffix: "%",
        label: { en: "less deployment time and fewer errors", es: "menos tiempo de despliegue y menos errores" },
      },
    ],
    stack: ["react", "typescript", "aspnet-core", "mssql", "azure-devops", "minio", "bootstrap"],
  },
  {
    id: "health-pastoral",
    order: 2,
    title: { en: "Appointment scheduling for the archdiocese's health ministry", es: "Sistema de citas para la pastoral de salud de la arquidiócesis" },
    organization: { en: "The Health Pastoral", es: "Pastoral de la Salud" },
    role: { en: "Volunteer Full-Stack Software Engineer", es: "Ingeniero de Software Full-Stack voluntario" },
    summary: { en: "Replaced a manual process with a system for the doctors' schedules, built around how patients actually arrive: walk-ins and booked appointments.", es: "Reemplacé un proceso manual con un sistema para las agendas de los médicos, pensado en cómo llegan realmente los pacientes: sin cita y con cita." },
    flow: [
      [
        {
          title: { en: "Walk-in patients", es: "Pacientes sin cita" },
          note: { en: "First in, first out", es: "Primero en llegar, primero en ser atendido" },
        },
        {
          title: { en: "Booked patients", es: "Pacientes con cita" },
          note: { en: "Time slot plus buffer", es: "Franja horaria más margen" },
        },
      ],
      [
        {
          title: { en: "Check-in", es: "Registro de llegada" },
          note: { en: "Appointment time comes first", es: "Prima la hora de la cita" },
        },
      ],
      [
        { title: { en: "Consultation queue", es: "Cola de consulta" }, note: { en: "Secondary queue", es: "Cola secundaria" } },
      ],
    ],
    metrics: [
      { value: 68, prefix: "~", suffix: "%", label: { en: "organizational improvement", es: "mejora organizacional" } },
      { value: 73, prefix: "~", suffix: "%", label: { en: "faster response time", es: "menor tiempo de respuesta" } },
      { value: 5000, suffix: "+", label: { en: "patients impacted daily", es: "pacientes impactados al día" } },
    ],
    stack: ["react", "expressjs", "mongodb", "sass", "github"],
  },
];
