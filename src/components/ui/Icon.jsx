const paths = {
  home: 'M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z',
  note: 'M7 4h8l5 5v11a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm8 0v5h5M8 13h8M8 17h5',
  lock: 'M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6z',
  wallet: 'M4 8h16v12H4zm0 0 2.5-4h11L20 8M16 14h3',
  target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0-5a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0-4h.01',
  chart: 'M4 19h16M7 16V9m5 7V5m5 11v-6',
  settings: 'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM4.5 10.2l1.6-.4.8-1.5-1-1.5 1.5-1.5 1.5 1 .4-1.6L10.2 4.5h3.6l.4 1.6 1.5-1 1.5 1.5-1 1.5.8 1.5 1.6.4v3.6l-1.6.4-.8 1.5 1 1.5-1.5 1.5-1.5-1-.4 1.6-1.6.5h-3.6l-.4-1.6-1.5 1-1.5-1.5 1-1.5-.8-1.5-1.6-.4z',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zm6.5 1.5L15 17',
  sun: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 3v2m0 14v2M4.2 4.2l1.4 1.4m12.8 12.8 1.4 1.4M3 12h2m14 0h2M4.2 19.8l1.4-1.4m12.8-12.8 1.4-1.4',
  moon: 'M16 13.5A6.5 6.5 0 1 1 10.5 5 8 8 0 0 0 16 13.5z',
  monitor: 'M4 6h16v10H4zm2 14h12M12 16v4',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6L6 18',
  chevronDown: 'M6 9l6 6 6-6',
  chevronLeft: 'M14 6l-6 6 6 6',
  chevronRight: 'M10 6l6 6-6 6',
  plus: 'M12 5v14M5 12h14',
  eye: 'M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6S2.5 12 2.5 12zm9.5 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  eyeOff: 'M4 5l16 14M9.9 9.9A3 3 0 0 0 14 14m-7.2-2.3C4.8 13 3.3 15 2.5 16c1.2 1.7 4.8 6 9.5 6 1.6 0 3.1-.4 4.4-1M10 6.1C10.6 6 11.3 6 12 6c5.5 0 9.5 6 9.5 6a17 17 0 0 1-2.3 2.8',
  logout: 'M10 6H6v12h4M14 16l4-4-4-4M10 12h8',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 9a7 7 0 0 1 14 0',
  bell: 'M6 16h12l-1.2-2.2V10a4.8 4.8 0 0 0-9.6 0v3.8zm4 3a2 2 0 0 0 4 0',
  check: 'M5 12l5 5 9-10',
  alert: 'M12 9v5m0 3h.01M12 4l9 16H3z',
  info: 'M12 17v-6m0-4h.01M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
  empty: 'M5 8h14l-1.4 12H6.4zm3-4h8l1 4H7z',
  key: 'M8 15a4 4 0 1 1 3.2-6.4L20 17.4 17.6 20l-2-2-2 1.4-1.8-1.8zM8 11.2h.01',
  calendar: 'M6 5h12v14H6zm0 5h12M9 3v4m6-4v4',
  more: 'M6 12h.01M12 12h.01M18 12h.01',
  arrowUp: 'M12 18V6m0 0l-5 5m5-5l5 5',
  arrowDown: 'M12 6v12m0 0l5-5m-5 5l-5-5',
  pin: 'M9 4h6l-1 6 3 2v2H7v-2l3-2zm0 10v6',
  star: 'M12 3.6 14.5 9H20l-4.4 3.4L17.2 18 12 14.8 6.8 18l1.6-5.6L4 9h5.5z',
  archive: 'M4 6h16v3H4zm2 3v10h12V9M9 13h6',
  copy: 'M9 9h10v10H9zM5 15V5h10',
  share: 'M16 8a3 3 0 1 0-2.8-4H8.8A3 3 0 1 0 6 8c0 .4.1.8.2 1.1L12 13l5.8-3.9c.1-.3.2-.7.2-1.1zM6 16a3 3 0 1 0 2.8 4h6.4A3 3 0 1 0 18 16c0-.4-.1-.8-.2-1.1L12 11 6.2 14.9c-.1.3-.2.7-.2 1.1z',
  users: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zm8-1a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3.5 20a5.5 5.5 0 0 1 11 0M14 16.2A5 5 0 0 1 20.5 20',
};

export function Icon({ name, size = 20, strokeWidth = 1.7, className }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name] || paths.info} />
    </svg>
  );
}
