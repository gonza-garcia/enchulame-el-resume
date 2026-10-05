import { useState } from 'react';

interface InfoTipProps {
  /** Contenido del tooltip. Puede ser largo. */
  children: string;
  label?: string;
}

/**
 * Tooltip de informacion accesible: aparece en hover y en focus (teclado).
 * Pensado para contenido largo: se posiciona bajo el boton con ancho fijo y
 * scroll interno si excede el alto maximo.
 */
export default function InfoTip({ children, label = 'Más información' }: InfoTipProps) {
  const [open, setOpen] = useState(false);
  return (
    <span className="info-tip">
      <button
        type="button"
        className="info-tip-btn"
        aria-label={label}
        aria-expanded={open}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
      >
        i
      </button>
      {open && (
        <span className="info-tip-pop" role="tooltip">
          {children}
        </span>
      )}
    </span>
  );
}
