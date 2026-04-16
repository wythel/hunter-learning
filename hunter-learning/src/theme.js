import { createTheme } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'teal',
  defaultRadius: 'lg',
  fontFamily: "'Nunito', 'Noto Sans TC', system-ui, -apple-system, sans-serif",
  headings: {
    fontFamily: "'Nunito', 'Noto Sans TC', system-ui, -apple-system, sans-serif",
    fontWeight: '900',
  },
  colors: {
    dark: [
      '#adb5bd', '#868e96', '#6c757d',
      '#495057', '#343a40', '#2a3647',
      '#1a2535', '#0f1c2e', '#0a1626', '#060c14',
    ],
  },
  components: {
    Button: {
      defaultProps: { radius: 'xl' },
      styles: { root: { fontFamily: "'Nunito', system-ui, sans-serif", fontWeight: 800 } },
    },
    Card: { defaultProps: { radius: 'xl' } },
  },
});
