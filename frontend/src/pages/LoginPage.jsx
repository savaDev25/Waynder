import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Button, Checkbox,
  FormControlLabel, Divider, Link, Alert, CircularProgress,
  IconButton, InputAdornment, Grid,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import GoogleIcon from '@mui/icons-material/Google';
import AppleIcon from '@mui/icons-material/Apple';
import FacebookIcon from '@mui/icons-material/Facebook';
import { authService } from '../services/authService';

// Mock data — replace with real service calls
const MOCK_USER = {
  id: 'usr_001',
  firstName: 'Elena',
  lastName: 'Ramirez',
  email: 'elena.ramirez@email.com',
  memberSince: 'January 2023',
  level: 'Explorer',
  levelNumber: 5,
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [keepLogged, setKeepLogged] = useState(false);

  // Login form state
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });

  // Register form state
  const [registerForm, setRegisterForm] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
  });
  const [agreedTerms, setAgreedTerms] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Real call: await authService.login(loginForm.email, loginForm.password);
      // Mock for prototype:
      await new Promise((r) => setTimeout(r, 800));
      localStorage.setItem('wondergdl_user', JSON.stringify(MOCK_USER));
      localStorage.setItem('wondergdl_token', 'mock_token_12345');
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!agreedTerms) {
      setError('Please agree to the Terms of Service.');
      return;
    }
    setLoading(true);
    try {
      // Real call: await authService.register(registerForm);
      await new Promise((r) => setTimeout(r, 800));
      localStorage.setItem('wondergdl_user', JSON.stringify({ ...MOCK_USER, ...registerForm }));
      localStorage.setItem('wondergdl_token', 'mock_token_12345');
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0d1f33 0%, #1a3a5c 50%, #0d1f33 100%)',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background map overlay */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url("/Catedral_Guadalajara.jpg")`,
          backgroundSize: 'cover', 
          backgroundRepeat: 'no-repeat', 
          backgroundPosition: 'center', 
          opacity: 0.4,
        }}
      />

      {/* Left: Hero + Login */}
      <Box
        sx={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          p: 4, position: 'relative', zIndex: 1,
        }}
      >
        {/* Logo */}
        <Box
          component="img"
          src="Wonder GDL Logo.png"
          alt="WonderGDL"
          sx={{ width: 128, height: 128 }}
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />

        {/* Hero image area */}
        <Box
          sx={{
            width: '100%', maxWidth: 480, height: 200,
            borderRadius: 3, overflow: 'hidden', mb: 3,
            background: 'linear-gradient(135deg, #1a3a5c 0%, #2d5a8c 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          <Box sx={{ textAlign: 'center', color: '#fff' }}>
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 0.5 }}>
              Guadalajara:
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#00b4d8' }}>
              Connected & Cultural
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 1 }}>
              Discover the city through vibrant routes
            </Typography>
          </Box>
          {/* Decorative dots */}
          {[...Array(6)].map((_, i) => (
            <Box
              key={i}
              sx={{
                position: 'absolute',
                width: 8, height: 8, borderRadius: '50%',
                background: '#00b4d8', opacity: 0.3,
                top: `${20 + i * 28}%`, left: `${10 + i * 15}%`,
              }}
            />
          ))}
        </Box>

        {/* Login Form */}
        <Paper
          elevation={8}
          sx={{ width: '100%', maxWidth: 440, p: 3, borderRadius: 3 }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, color: '#1a3a5c', letterSpacing: '0.05em' }}>
            LOG IN TO YOUR JOURNEY
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleLogin}>
            <TextField
              fullWidth label="Email Address" type="email"
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              sx={{ mb: 2 }} size="small"
            />
            <TextField
              fullWidth label="Password" type={showPass ? 'text' : 'password'}
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              sx={{ mb: 1 }} size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPass(!showPass)}>
                      {showPass ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <FormControlLabel
                control={<Checkbox size="small" checked={keepLogged} onChange={(e) => setKeepLogged(e.target.checked)} />}
                label={<Typography variant="caption">Keep me logged in</Typography>}
              />
              <Link href="#" variant="caption" sx={{ color: '#00b4d8' }}>Forgot Password?</Link>
            </Box>
            <Button
              type="submit" variant="contained" fullWidth
              disabled={loading}
              sx={{
                py: 1.2, background: 'linear-gradient(135deg, #1a3a5c, #2d5a8c)',
                fontWeight: 700, fontSize: '0.95rem', mb: 2,
              }}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Log In'}
            </Button>
          </Box>

          <Divider sx={{ my: 1.5 }}>
            <Typography variant="caption" sx={{ color: '#999' }}>OR CONNECT WITH</Typography>
          </Divider>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" fullWidth startIcon={<GoogleIcon />} sx={{ textTransform: 'none', fontSize: '0.8rem', borderColor: '#ddd' }}>
              Google
            </Button>
            <Button variant="contained" fullWidth startIcon={<FacebookIcon />} sx={{ textTransform: 'none', fontSize: '0.8rem', background: '#1877F2' }}>
              Facebook
            </Button>
            <Button variant="contained" fullWidth startIcon={<AppleIcon />} sx={{ textTransform: 'none', fontSize: '0.8rem', background: '#000' }}>
              Apple
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* Right: Welcome back + Sign up */}
      <Box
        sx={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          p: 4, position: 'relative', zIndex: 1, gap: 3,
        }}
      >
        {/* Welcome back section */}
        <Paper elevation={6} sx={{ width: '100%', maxWidth: 440, p: 3, borderRadius: 3, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Welcome Back!</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mb: 2 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ fontSize: '2.5rem' }}>🎺</Box>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>Mariachi</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ fontSize: '2.5rem' }}>🌵</Box>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>Agave</Typography>
            </Box>
          </Box>
          <Divider sx={{ my: 1.5 }}>
            <Typography variant="caption" sx={{ color: '#999' }}>OR CONNECT WITH</Typography>
          </Divider>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            <Button variant="outlined" size="small" startIcon={<GoogleIcon />} sx={{ textTransform: 'none', borderColor: '#ddd' }}>Google</Button>
            <Button variant="contained" size="small" startIcon={<AppleIcon />} sx={{ textTransform: 'none', background: '#000' }}>Apple</Button>
          </Box>
        </Paper>

        {/* Sign up form */}
        <Paper elevation={8} sx={{ width: '100%', maxWidth: 440, p: 3, borderRadius: 3, background: '#f0fdf4' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, color: '#1a3a5c', letterSpacing: '0.05em' }}>
            JOIN THE ADVENTURE (SIGN UP)
          </Typography>

          <Box component="form" onSubmit={handleRegister}>
            <Grid container spacing={1.5} sx={{ width: '100%', m: 0 }}>
              <Grid item xs={6} spacing={1.5} sx={{ width: '100%', m: 0 }} >
                <TextField
                  fullWidth label="First Name" size="small"
                  value={registerForm.firstName}
                  onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                />
              </Grid>
              <Grid item xs={6} spacing={1.5} sx={{ width: '100%', m: 0 }}>
                <TextField
                  fullWidth label="Last Name" size="small"
                  value={registerForm.lastName}
                  onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} spacing={1.5} sx={{ width: '100%', m: 0 }}>
                <TextField
                  fullWidth label="Email Address" type="email" size="small"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} spacing={1.5} sx={{ width: '100%', m: 0 }}>
                <TextField
                  fullWidth label="Create Password" type="password" size="small"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} spacing={1.5} sx={{ width: '100%', m: 0 }}>
                <TextField
                  fullWidth label="Confirm Password" type="password" size="small"
                  value={registerForm.confirmPassword}
                  onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                />
              </Grid>
            </Grid>

            <FormControlLabel
              sx={{ mt: 1.5, mb: 1 }}
              control={<Checkbox size="small" checked={agreedTerms} onChange={(e) => setAgreedTerms(e.target.checked)} />}
              label={
                <Typography variant="caption">
                  I agree to the{' '}
                  <Link href="#" sx={{ color: '#00b4d8' }}>Terms of Service</Link>
                  {' & '}
                  <Link href="#" sx={{ color: '#00b4d8' }}>Privacy Policy</Link>
                </Typography>
              }
            />

            <Button
              type="submit" variant="contained" fullWidth
              disabled={loading}
              sx={{ py: 1.2, background: '#2ecc71', '&:hover': { background: '#27ae60' }, fontWeight: 700 }}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Create Account'}
            </Button>
          </Box>

          <Divider sx={{ my: 1.5 }}>
            <Typography variant="caption" sx={{ color: '#999' }}>OR CONNECT WITH</Typography>
          </Divider>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" fullWidth startIcon={<GoogleIcon />} sx={{ textTransform: 'none', fontSize: '0.8rem', borderColor: '#ddd' }}>Google</Button>
            <Button variant="contained" fullWidth startIcon={<FacebookIcon />} sx={{ textTransform: 'none', fontSize: '0.8rem', background: '#1877F2' }}>Facebook</Button>
            <Button variant="contained" fullWidth startIcon={<AppleIcon />} sx={{ textTransform: 'none', fontSize: '0.8rem', background: '#000' }}>Apple</Button>
          </Box>
        </Paper>

        {/* Seamless mobility hint */}
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>
          Seamless Mobility across Guadalajara's transport network
        </Typography>
      </Box>
    </Box>
  );
}

function GDLLogoFull() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, justifyContent: 'center' }}>
      <svg width="48" height="56" viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 4 C24 4 14 14 14 24 C14 32 18 36 24 40 C30 36 34 32 34 24 C34 14 24 4 24 4Z" fill="#00b4d8"/>
        <path d="M24 16 C16 10 6 13 6 13 C9 20 16 24 24 24" fill="#2ecc71"/>
        <path d="M24 16 C32 10 42 13 42 13 C39 20 32 24 24 24" fill="#2ecc71"/>
        <path d="M24 24 C16 21 9 28 9 28 C12 32 18 33 24 33" fill="#1abc9c"/>
        <path d="M24 24 C32 21 39 28 39 28 C36 32 30 33 24 33" fill="#1abc9c"/>
        <rect x="22" y="33" width="4" height="20" rx="2" fill="#00b4d8"/>
        <rect x="16" y="49" width="16" height="4" rx="2" fill="#ffffff" opacity="0.3"/>
      </svg>
      <Box>
        <Typography sx={{ color: '#00b4d8', fontWeight: 800, fontSize: '0.7rem', letterSpacing: '0.2em' }}>
          WONDER
        </Typography>
        <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '2.2rem', lineHeight: 1, fontFamily: '"Montserrat", sans-serif' }}>
          GDL
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500, fontSize: '0.7rem', letterSpacing: '0.1em' }}>
          Routes & Travels
        </Typography>
      </Box>
    </Box>
  );
}
