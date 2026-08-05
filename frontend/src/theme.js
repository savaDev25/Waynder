import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1a3a5c',
      light: '#2d5a8c',
      dark: '#0d1f33',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#00b4d8',
      light: '#48cae4',
      dark: '#0077b6',
      contrastText: '#ffffff',
    },
    accent: {
      teal: '#00b4d8',
      green: '#2ecc71',
      orange: '#e67e22',
      red: '#e74c3c',
    },
    background: {
      default: '#f0f4f8',
      paper: '#ffffff',
      dark: '#1a3a5c',
    },
    text: {
      primary: '#1a3a5c',
      secondary: '#5a7a9a',
    },
  },
  typography: {
    fontFamily: '"Montserrat", "Poppins", sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600, letterSpacing: '0.05em' },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          padding: '8px 20px',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #1a3a5c 0%, #2d5a8c 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #0d1f33 0%, #1a3a5c 100%)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #00b4d8 0%, #0077b6 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #48cae4 0%, #00b4d8 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(26,58,92,0.12)',
          '&:hover': {
            boxShadow: '0 8px 32px rgba(26,58,92,0.2)',
            transform: 'translateY(-2px)',
            transition: 'all 0.2s ease',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

export default theme;
