# Cómo los ATS parsean el CV: evidencia, reglas y verificación

Investigación y pruebas reales sobre parsing de CVs por ATS. El contrato de formato
vigente (lo que se aplica al render) vive en el ADR-0039; este documento es el fondo
del por qué, las fuentes y los métodos de verificación, para que las skills que crean
el perfil y adaptan CVs no repitan errores ya descubiertos.

Complemento previo: la investigación personal sobre CV, ATS y escritura sin look de
IA (reglas anti-huella de estilo) vive en
`J:\.webdev\.projects\enchulame-el-resume\enchulame-el-resume-repo\docs\planning\cv-ats-and-ai-writing.md`
(25 ago 2026). Este documento cubre el parsing; ese cubre el estilo de escritura.

## Regla de trabajo: el formato se decide con evidencia

El formato ATS-safe del producto se ajustó varias veces contra parsers reales
(v2, v3 y v4 en el ADR-0039). El ciclo es:

1. **Cambiar el formato solo con evidencia**: captura de un parse real (screenshot del
   formulario del ATS), extracción de la capa de texto del PDF, o una fuente citada.
2. **Registrar la evidencia en el ADR-0039** antes de cambiar nada: qué parseó el ATS,
   qué campo quedó mal y con qué formato se probó. Una sesión sin esa evidencia no
   cambia el formato.
3. **Verificar después de cada cambio** (métodos abajo) y actualizar las skills
   (`build-profile` y `adapt-resume-to-offer`) si cambia el contrato de escritura.

## Reglas vigentes (resumen; el contrato está en ADR-0039)

- Empleo en tres líneas: rol, empresa, fechas del empleo. Una sola entrada por
  empleador, con las asignaciones por cliente adentro (patrón umbrella).
- Asignaciones por cliente como bloques `Client: <cliente> (<años>) | descriptor`,
  dentro de la descripción del empleo. Nunca como empleos separados (flag de
  job-hop: la permanencia larga se ve como saltos cortos).
- El único rango de fechas largo es el del empleo. Los años de proyecto van entre
  paréntesis, dentro de la línea del cliente.
- Bullets con carácter literal (`•` para bloques de cliente, `-` para logros),
  nunca markers de lista CSS.
- Línea de contacto en texto plano, sin links.
- Nombres de proyecto en la convención `Marca cliente - descriptor`.

## Hallazgos que respaldan las reglas

1. **El marker de lista CSS no está en la capa de texto del PDF**: no se copia al
   seleccionar y los parsers no siempre lo ven como delimitador de bullet. El
   carácter literal (`•`, `-`, `*`) se copia y se parsea. Ojo: carácter literal
   CON marker de lista activo da bullet doble; se usa `list-style: none`.
2. **Delimitadores de bullet**: los parsers reconocen `•`, `-`, `*` y listas
   numeradas. Símbolos decorativos (flechas, estrellas, checks) se pierden o
   fragmentan la lista (y si dos bullets se juntan, el parser puede truncar el
   texto).
3. **Bullets con `::before` posicionados reordenan la extracción**: Chromium escribe
   el texto del PDF en orden de paint; un bullet armado con posición absoluta puede
   extraerse después de todo el resto (los logros quedan sin empleador).
4. **`letter-spacing` amplio parte las palabras**: por encima de ~0.08em el extractor
   emite letra por letra ("E X P E R I E N C E") y ningún matcher de secciones
   encuentra el heading. El h2 del CV usa 0.06em, por debajo del umbral.
5. **Una línea con rango de fechas dispara empleos nuevos**: los parsers segmentan
   empleos por líneas con patrón de fechas cerca del inicio ("2023-2026" se convirtió
   en From 01/2023 To 01/2026 en el ATS de Compassion, y el texto previo quedó como
   empresa o se descartó). Evidencia concreta en ADR-0039.
6. **`Empresa | fechas` en una sola línea pierde la empresa**: el parser tomó la línea
   como línea de fechas y dejó Company vacío (evidencia de Compassion).
7. **Los links son anotaciones del PDF**: el extractor los lee como texto
   (`mailto:...`, `https://...`) y los cuelga donde no van. Contacto en texto plano.
8. **Trabajo por contrato/consultora**: patrón umbrella (una entrada por empleador con
   las asignaciones por cliente adentro) es el estándar para empleados de consultora
   con varios clientes; las entradas separadas por cliente fragmentan la tenure y
   disparan flags de job-hop. Referencias: guías de contract work (fuentes abajo).
9. **Layout**: single column, headings estándar ("Work Experience", "Education"),
   fuentes estándar, sin tablas ni text boxes, fechas en formato consistente
   (Month Year - Month Year).

## Métodos de verificación (correr después de cada cambio de formato)

1. **Test de copia**: abrir el PDF, seleccionar todo (Ctrl+A), copiar y pegar en un
   editor de texto plano. Si el texto se lee bien, con bullets y en orden, el parse
   va a salir bien. Es el test de referencia y el que motivó los bullets literales.
2. **Capa de texto del PDF**: extraer el texto del PDF generado (p. ej. con `pypdf`,
   `PdfReader(...).pages[i].extract_text()`) y verificar: bullets `•`/`-` presentes,
   líneas `Client:` completas, sin `mailto:` ni `https://` sueltos, y el rango de
   fechas del empleo intacto.
3. **Parse real**: subir el CV a un portal ATS y capturar el formulario autocompletado
   (pantalla del paso de experiencia). Es la evidencia de mayor nivel: si un campo
   queda mal, va al ADR-0039 antes de tocar el formato.

## Fuentes consultadas (21 oct 2026)

- Resume Optimizer Pro, "How to List Contract Jobs on Resume" (escenarios W-2 agency,
  umbrella and placements, el error de fragmentar en filas cortas):
  `resumeoptimizerpro.com/blog/how-to-list-contract-jobs-on-resume`
- HireFlow, "How to List Contract Work on a US Resume (ATS-Friendly)" (cliente primero,
  agencia en paréntesis, fechas Month Year por asignación):
  `hireflow.net/blog/how-to-list-contract-work-on-a-us-resume-ats-friendly`
- HireFlow, "Why Resume Parsing Breaks Bullet Points" (delimitadores `•`, `-`, `*`;
  símbolos custom se pierden o juntan bullets con trunca de contenido):
  `hireflow.net/blog/why-resume-parsing-breaks-bullet-points`
- GetFinalCV, "What an ATS reads from your PDF" (marker de lista no es carácter;
  `::before` posicionados reordenan la extracción en Chromium; `letter-spacing` amplio
  parte los headings): `getfinalcv.com/guides/what-an-ats-reads-from-your-pdf`
- Indeed, "How To List Contract Work on a Resume" (agrupar bajo el empleador real y
  nombrar los clientes): `indeed.com/career-advice/resumes-cover-letters/how-to-list-contract-work-on-resume`
- Kelly, "How To List Temporary Jobs On Your Resume" (template
  `Assignment: rol | Empresa (Duración) - logro`):
  `mykelly.com/career-advice/job-search/how-to-list-temporary-jobs-on-your-resume-complete-guide`
- Resumemate, "How to List Contract vs Freelance Work on a Resume" (agrupar contratos
  del mismo empleador bajo una entrada con sub-entradas por cliente):
  `resumemate.io/blog/how-to-list-contract-vs-freelance-work-on-a-resume`
- kindatechnical, "ATS Friendly Resume Tips for Software Engineers" (el test
  Ctrl+A / Ctrl+C a editor plano; headings estándar; bullets simples):
  `kindatechnical.com/technical-interview-preparation/ats-friendly-resume-tips-for-software-engineers.html`
- MockLive, "ATS-Friendly Resume Format" (bullets decorativos se pierden; headings que
  el parser pueda encontrar): `mocklive.ai/resume/ats-friendly-format`
- resumer.help, "Special characters that break ATS parsing" (usar `•` o `-` estándar):
  `resumer.help/blog/special-characters-that-break-ats-parsing`
- ATScore, "Taleo Resume Tips" (parser literal: single column, headings literales,
  sin bullets decorativos): `atscore.ai/blog/taleo-resume-tips`
- ATS Hiring Platform, "How ATS Really Works" (fallo por icon fonts / símbolos
  raros; single column; DOCX más seguro para sistemas estrictos):
  `atshiring.com/en/learn/how-ats-works-parsing-vs-keyword-scoring-2025`

## Cómo reportar evidencia nueva

Cuando un ATS parsee mal un CV del producto: capturar la pantalla del formulario (o
el texto extraído), registrar en ADR-0039 qué formato se probó y qué campo quedó mal,
y solo después ajustar el render. Actualizar este documento si cambia el fondo (una
fuente nueva o un hallazgo que explique el fallo).
