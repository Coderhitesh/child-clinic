// Same palette as the website: teal brand, coral accent, deep navy ink.
export const colors = {
  brand50: '#ecfbf9',
  brand100: '#d2f4ef',
  brand200: '#a9e9e1',
  brand300: '#71d8cd',
  brand500: '#12a89f',
  brand600: '#0e8c85',
  brand700: '#0d6f6b',
  brand900: '#0b4744',

  coral: '#fb7a5c',
  coralSoft: '#fff1ec',

  ink: '#0f3d56',
  inkSoft: '#3c5a6b',
  muted: '#6b8496',

  bg: '#f6fafb',
  card: '#ffffff',
  border: '#e3ecf0',

  success: '#0f9d6a',
  successSoft: '#e7f7f0',
  warning: '#b07100',
  warningSoft: '#fdf3e0',
  danger: '#d1453b',
  dangerSoft: '#fdeceb',
  info: '#1a72c4',
  infoSoft: '#e8f2fc',
  white: '#ffffff',
};

export const radius = { sm: 8, md: 12, lg: 16, xl: 22, pill: 999 };

export const spacing = (n) => n * 4;

export const font = {
  h1: { fontSize: 26, fontWeight: '800', color: colors.ink },
  h2: { fontSize: 20, fontWeight: '800', color: colors.ink },
  h3: { fontSize: 16, fontWeight: '700', color: colors.ink },
  body: { fontSize: 14, color: colors.inkSoft },
  small: { fontSize: 12, color: colors.muted },
  label: { fontSize: 13, fontWeight: '600', color: colors.ink },
};

export const shadow = {
  shadowColor: '#0f3d56',
  shadowOpacity: 0.07,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 6 },
  elevation: 2,
};
