import logoColor from '../assets/logo-insumia.png';
import logoWhite from '../assets/logo-insumia-white.png';

/**
 * Lockup de marca Insumia (ícone + wordmark + tagline).
 * `variant="white"` para fundos navy (sidebar, login, páginas públicas escuras);
 * `variant="color"` (azul) para fundos claros. Altura define o tamanho — a
 * largura segue a proporção do lockup (~4:1).
 */
const RATIO = 798 / 199;

export function Logo({
  height = 26,
  variant = 'color',
  className,
}: {
  height?: number;
  variant?: 'color' | 'white';
  className?: string;
}) {
  return (
    <img
      src={variant === 'white' ? logoWhite : logoColor}
      alt="Insumia"
      width={Math.round(height * RATIO)}
      height={height}
      style={{ height, width: 'auto' }}
      className={className}
      draggable={false}
    />
  );
}
