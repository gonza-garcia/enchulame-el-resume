# ADR-0033: Build genérico deployable por defecto, build personal aparte

Estado: Vigente.

## Contexto

Un `pnpm run build` de la instancia generaba un `dist/` con **todos** los datos del
usuario: perfil real, ofertas reales con sus match reports y CVs adaptados, cover
letters, banco de entrevistas y plan de estudios. Todo eso quedaba embebido en el HTML
estático, en `api/job-offers.json` y en los bundles. O sea, cualquiera que publicara ese
`dist/` publicaba la vida laboral completa, incluidos gaps declarados en las cartas.

Dos datos lo empeoraban. `docs/deploy.md` decía que "las ofertas reales no forman parte
del build estático", lo cual era falso. Y `astro.config.mjs` apuntaba `site` a
`resume.gonzalogarcia.dev`, un dominio que el ADR-0017 dejó diferido y sin comprar.

## Decisión

Separar los dos usos del build por defecto y por script, escribiendo en carpetas
distintas para que nunca se pisen:

| Comando | Carpeta | Contenido | ¿Se publica? |
|---|---|---|---|
| `pnpm run dev` | ninguna | datos reales | no aplica, es la app viva |
| `pnpm run build` | `dist/` | genérico: perfil y plan demo, solo ofertas `demo: true` | sí, es el único deployable |
| `pnpm run build:personal` | `dist-personal/` | datos reales | no, jamás |

Detalles:

- El build genérico fuerza `PROFILE_SOURCE=example`, `PLAN_SOURCE=example` y
  `OFFERS_SOURCE=demo`. Por construcción no puede contener datos personales.
- `OFFERS_SOURCE` decide qué ofertas entran al listado: `demo` solo las marcadas con
  `demo: true` en el frontmatter de `offer.md`, `local` todas. En el dev server el
  default es `local`; en un build de producción, `demo`.
- Los scripts usan un launcher (`scripts/build.mjs`) en vez de variables de entorno
  inline en `package.json`, porque en Windows los scripts de pnpm corren en cmd.exe,
  donde `FOO=bar astro build` no funciona.
- Se sacó `site` de `astro.config.mjs`: el deploy público sale del repo público y su URL
  la define ese repo.
- El header muestra un aviso no invasivo según el modo: "Datos de ejemplo, no son datos
  reales" en el genérico, "Build local con datos reales. No publicar." en el personal, y
  nada en el dev server. Se descarta por sesión.

## Consecuencias

- Es imposible publicar datos personales sin querer: el build por defecto no los tiene.
- El flujo diario no cambia: se trabaja con `pnpm run dev`, que muestra los datos reales.
- Validar los datos reales con build requiere `pnpm run build:personal`, que no es
  deployable y lo dice en pantalla.
- La suite E2E mantiene `OFFERS_SOURCE=local` implícito en el dev server que usa para el
  gestor de ofertas, así que los fixtures demo siguen siendo alcanzables.
