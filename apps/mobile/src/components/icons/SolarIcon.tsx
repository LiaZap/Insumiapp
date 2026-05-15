import Svg, { Path, Circle, Rect, type SvgProps } from 'react-native-svg';

// Ícones Solar usados no Figma. SVG paths simplificados (24×24 viewBox).
// Estilos: Linear (stroke), Bold (fill), BoldDuotone (fill + opacity).
// Lista cresce conforme novas telas usarem. Adicionar mais conforme necessário.

export type SolarIconName =
  | 'home-2-bold'
  | 'inbox-linear'
  | 'add-square-bold'
  | 'add-square-bold-duotone'
  | 'box-linear'
  | 'box-bold-duotone'
  | 'clipboard-add-linear'
  | 'bell-linear'
  | 'map-point-bold'
  | 'chat-round-money-bold'
  | 'user-bold'
  | 'file-check-bold-duotone'
  | 'transfer-vertical-linear'
  | 'alt-arrow-down-linear'
  | 'arrow-right-up-linear'
  | 'clock-circle-linear'
  | 'search-linear'
  | 'pill-bold-duotone'
  | 'jar-of-pills-linear'
  | 'syringe-linear';

type IconProps = {
  name: SolarIconName;
  size?: number;
  color?: string;
} & Omit<SvgProps, 'width' | 'height'>;

export function SolarIcon({ name, size = 24, color = '#1B498C', ...rest }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...rest}>
      {paths[name](color)}
    </Svg>
  );
}

const paths: Record<SolarIconName, (color: string) => React.ReactNode> = {
  'home-2-bold': (c) => (
    <Path
      d="M12 2.5L2.5 9.5v11A1.5 1.5 0 004 22h5v-7h6v7h5a1.5 1.5 0 001.5-1.5v-11L12 2.5z"
      fill={c}
    />
  ),
  'inbox-linear': (c) => (
    <>
      <Path d="M22 13h-5l-2 3h-6l-2-3H2" stroke={c} strokeWidth={1.6} fill="none" />
      <Path
        d="M5.45 5.11L2 12v6a3 3 0 003 3h14a3 3 0 003-3v-6L18.55 5.11A3 3 0 0015.87 3H8.13a3 3 0 00-2.68 2.11z"
        stroke={c}
        strokeWidth={1.6}
        fill="none"
      />
    </>
  ),
  'add-square-bold': (c) => (
    <>
      <Rect x={2} y={2} width={20} height={20} rx={6} fill={c} />
      <Path d="M12 8v8M8 12h8" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
    </>
  ),
  'add-square-bold-duotone': (c) => (
    <>
      <Rect x={2} y={2} width={20} height={20} rx={6} fill={c} fillOpacity={0.35} />
      <Path d="M12 8v8M8 12h8" stroke={c} strokeWidth={2} strokeLinecap="round" />
    </>
  ),
  'box-linear': (c) => (
    <>
      <Path
        d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"
        stroke={c}
        strokeWidth={1.6}
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M20 18V6a2 2 0 00-1-1.73l-6-3.46a2 2 0 00-2 0l-6 3.46A2 2 0 004 6v12a2 2 0 001 1.73l6 3.46a2 2 0 002 0l6-3.46A2 2 0 0020 18z"
        stroke={c}
        strokeWidth={1.6}
        fill="none"
      />
    </>
  ),
  'box-bold-duotone': (c) => (
    <>
      <Path
        d="M20 18V6a2 2 0 00-1-1.73l-6-3.46a2 2 0 00-2 0l-6 3.46A2 2 0 004 6v12a2 2 0 001 1.73l6 3.46a2 2 0 002 0l6-3.46A2 2 0 0020 18z"
        fill={c}
        fillOpacity={0.35}
      />
      <Path
        d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"
        stroke={c}
        strokeWidth={1.6}
        fill="none"
      />
    </>
  ),
  'clipboard-add-linear': (c) => (
    <>
      <Rect x={4} y={4} width={16} height={18} rx={3} stroke={c} strokeWidth={1.6} fill="none" />
      <Rect x={8} y={2} width={8} height={4} rx={1.5} stroke={c} strokeWidth={1.6} fill="none" />
      <Path d="M12 11v6M9 14h6" stroke={c} strokeWidth={1.6} strokeLinecap="round" />
    </>
  ),
  'bell-linear': (c) => (
    <>
      <Path
        d="M18.5 17h-13l1.5-2V11a5.5 5.5 0 0111 0v4l.5 2z"
        stroke={c}
        strokeWidth={1.6}
        strokeLinejoin="round"
        fill="none"
      />
      <Path d="M10 20a2 2 0 004 0" stroke={c} strokeWidth={1.6} fill="none" />
    </>
  ),
  'map-point-bold': (c) => (
    <Path
      d="M12 2C7.6 2 4 5.6 4 10c0 6 8 12 8 12s8-6 8-12c0-4.4-3.6-8-8-8zm0 11a3 3 0 110-6 3 3 0 010 6z"
      fill={c}
    />
  ),
  'chat-round-money-bold': (c) => (
    <>
      <Path
        d="M12 22a10 10 0 10-9.6-7.2l-1 3.3a1 1 0 001.3 1.3l3.3-1A10 10 0 0012 22z"
        fill={c}
      />
      <Path
        d="M12 8v8M14.5 10.5c0-1-1.1-1.5-2.5-1.5s-2.5.5-2.5 1.5S10.6 12 12 12s2.5.5 2.5 1.5S13.4 15 12 15s-2.5-.5-2.5-1.5"
        stroke="#fff"
        strokeWidth={1.4}
        strokeLinecap="round"
        fill="none"
      />
    </>
  ),
  'user-bold': (c) => (
    <>
      <Circle cx={12} cy={7} r={4} fill={c} />
      <Path d="M4 20a8 8 0 0116 0v1H4z" fill={c} />
    </>
  ),
  'file-check-bold-duotone': (c) => (
    <>
      <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" fill={c} fillOpacity={0.35} />
      <Path d="M14 2v6h6" stroke={c} strokeWidth={1.6} fill="none" />
      <Path d="M9 14l2 2 4-4" stroke={c} strokeWidth={1.8} strokeLinecap="round" fill="none" />
    </>
  ),
  'transfer-vertical-linear': (c) => (
    <Path
      d="M7 4v16m0 0l-3-3m3 3l3-3M17 20V4m0 0l-3 3m3-3l3 3"
      stroke={c}
      strokeWidth={1.6}
      strokeLinecap="round"
      fill="none"
    />
  ),
  'alt-arrow-down-linear': (c) => (
    <Path d="M6 9l6 6 6-6" stroke={c} strokeWidth={1.8} strokeLinecap="round" fill="none" />
  ),
  'arrow-right-up-linear': (c) => (
    <Path
      d="M7 17L17 7M9 7h8v8"
      stroke={c}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  ),
  'clock-circle-linear': (c) => (
    <>
      <Circle cx={12} cy={12} r={9} stroke={c} strokeWidth={1.6} fill="none" />
      <Path d="M12 7v5l3 2" stroke={c} strokeWidth={1.6} strokeLinecap="round" fill="none" />
    </>
  ),
  'search-linear': (c) => (
    <>
      <Circle cx={11} cy={11} r={7} stroke={c} strokeWidth={1.6} fill="none" />
      <Path d="M20 20l-3.5-3.5" stroke={c} strokeWidth={1.6} strokeLinecap="round" />
    </>
  ),
  'pill-bold-duotone': (c) => (
    <>
      <Rect x={3} y={9} width={18} height={6} rx={3} fill={c} fillOpacity={0.35} />
      <Path d="M12 9v6" stroke={c} strokeWidth={1.6} />
    </>
  ),
  'jar-of-pills-linear': (c) => (
    <>
      <Rect x={6} y={2} width={12} height={3} rx={1.5} stroke={c} strokeWidth={1.6} fill="none" />
      <Rect x={5} y={5} width={14} height={17} rx={3} stroke={c} strokeWidth={1.6} fill="none" />
      <Circle cx={10} cy={12} r={1.2} fill={c} />
      <Circle cx={14} cy={15} r={1.2} fill={c} />
    </>
  ),
  'syringe-linear': (c) => (
    <Path
      d="M18 6l-2-2m2 2l3-3m-3 3l-9 9-3 0 0-3 9-9 3 3z"
      stroke={c}
      strokeWidth={1.6}
      strokeLinejoin="round"
      fill="none"
    />
  ),
};
