# Insumo para /learning: perfil data-adjacente y validacion del plan B (2026-10)

Fecha de investigacion: 16 de octubre de 2026. Tipo de documento: insumo de diseno
para el contenido de `/learning`. No modifica por si solo el contrato del plan
(ADR-0028, `src/schemas/learning-plan.ts`) ni el banco de entrevistas: propone
(a) el mapeo de skills del plan que ya cubren terreno data, (b) senales de oferta
para validar o archivar el plan B con datos propios, y (c) un parche de contrato
listo para capturar via `capture-learning-plan` (modo directo) si la validacion
confirma que el plan B vale.

Canales de obtencion: busqueda web via la integracion del harness (2026-10-16).
Nota de canal: agent-reach quedo operativo para twitter, linkedin, reddit y github
(`ar-doctor.py` 5/5 OK) pero el canal de busqueda Exa no esta configurado en esta
maquina (mcporter no expone el servidor `exa`); si se quiere ampliar con discusion
de comunidad, los canales activos estan disponibles. Insumos internos:
`src/content/learning-plan.example.json` (contrato del plan, version
desidentificada), `docs/research/ai-learning-reevaluacion-2026-10.md`,
`docs/research/ai-learning-path.md`.

## Veredicto en una pagina

- El plan B que sobrevive a los datos no es el analyst clasico: es **Analytics
  Engineer con capa LLM / AI Data Analyst**. El analyst de reporting puro es la
  capa que la automatizacion de GenAI se esta comiendo primero (los analistas ya
  pasaron a auditar salidas de IA en vez de escribir los calculos de linea base;
  TechTarget, jul-2026 y sep-2026), y el piso de entrada se comprimio: de las
  empresas que contratan en 2026 el 70% apunta a seniors con skills de AI y solo
  el 12% a entry-level (Infragistics Reveal 2026, via TechTarget).
- El Analytics Engineer de 2026, en cambio, se redefinio justo hacia donde va el
  plan: "system designer, governance owner, **AI context provider**", con la capa
  semantica como interfaz para que consultas de modelos devuelvan respuestas
  consistentes y una skill nueva llamada "semantic precision" (dbt Labs, 2026).
  Eso es el mismo terreno que la fase 3 del plan ("elegir entre indice vectorial,
  grafo de conocimiento o capa semantica sobre datos estructurados").
- El plan principal **no cambia**: la via mas fuerte desde un perfil senior de
  software sigue siendo agregar la capa de AI encima del oficio. El plan B es un
  plan de respaldo que se activa o se archiva con datos de oferta propios, con el
  protocolo de la seccion 3.
- El costo de mantener el plan B disponible es bajo: dos skills nuevas
  (dbt/capa semantica y una BI) y un upgrade de SQL, todo colgando de fases que ya
  existen. El costo de perseguirlo en serio sin validarlo es alto: son 2 a 4
  semanas de estadistica inferencial y ML clasico que el plan dejo afuera a
  proposito (anti-lista).

## 1. Perfil data-adjacente: lo que el plan ya cubre

Mapeo de skills y topics del contrato actual contra el terreno que piden las
ofertas de datos. Todo lo de esta tabla ya esta en el plan; no requiere cambios.

| Skill o topic del plan | Fase | Terreno data que cubre | Evidencia que deja (defendible en entrevista) |
|---|---|---|---|
| `python` | 1 | Lenguaje base de datos y DS | Servicio FastAPI con tests |
| `sql` | 1 | Requisito n.º 1 de las ofertas de datos: SQL en 76,1% de las ofertas de Data Analyst (Jobglance, postings en vivo oct-2026), >80% (Jobright, sobre postings 2025-2026) | Endpoints con acceso a datos |
| `embeddings` | 2-3 | ML aplicado: representacion y similitud | Pipeline RAG |
| `evaluation` | 5 | Datasets de eval, graders, error analysis: la practica que separa al DS aplicado del que solo reporta | Error analysis publicado con numeros antes/despues (el artefacto estrella del plan) |
| `observability` | 5 | Monitoreo, drift, calidad de datos, tableros de uso | Trazas y tablero desplegados |
| `guardrails` | 5 | Gobierno: validacion de entradas/salidas, reglas | Guardrails documentados |
| Topic fase 2: "sesgo y varianza, analisis de errores e ingenieria de datos" | 2 | Estadistica ligera y vocabulario de DS | Justificacion de decisiones de prompt y modelo |
| Topic fase 5: "regresion estadistica calibrada al riesgo del error", "deteccion de drift" | 5 | Contraste de hipotesis y estabilidad de metricas | Regresion detectada y documentada (gate de la fase 5) |
| Topic fase 3: "capa semantica sobre datos estructurados" | 3 | Semantic layer: el nucleo del Analytics Engineer 2026 | Decision de arquitectura de retrieval documentada |

Lectura: el plan ya produce, sin agregar nada, un perfil que sabe SQL, Python,
evaluacion con metricas, monitoreo de calidad y diseno de capas semanticas. Eso
es el 70% del perfil data-adjacente moderno. Los gaps reales son herramientas
puntuales, no conceptos.

## 2. Gaps contra el mercado (y donde entran sin romper el plan)

| Gap | Que pide el mercado | Costo estimado | Donde entra |
|---|---|---|---|
| SQL intermedio (CTEs, window functions, modelado dimensional) | La fase 1 enseña "SQL basico"; las ofertas piden SQL como requisito n.º 1 y con margen | 1 semana | Ampliar el temario de la fase 1 |
| dbt y capa semantica | dbt Semantic Layer, contratos de modelos, tests y documentacion (dbt Labs 2026; plantilla KORE1; oferta team.blue: "dbt models on Databricks", "semantic/presentation layer") | 1 a 2 semanas | Fase 3, junto al topic de capa semantica que ya existe |
| BI (Looker o Power BI) | BI en mas de la mitad de las ofertas de analyst (Jobright); Power BI en 47,2% (Jobglance) | 3 a 5 dias | Fase 5, como consumidor del tablero de uso |
| Data warehouse cloud (Snowflake, Databricks o BigQuery) | Ofertas AE: Databricks (team.blue), Snowflake (SF Controller's Office, sep-2026, banda $143.572-180.596) | 3 a 5 dias | Fase 1 (cloud), como variante del "SQL y libreria de acceso a datos" |
| Estadistica inferencial y A/B testing | Lo pide el DS real, no el plan B | 2 a 4 semanas | Solo si el plan B se activa; fuera del plan hoy |
| ML clasico supervisado (sklearn, modelos en produccion) | Lo pide el DS real; la anti-lista del plan lo deja fuera del camino critico a proposito | 4+ semanas | Fuera del plan; perseguirlo contradice la anti-lista |

Regla implicita de la tabla: los tres primeros gaps son herramientas concretas que
se cuelgan de fases existentes. Los dos ultimos son el borde donde el plan B deja
de ser plan B y se convierte en otro plan (Data Scientist), que es exactamente lo
que este documento recomienda no hacer sin validacion.

## 3. Que buscar en ofertas para validar el plan B

### Busquedas guardadas

1. `"Analytics Engineer" (dbt OR "semantic layer" OR Looker OR "Power BI")`
2. `("AI Data Analyst" OR "Data Analyst") (LLM OR "generative AI" OR AI OR agentes)`
3. `"Analytics Engineer" (LLM OR AI OR "context" OR "semantic")`
4. Para el mercado en espanol: `"Analista de datos" IA`, `Analytics Engineer`,
   `Data Analyst IA` en Tecnoempleo, LinkedIn e InfoJobs (tecnoempleo tenia 72
   ofertas activas de "data scientist" al 2026-10-16 como referencia de volumen).

### Senales verdes (el plan ya las cubre)

Python, SQL, APIs y JSON, testing y CI, Docker, cloud (AWS), LLM o RAG mencionados
en la oferta, evaluacion o "AI quality", observabilidad, "AI-assisted analytics",
data quality tests, error analysis o "auditing AI outputs". Si una oferta pide
esto y dos o tres skills amarillas, es alcanzable en semanas.

### Senales amarillas (gap de dos semanas o menos)

dbt, capa semantica, Looker o Power BI, Snowflake / Databricks / BigQuery,
Airflow basico, definicion de KPIs y metricas, lineage y documentacion de modelos.
Son las skills de la seccion 2: se cubren sin salir del plan.

### Senales rojas (descarte inmediato)

- Analyst clasico puro: Excel + reporting + presentaciones, sin capa de
  ingenieria. Es la variante mas expuesta a la automatizacion y la de banda mas
  baja.
- Cualquier oferta que baje la posicion actual (titulo junior, banda por debajo
  de la banda actual del perfil): la anti-lista del plan prohíbe bajar de
  seniority.
- DS real: piden posgrado en estadistica o ML + modelos supervisados en
  produccion. Es otro rol, con otra barrera de entrada (el BLS advierte que para
  data scientist muchos empleadores exigen master o doctorado) y la anti-lista lo
  excluye para este perfil.
- Titulos absorbidos o de etiqueta: "Prompt Engineer", o "AI" solo como
  decoracion de una oferta de reporting.

### Protocolo de validacion (30 dias)

1. Registrar 15 a 20 ofertas con el flujo de captura de ofertas existente
   (`capture-job-offer`), sin filtrar por veredicto inicial.
2. Anotar por oferta cuatro flags: (a) menciona LLM o AI, (b) menciona dbt o
   capa semantica, (c) pide SQL + Python, (d) banda salarial publicada.
3. Regla de decision: el plan B **se activa** si el 30% o mas de las ofertas
   registradas combinan (a) con (b), o si hay al menos dos procesos reales (una
   respuesta de recruiter o una entrevista) con el perfil armado sobre los
   proyectos del plan. Se **archiva** si la mayoria es reporting puro o si las
   bandas caen por debajo de la posicion actual.
4. Validacion reforzada opcional: aplicar a dos ofertas con el CV posicionado en
   data-adjacente y medir tasa de respuesta contra la tasa base de las ofertas de
   AI. Datos duros propios, sin opiniones de foros.
5. Bandas de referencia para no negociar a ciegas: Analytics Engineer en EE.UU.
   $115K-155K mid y $155K-200K senior (plantilla KORE1, 2026); puesto publico en
   San Francisco $143.572-180.596 (SF Controller's Office, sep-2026); en Espana,
   base mediana de Data Analyst ~€31k contra Data Scientist ~€39k (PayScale 2026).
   El plan B no vale la pena si cae por debajo de la banda actual del perfil.

## 4. Parche de contrato propuesto (pendiente de captura)

Listo para pegar en `src/content/learning-plan.json` via `capture-learning-plan`
(modo directo). No agrega fases ni recursos nuevos: por regla de la skill no se
fabrican recursos, y las fases nuevas exigen recursos reales capturados primero.

Rol nuevo (el orden de ataque lo decide el usuario; sugerencia: despues de los
tres roles actuales, como rol de respaldo):

```json
{
  "id": "ai-data-analyst-plan-b",
  "name": {
    "es": "Analytics Engineer + LLM o AI Data Analyst (plan B)",
    "en": "Analytics Engineer + LLM or AI Data Analyst (plan B)"
  },
  "summary": {
    "es": "Rol de respaldo, no objetivo principal: la variante de datos que sobrevive a la automatizacion, sobre capa semantica, contratos de modelos y auditoria de salidas de IA, no sobre reporting clasico. Excluyente real: un proyecto del plan con SQL intermedio, dbt o capa semantica y evaluacion con metricas, validado contra ofertas reales con el protocolo de la seccion 3 de ai-learning-data-adjacente-2026-10.",
    "en": "Backup role, not the main target: the data variant that survives automation, built on semantic layers, model contracts and auditing AI outputs, not on classic reporting. Real must-have: a plan project with intermediate SQL, dbt or a semantic layer and evaluation metrics, validated against real postings with the protocol in section 3 of ai-learning-data-adjacente-2026-10."
  }
}
```

Skills nuevas (demanda omitida a proposito: la regla de ADR-0028 solo admite
demanda citando el Field Guide de Grigorev o la serie de nothiring.me, y ninguno
de los dos cubre dbt o BI con ventana declarada):

```json
[
  {
    "id": "dbt-semantic-layer",
    "name": { "es": "dbt y capa semantica", "en": "dbt and semantic layer" }
  },
  {
    "id": "bi-tooling",
    "name": { "es": "BI y visualizacion (Looker o Power BI)", "en": "BI and visualization (Looker or Power BI)" }
  }
]
```

Senales de salida nuevas (agregar a `exitSignals`):

```json
[
  {
    "es": "Plan B validado con datos propios: 15 a 20 ofertas registradas en 30 dias y el 30% o mas combinando LLM o AI con dbt o capa semantica (ver protocolo en docs/research/ai-learning-data-adjacente-2026-10.md). Sin ese numero, el plan B se archiva y no consume estudio.",
    "en": "Plan B validated with your own data: 15 to 20 postings logged in 30 days with 30% or more combining LLM or AI with dbt or a semantic layer (see the protocol in docs/research/ai-learning-data-adjacente-2026-10.md). Without that number, plan B is archived and consumes no study time."
  }
]
```

Ajustes de fase sugeridos (solo referencias a skills ya existentes o nuevas):

- Fase 3 (`fase-3-rag`): agregar `dbt-semantic-layer` a `skillIds`. El topic de
  capa semantica ya esta; el upgrade convierte el topic en practica con
  herramienta.
- Fase 5 (`fase-5-evals-produccion`): agregar `bi-tooling` a `skillIds`, como
  consumidor del tablero de uso que ya es parte del topic de monitoreo.
- Fase 1 (`fase-1-backend-cloud`): ampliar el topic de "SQL basico" a SQL
  intermedio con modelado dimensional. Es cambio de texto de un topic, sin
  tocar recursos.

### Nota operativa

Hoy no existe `src/content/learning-plan.json` (gitignored) en la instancia y
`/learning` cae al ejemplo (README, ADR-0028). Para que este insumo impacte la
pagina hay que capturar el plan real completo con `capture-learning-plan` (modo
directo) incluyendo estos cambios, y correr `pnpm run check && pnpm run build`
para validar el contrato. Mientras tanto, este documento queda como la memoria de
la decision.

## 5. Extensiones posibles (no pedidas, para despues)

- Banco de entrevistas: un area `data-adjacente` con preguntas de SQL
  intermedio, diseno de capa semantica y auditoria de salidas de IA, para cubrir
  la fase 3 y la 5 fuera del objetivo principal (`research-content`).
- Si la validacion activa el plan B, la captura de una fase opt-in real con
  recursos verificados (dbt Learn, curso de semantic layer) seria el siguiente
  paso; no se hace en este documento para no fabricar recursos.

## Fuentes

Todas consultadas el 16 de octubre de 2026 via busqueda web del harness, salvo lo
interno.

- BLS Occupational Outlook Handbook (modificado 27-ago-2026): Data Scientists,
  Market Research Analysts, Operations Research Analysts. BLS Employment
  Projections 2024-34 (Monthly Labor Review).
- Jobglance, reporte de skills de Data Analyst sobre postings en vivo
  (recalculado a diario, visto 2026-10-16). Jobright, estrategia de busqueda para
  Data Analyst sobre postings LinkedIn/Indeed/Levels.fyi 2025-2026 (ene-2026).
  365 Data Science, mercado de Data Analyst 2026.
- dbt Labs, "The analytics engineer in 2026: system designer, governance owner,
  AI context provider". KORE1, plantilla de descripcion de Analytics Engineer
  2026 (bandas salariales). Oferta team.blue "Analytics Engineer" (dbt sobre
  Databricks, capa semantica). SF Controller's Office, "Data Analytics Engineer
  (Snowflake/DBT)", publicada 25-sep-2026 (banda $143.572-180.596).
- TechTarget / TreeHive Strategy (Donald Farmer): "Will AI replace data analysts:
  a year and a half later" (jul-2026) y "Why entry-level data jobs are still
  critical in the AI age" (sep-2026); incluye el dato de Infragistics Reveal 2026
  IT Talent Survey (70% senior / 12% entry) y IBM 2025 (77% de ejecutivos sin
  poder cubrir roles de datos).
- PayScale Espana 2026 (Data Analyst y Data Scientist), ERI SalaryExpert
  (ago-2026), Tecnoempleo (conteo de ofertas, visto 2026-10-16).
- Internos: `src/content/learning-plan.example.json`,
  `docs/research/ai-learning-reevaluacion-2026-10.md`,
  `docs/research/ai-learning-path.md`, `skills/job-seeking/capture-learning-plan/SKILL.md`,
  `src/schemas/learning-plan.ts`.
