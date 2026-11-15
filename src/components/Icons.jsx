const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

const make = (paths) =>
  function Icon({ size = 20 }) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
        {paths}
      </svg>
    );
  };

export const IconHome = make(<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />);
export const IconList = make(<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />);
export const IconUser = make(
  <>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
  </>,
);
export const IconPlus = make(<path d="M12 5v14M5 12h14" />);
export const IconClose = make(<path d="M6 6l12 12M18 6L6 18" />);
export const IconCart = make(
  <>
    <path d="M6 6h15l-2 9H8L6 3H3" />
    <circle cx="9" cy="20" r="1" />
    <circle cx="18" cy="20" r="1" />
  </>,
);
export const IconBolt = make(<path d="M13 2L4 14h7l-1 8 9-12h-7z" />);
export const IconCar = make(
  <>
    <path d="M5 17h14v-5l-2-5H7l-2 5z" />
    <circle cx="8" cy="17" r="2" />
    <circle cx="16" cy="17" r="2" />
  </>,
);
export const IconHeart = make(<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z" />);
export const IconTag = make(
  <>
    <path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z" />
    <path d="M7.5 7.5h.01" />
  </>,
);
export const IconArrow = make(<path d="M5 12h14M13 6l6 6-6 6" />);
export const IconCheck = make(<path d="M20 6L9 17l-5-5" />);
export const IconTrash = make(<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />);
export const IconCopy = make(
  <>
    <rect x="9" y="9" width="12" height="12" rx="2" />
    <path d="M5 15V5a2 2 0 0 1 2-2h10" />
  </>,
);
export const IconShare = make(
  <>
    <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" />
    <path d="M16 6l-4-4-4 4M12 2v14" />
  </>,
);
export const IconHelp = make(
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01" />
  </>,
);
export const IconLogout = make(<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />);
export const IconWifiOff = make(<path d="M2 2l20 20M8.5 16.4a5 5 0 0 1 7 0M5 12.9a10 10 0 0 1 5.2-2.8M19 12.9a10 10 0 0 0-2.3-1.7M12 20h.01" />);

export function CategoryIcon({ movement, size }) {
  if (movement.type === 'loan') return <IconArrow size={size} />;
  if (movement.type === 'payment') return <IconCheck size={size} />;
  switch (movement.category) {
    case 'comida':
      return <IconCart size={size} />;
    case 'casa':
      return <IconBolt size={size} />;
    case 'transporte':
      return <IconCar size={size} />;
    case 'salud':
      return <IconHeart size={size} />;
    default:
      return <IconTag size={size} />;
  }
}
