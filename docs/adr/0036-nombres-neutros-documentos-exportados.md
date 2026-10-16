# ADR-0036: Nombres neutros para los documentos exportados

Estado: Vigente.

## Contexto

Los documentos que el usuario sube o adjunta en postulaciones salían nombrados con
datos de la oferta: el print de la app usaba el título de la página con el nombre de
la empresa (`Nombre - Empresa - EN`), el DOCX del CV incluía la empresa, y la cover
letter se exportaba como `<slug>-cover-letter.docx` (slug con fecha, empresa y rol).
Un archivo así delata que el documento fue adaptado para esa postulación, que es
justo lo que se intenta evitar al adaptar.

## Decisión

1. **Nombre de archivo neutro**: `<apellidos> <nombres> - <documento> - <LOCALE>.<ext>`.
   El nombre completo del perfil se reordena como apellidos primero y se normaliza sin
   acentos ni caracteres especiales. Implementado en `src/lib/file-name.ts`
   (`fileAsName`, `exportFileName`) y usado por los exports de la app y por la skill
   `adapt-resume-to-offer`.
   - CV: `Apellido1 Apellido2 Nombre - CV - EN.pdf`.
   - Cover letter: `Apellido1 Apellido2 Nombre - Cover Letter - EN.docx`.
2. **La empresa solo organiza en local**: la carpeta `CV - <empresa>` es el destino
   donde el usuario guarda sus PDFs (paso 11 de `adapt-resume-to-offer`), fuera del
   repo. La carpeta la ve el usuario; el archivo es lo que viaja a un portal o a un
   email.
3. **Ni la empresa ni el rol de la oferta** forman parte de ningún nombre de archivo
   exportado: ni el PDF por impresión, ni el DOCX del CV, ni el DOCX de la cover
   letter.

## Consecuencias

- El nombre se deriva del perfil en cada export: no hay datos personales hardcodeados
  en el producto, así que la superficie genérica sigue publicable.
- Si el usuario exporta desde el diálogo de impresión del navegador, el nombre
  sugerido sale del `document.title`, que ahora ya viene neutro.
- Ningún export mezcla la empresa o el rol de la oferta con el nombre de archivo, y
  el puente `window.__printCompany` deja de usarse para nombrar archivos.
