# ADR-0034: Base de shadcn/ui para las islas React

Estado: Vigente.

## Contexto

Las islas `/adapted`, `/interview` y `/learning` acumulaban CSS propio escrito a mano y
los fixes de UI de la Fase A pidieron comportamientos que ya vienen resueltos en un set de
componentes: colapsables con estado indeterminado (checkbox multinivel), tooltips de ayuda,
paleta de comandos con atajo de teclado, diálogos de confirmación y toasts. Mantenerlos a
mano duplicaba código y dejaba la accesibilidad (roles, focus, Escape, aria-expanded) al
humor de cada implementación.

shadcn/ui distribuye el código fuente de los componentes dentro del repo y se apoya en
primitivos React. Requiere Tailwind CSS, y el stack del producto era vanilla + CSS propio
con sistema de temas (ADR-0010): meter Tailwind sin acotarlo hubiera comprometido el CV
principal, que debe seguir siendo ATS-friendly e imprimible.

## Decisión

- shadcn/ui en su estilo `base-nova` (primitivos Base UI), instalado con su CLI en
  `src/components/ui/` y configurado con `components.json`. Helper `cn` en
  `src/lib/utils.ts`.
- Tailwind CSS v4 via `@tailwindcss/vite`, acotado a las islas y a los componentes de
  shadcn (`@import 'tailwindcss' source(none)` + `@source` sobre `islands`, `components/ui`
  y `hooks`). El CSS vive en `src/styles/ui.css` y solo se importa desde las páginas con
  islas. **El CV principal `/` queda vanilla, sin Tailwind** (ATS e impresión intactas).
- Tokens puenteados al tema del sitio: los tokens de shadcn (`--color-*`) salen de variables
  `--ui-*` que en `:root` mapean a las variables del tema (ADR-0010: `--bg`, `--ink`,
  `--accent`, `--muted`, `--rule`) y que cada superficie puede redefinir en su scope
  (`.interview-app` usa la paleta `--iv-*`). Los componentes siguen el tema elegido sin
  colores hardcodeados.
- Dependencias nuevas: `@base-ui/react`, `cmdk`, `lucide-react`, `class-variance-authority`,
  `clsx`, `tailwind-merge` y `tw-animate-css` (animaciones de los componentes).
- Detalles del CLI que obligan a un paso manual: no instala las dependencias solo y genera
  `import { cn } from "cn"` (specifier bare), que se normaliza a `@/lib/utils` al instalar.

## Consecuencias

- Componente nuevo = `pnpm dlx shadcn@latest add <nombre>` + revisar el puente de tokens si
  el componente trae tokens que aún no están mapeados.
- Los overlays (tooltip, diálogo) se portalean fuera de `.interview-app`, así que resuelven
  los tokens en `:root` (tema del sitio) y no la paleta de la isla.
- El preflight de Tailwind entra en las páginas con islas: cualquier estilo global de esas
  páginas hay que verificarlo visualmente después de tocarlo.
- La suite E2E corre con sus propios puertos (4531 y 4533): el 4523 histórico quedó ocupado
  por la UI del harness de agentes (ver `playwright.config.ts` y `AGENTS.md`).
