# Orbit Deck

Orbit Deck es una consola operativa profesional-personal para coordinar proyectos, recursos, agentes, documentación, versiones y automatizaciones desde una sola superficie, sin reemplazar las herramientas externas especializadas.

## Arquitectura

Orbit Deck es una aplicación Full-Stack construida con:
- **Frontend**: React, Zustand, Tailwind CSS, Lucide React, React Router DOM.
- **Backend**: Node.js, Express, Vite (Middleware).
- **Persistencia**: SQLite (via `better-sqlite3`).

## Fases de Desarrollo

- **Fase 1**: Shell global, navegación, Mission Control, Registro maestro, taxonomía de estados.
- **Fase 2**: Lógica de estado real, Dashboard de Proyecto, acciones de Zustand.
- **Fase 3A**: Hardening técnico, persistencia fundacional end-to-end con SQLite y Express.

## Ejecución

Para ejecutar la aplicación en modo desarrollo:

```bash
npm run dev
```

El servidor se iniciará en `http://localhost:3000`.
