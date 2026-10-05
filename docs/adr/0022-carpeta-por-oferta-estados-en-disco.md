# ADR-0022: Carpeta por oferta con estados derivados del disco

Estado: Vigente.

## Contexto

Las ofertas vivían sueltas en `docs/job-offers/*.md` y los CVs adaptados en
`src/content/adapted-resumes/*.json`, mapeados por coincidencia de nombre. El gestor
de ofertas necesita saber por oferta: si existe, si tiene análisis y si tiene CV
adaptado, sin índices paralelos que diverjan del disco.

## Decisión

Cada oferta vive en su propia carpeta bajo `docs/job-offers/`:

```
docs/job-offers/
└── <slug>/                    slug = fecha-empresa-rol, colisión suma sufijo -2
    ├── offer.md               texto verbatim de la convocatoria + metadata (frontmatter)
    ├── match-report.md        análisis de match y score, archivo independiente
    ├── adapted-resume.json    CV adaptado bilingüe (mismo schema Zod que el CV base)
    └── cover-letter.md        (opcional) carta aprobada por el usuario, generada por adapt-resume-to-offer
```

- El estado se deriva solo del disco: existe `offer.md` = Agregada; existe
  `match-report.md` = Analizada; existe `adapted-resume.json` = Adaptada. Cada
  archivo es la puerta de un estado, sin parsear contenido para determinarlo.
- `match-report.md` es un archivo aparte (y no una sección dentro de offer.md)
  para poder abrirlo y compartirlo directamente.
- Los badges y botones de la sidebar se calculan de esas presencias en tiempo de
  render (y en el endpoint de verificación).
- Nada va a `public/`: el análisis de ofertas no debe deployarse al sitio público.
- Migración inmediata de las ofertas existentes a esta estructura; se elimina
  `src/content/adapted-resumes/`.
- Las skills de job-seeking se mueven al repo en `skills/job-seeking/` (carpeta
  dedicada, separada de skills ocasionales del repo) y se eliminan de la carpeta
  externa de skills, actualizando el catálogo README de skills. El contrato de
  carpetas vive en la skill `capture-job-offer`, referenciado por rutas relativas
  al proyecto y documentado en AGENTS.md.

## Consecuencias

- El listado de ofertas es siempre lo que hay en disco: no hay base de datos ni
  cache que diverja.
- El flujo completo es local (dev): en el sitio deployado la carpeta no viaja al
  bundle público.
