#!/usr/bin/env node
/**
 * Build del sitio con el modo de datos elegido.
 *
 * - `pnpm run build` arma el build GENERICO: perfil y plan de ejemplo y solo las
 *   ofertas marcadas como demo. Es el unico build deployable: no puede contener
 *   datos personales.
 * - `pnpm run build:personal` arma el build con los datos reales del usuario, en
 *   dist-personal/. Es solo para uso local y no se publica.
 *
 * Se usa un launcher en vez de variables de entorno inline en package.json porque
 * los scripts de pnpm corren en cmd.exe en Windows, donde `FOO=bar astro build`
 * no funciona.
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const personal = process.argv.includes('--personal');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const astroBin = path.join(root, 'node_modules', 'astro', 'bin', 'astro.mjs');

const env = { ...process.env };
if (personal) {
  env.BUILD_MODE = 'personal';
  env.OFFERS_SOURCE = 'local';
} else {
  env.PROFILE_SOURCE = env.PROFILE_SOURCE ?? 'example';
  env.PLAN_SOURCE = env.PLAN_SOURCE ?? 'example';
  env.OFFERS_SOURCE = env.OFFERS_SOURCE ?? 'demo';
  delete env.BUILD_MODE;
}

console.log(
  `[build] modo ${personal ? 'PERSONAL (datos reales, no publicable)' : 'generico (datos de ejemplo, deployable)'}`
);

const result = spawnSync(process.execPath, [astroBin, 'build'], {
  cwd: root,
  stdio: 'inherit',
  env
});

process.exit(result.status ?? 1);
