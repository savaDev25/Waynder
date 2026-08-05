import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Box, Button, IconButton, Typography,
  InputBase, Avatar, Menu, MenuItem, Chip, Tooltip, Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import TranslateIcon from '@mui/icons-material/Translate';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { authService } from '../services/authService';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Mobility Map', path: '/mobility' },
  { label: 'Tourism Routes', path: '/tourism' },
  { label: 'Plan Your Trip', path: '/plan', highlight: true },
  { label: 'Explore', path: '/explore' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const user = authService.getCurrentUser();

  const handleUserMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleUserMenuClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
    handleUserMenuClose();
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        background: 'linear-gradient(135deg, #0d1f33 0%, #1a3a5c 100%)',
        boxShadow: '0 2px 20px rgba(0,0,0,0.4)',
        zIndex: 1300,
        height: 60,
      }}
    >
      <Toolbar sx={{ minHeight: '60px !important', px: 2, gap: 1 }}>
        {/* Logo */}
        <Box
          onClick={() => navigate('/')}
          sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', mr: 2 }}
        >
          <Box
            component="img"
            src="Wonder GDL Logo.png"
            alt="WonderGDL"
            sx={{ width: 36, height: 36 }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        
          <Box>
            <Typography
              variant="caption"
              sx={{ color: '#00b4d8', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '0.15em', display: 'block', lineHeight: 1 }}
            >
              WonderGDL
            </Typography>
            
          </Box>
        </Box>

        {/* Nav Links */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, flex: 1 }}>
          {navLinks.map((link) => (
            <Button
              key={link.path}
              onClick={() => navigate(link.path)}
              sx={{
                color: link.highlight
                  ? '#00b4d8'
                  : location.pathname === link.path
                  ? '#fff'
                  : 'rgba(255,255,255,0.75)',
                fontWeight: link.highlight || location.pathname === link.path ? 700 : 500,
                fontSize: '0.82rem',
                textTransform: 'none',
                px: 1.5,
                py: 0.5,
                borderBottom: location.pathname === link.path ? '2px solid #00b4d8' : '2px solid transparent',
                borderRadius: 0,
                '&:hover': { color: '#fff', background: 'rgba(255,255,255,0.08)' },
              }}
            >
              {link.label}
            </Button>
          ))}
        </Box>

        {/* Search */}
        <Box sx={{
          display: 'flex', alignItems: 'center',
          background: 'rgba(255,255,255,0.1)', borderRadius: 2,
          px: 1.5, py: 0.5, gap: 1, minWidth: 160,
        }}>
          <TranslateIcon sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 16 }} />
          <InputBase
            placeholder="Language | Search"
            sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.82rem', flex: 1 }}
          />
          <SearchIcon sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 18 }} />
        </Box>

        {/* Notifications */}
        <Tooltip title="Notifications">
          <IconButton sx={{ color: 'rgba(255,255,255,0.8)' }}>
            <NotificationsIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        {/* User */}
        {user ? (
          <>
            <IconButton onClick={handleUserMenuOpen} sx={{ p: 0.5 }}>
              <Avatar
                sx={{ width: 32, height: 32, bgcolor: '#00b4d8', fontSize: '0.85rem', fontWeight: 700 }}
              >
                {user.firstName?.[0] || 'U'}
              </Avatar>
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleUserMenuClose}>
              <MenuItem onClick={() => { navigate('/profile'); handleUserMenuClose(); }}>My Profile</MenuItem>
              <MenuItem onClick={() => { navigate('/plan'); handleUserMenuClose(); }}>My Trips</MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>Logout</MenuItem>
            </Menu>
          </>
        ) : (
          <Button
            variant="outlined"
            size="small"
            onClick={() => navigate('/login')}
            sx={{
              color: '#fff', borderColor: 'rgba(255,255,255,0.5)',
              fontWeight: 600, fontSize: '0.8rem',
              '&:hover': { borderColor: '#00b4d8', color: '#00b4d8' },
            }}
          >
            Login / Sign Up
          </Button>
        )}

        <IconButton sx={{ color: 'rgba(255,255,255,0.8)', display: { md: 'none' } }}>
          <MenuIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}

// Inline agave SVG logo
function AgaveLogoSVG() {
  return (
    <svg width="28" height="32" viewBox="0 0 28 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 2 C14 2 8 8 8 14 C8 18 10 20 14 22 C18 20 20 18 20 14 C20 8 14 2 14 2Z" fill="#00b4d8" opacity="0.9"/>
      <path d="M14 10 C10 6 4 8 4 8 C6 12 10 14 14 14" fill="#2ecc71" opacity="0.8"/>
      <path d="M14 10 C18 6 24 8 24 8 C22 12 18 14 14 14" fill="#2ecc71" opacity="0.8"/>
      <path d="M14 14 C10 12 6 16 6 16 C8 18 12 18 14 18" fill="#1abc9c" opacity="0.7"/>
      <path d="M14 14 C18 12 22 16 22 16 C20 18 16 18 14 18" fill="#1abc9c" opacity="0.7"/>
      <rect x="13" y="18" width="2" height="12" rx="1" fill="#00b4d8"/>
      <rect x="10" y="26" width="8" height="2" rx="1" fill="#1a3a5c" opacity="0.3"/>
    </svg>
  );
}
