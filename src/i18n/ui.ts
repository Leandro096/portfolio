export const ui = {
  en: {
    skip: "Skip to content",
    primaryNav: "Primary",
    backToTopAria: "Back to top",
    nav: {
      work: "Work",
      skills: "Skills",
      experience: "Experience",
      contact: "Contact",
    },
    switchTheme: "Switch color theme",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    language: "Language",

    whatsappCta: "Message me on WhatsApp",
    downloadCv: "Download CV",

    labelLocation: "Based in",
    labelAvailable: "Available for",
    remoteWork: "Remote, full-time contractor",
    labelSpoken: "Languages",

    pipelineAria: "Animated illustration of a release pipeline",
    running: "Running",
    deployed: "Deployed",
    replay: "Run again",

    workTitle: "Selected work",
    workIntro: "Two projects where the outcome was measured, not just shipped.",
    technologies: "Technologies used",
    flowAria: "Process diagram",

    skillsTitle: "What I work with",
    skillsIntro:
      "A full-stack toolset, plus the habits that keep teams moving.",

    experienceTitle: "Experience and education",
    educationTitle: "Education",
    present: "Present",
    volunteer: "Volunteer",
    progressAria: "{n}% complete",

    contactTitle: "Need a full-stack software engineer on your team?",
    contactText:
      "Tell me what you're building. WhatsApp is the fastest way to reach me, and email works too.",
    copyEmail: "Copy email address",
    copied: "Email copied",
    labelWhatsapp: "WhatsApp",
    labelEmail: "Email",
    labelTimezones: "Time zones",
    labelLocalTime: "Local time",

    rights: "All rights reserved.",
    backToTop: "Back to top",
  },
  es: {
    skip: "Saltar al contenido",
    primaryNav: "Principal",
    backToTopAria: "Volver arriba",
    nav: {
      work: "Proyectos",
      skills: "Habilidades",
      experience: "Experiencia",
      contact: "Contacto",
    },
    switchTheme: "Cambiar tema de color",
    openMenu: "Abrir menú",
    closeMenu: "Cerrar menú",
    language: "Idioma",

    whatsappCta: "Escríbeme por WhatsApp",
    downloadCv: "Descargar CV",

    labelLocation: "Ubicación",
    labelAvailable: "Disponible para",
    remoteWork: "Remoto, tiempo completo, contratista",
    labelSpoken: "Idiomas",

    pipelineAria: "Ilustración animada de un pipeline de despliegue",
    running: "En curso",
    deployed: "Desplegado",
    replay: "Repetir",

    workTitle: "Proyectos destacados",
    workIntro: "Dos proyectos donde el resultado se midió, no solo se entregó.",
    technologies: "Tecnologías utilizadas",
    flowAria: "Diagrama de proceso",

    skillsTitle: "Con qué trabajo",
    skillsIntro:
      "Un conjunto de herramientas full-stack y los hábitos que mantienen a los equipos avanzando.",

    experienceTitle: "Experiencia y educación",
    educationTitle: "Educación",
    present: "Actualidad",
    volunteer: "Voluntariado",
    progressAria: "{n}% completado",

    contactTitle: "¿Necesitas un ingeniero de software full-stack en tu equipo?",
    contactText:
      "Cuéntame qué estás construyendo. WhatsApp es la forma más rápida de contactarme, y el correo también funciona.",
    copyEmail: "Copiar correo",
    copied: "Correo copiado",
    labelWhatsapp: "WhatsApp",
    labelEmail: "Correo",
    labelTimezones: "Zonas horarias",
    labelLocalTime: "Hora local",

    rights: "Todos los derechos reservados.",
    backToTop: "Volver arriba",
  },
} as const;

export type UIKey = keyof (typeof ui)["en"];
