# ADR-0011: pnpm y convención AGENTS.md

Estado: Vigente.

## Decisión

- El repositorio usa pnpm exclusivamente y conserva `pnpm-lock.yaml`.
- `package.json` fija `pnpm@11.15.0`.
- `pnpm-workspace.yaml` permite los build scripts necesarios de `esbuild` y `sharp`.
- `AGENTS.md` contiene onboarding operativo, reglas de privacidad, validación y autoría.
- La documentación privada y el tooling local permanecen fuera del repo o ignorados por Git.

## Consecuencia

Los agentes deben usar los comandos de `AGENTS.md` y no regenerar `package-lock.json`. Los
detalles operativos no se duplican en este ADR.
