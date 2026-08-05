import React, { useState } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Avatar, Switch,
  Divider, Tab, Tabs, Chip, Grid, IconButton, Alert, Snackbar,
  FormControlLabel, CircularProgress,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SecurityIcon from '@mui/icons-material/Security';
import KeyIcon from '@mui/icons-material/Key';
import ShieldIcon from '@mui/icons-material/Shield';
import HistoryIcon from '@mui/icons-material/History';
import SaveIcon from '@mui/icons-material/Save';
import Navbar from '../components/Navbar';
import MapComponent from '../components/MapComponent';
import { authService } from '../services/authService';

const MOCK_USER = {
  firstName: 'Elena', lastName: 'Ramirez',
  email: 'elena.ramirez@email.com', phone: '',
  memberSince: 'January 2023', level: 'Explorer', levelNumber: 5,
  preferences: {
    preferredTransport: ['Bus', 'Walking'],
    transportEnabled: true,
    diningType: 'Regional, Street Food',
    diningEnabled: true,
    activityPace: 'Relaxed',
    paceEnabled: false,
    language: 'English',
    languageEnabled: true,
  },
  savedTrips: [
    { name: 'Historical Center Walk', icon: '🏛️', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Catedral_de_Guadalajara%2C_Mexico%2C_2013-10-11%2C_DD_01.JPG/120px-Catedral_de_Guadalajara%2C_Mexico%2C_2013-10-11%2C_DD_01.JPG' },
    { name: 'Agave Fields Drive', icon: '🌵', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Jimadores.jpg/120px-Jimadores.jpg' },
    { name: 'Tlaquepaque Artisans', icon: '🎨', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Tlaquepaque_market.jpg/120px-Tlaquepaque_market.jpg' },
  ],
};

export default function ProfilePage() {
  const [sideTab, setSideTab] = useState(1); // 0=Itinerary, 1=Profile, 2=SavedRoutes
  const [user, setUser] = useState(MOCK_USER);
  const [editContact, setEditContact] = useState({ ...MOCK_USER });
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      // Real call: await authService.updateProfile(editContact);
      await new Promise((r) => setTimeout(r, 700));
      setUser(editContact);
      setSnackbar({ open: true, message: '✅ Profile updated successfully!' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Error updating profile.' });
    } finally {
      setSaving(false);
    }
  };

  const togglePref = (key) => {
    setEditContact((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, [key]: !prev.preferences[key] },
    }));
  };

  return (
    <Box sx={{ mt: '60px', display: 'flex', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
      <Navbar />

      {/* CENTER: Map + Profile overlay */}
      <Box sx={{ flex: 1, position: 'relative' }}>
        <MapComponent
          height="100%"
          markers={[
            { lat: 20.2974, lng: -103.1850, label: 'Chapala Lake', icon: '🌊', color: '#00b4d8' },
            { lat: 20.2943, lng: -103.2376, label: 'Ajijic Village Trip', icon: '🎺', color: '#e67e22' },
          ]}
          routes={[{ coordinates: [[20.2974, -103.1850], [20.2943, -103.2376]], color: '#00b4d8' }]}
          center={[20.29, -103.21]} zoom={11}
        />

        {/* Page Title */}
        <Box sx={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 1000 }}>
          <Paper elevation={4} sx={{ px: 4, py: 1.5, borderRadius: 3, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)' }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1a3a5c', textAlign: 'center' }}>
              MY GDL PROFILE
            </Typography>
          </Paper>
        </Box>

        {/* Profile Card */}
        <Paper
          elevation={6}
          sx={{
            position: 'absolute', top: 80, left: 16, width: 200,
            borderRadius: 3, p: 2, zIndex: 1000, background: 'rgba(255,255,255,0.97)',
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1a3a5c', mb: 1.5, fontSize: '0.85rem' }}>
            PROFILE OVERVIEW
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Avatar sx={{ width: 28, height: 28, bgcolor: '#1a3a5c', fontSize: '0.75rem' }}>U</Avatar>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>User</Typography>
          </Box>
          <Box sx={{ width: 80, height: 72, borderRadius: 2, overflow: 'hidden', mb: 1.5 }}>
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/240px-No_image_available.svg.png"
              alt="Profile"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </Box>
          <Typography variant="caption" sx={{ display: 'block' }}><b>User Name:</b> {user.firstName} {user.lastName}</Typography>
          <Typography variant="caption" sx={{ display: 'block' }}><b>Member Since:</b> {user.memberSince}</Typography>
          <Typography variant="caption" sx={{ display: 'block' }}><b>Membership:</b></Typography>
          <Chip
            label={`${user.level} (Level ${user.levelNumber})`}
            size="small"
            sx={{ fontSize: '0.6rem', bgcolor: '#fff8e1', color: '#f39c12', fontWeight: 700, mt: 0.5 }}
          />
        </Paper>

        {/* User Data Modal */}
        <Paper
          elevation={8}
          sx={{
            position: 'absolute', top: 80, left: 220, right: 16, bottom: 16,
            borderRadius: 3, overflow: 'auto', zIndex: 999, p: 3,
            background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(8px)',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, textAlign: 'center', color: '#1a3a5c', mb: 2, letterSpacing: '0.05em' }}>
            USER DATA & PREFERENCES
          </Typography>

          <Grid container spacing={3}>
            {/* Contact Info */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1a3a5c' }}>🌵 Contact Information</Typography>
              </Box>

              {[
                { label: 'Full Name', key: 'fullName', value: `${editContact.firstName} ${editContact.lastName}` },
                { label: 'Email Address', key: 'email', value: editContact.email },
                { label: 'Phone Number', key: 'phone', value: editContact.phone },
              ].map((field) => (
                <Box key={field.key} sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>{field.label}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a3a5c' }}>{field.value || '—'}</Typography>
                  </Box>
                  <IconButton size="small" sx={{ color: '#00b4d8' }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1a3a5c' }}>🌵 Saved Routes & Trips</Typography>
                <Chip label="View All" size="small" sx={{ bgcolor: '#00b4d8', color: '#fff', fontSize: '0.65rem', height: 20, cursor: 'pointer' }} />
              </Box>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {user.savedTrips.map((trip, i) => (
                  <Box key={i} sx={{ textAlign: 'center', width: 80 }}>
                    <Box sx={{ width: 72, height: 60, borderRadius: 1.5, overflow: 'hidden', mb: 0.5 }}>
                      <img src={trip.image} alt={trip.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.target.src = `https://via.placeholder.com/72x60?text=${trip.icon}`; }} />
                    </Box>
                    <Typography variant="caption" sx={{ fontSize: '0.6rem', fontWeight: 600, display: 'block', lineHeight: 1.2 }}>
                      {trip.name}
                    </Typography>
                  </Box>
                ))}
              </Box>
              <Box sx={{ mt: 1 }}>
                <Chip label="View All" size="small" sx={{ bgcolor: '#00b4d8', color: '#fff', fontSize: '0.65rem', height: 20, cursor: 'pointer' }} />
              </Box>
            </Grid>

            {/* Travel Preferences */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1a3a5c' }}>🌵 Travel Preferences</Typography>
              </Box>

              {[
                { label: 'Preferred Transport', sublabel: editContact.preferences.preferredTransport.join(', '), key: 'transportEnabled' },
                { label: 'Dining Type', sublabel: editContact.preferences.diningType, key: 'diningEnabled' },
                { label: 'Activity Pace', sublabel: editContact.preferences.activityPace, key: 'paceEnabled' },
                { label: 'Language', sublabel: editContact.preferences.language, key: 'languageEnabled' },
              ].map((pref) => (
                <Box key={pref.key} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{pref.label}</Typography>
                    <Typography variant="caption" sx={{ color: '#666' }}>{pref.sublabel}</Typography>
                  </Box>
                  <Switch
                    size="small" checked={editContact.preferences[pref.key]}
                    onChange={() => togglePref(pref.key)}
                    sx={{ '& .MuiSwitch-track': { bgcolor: editContact.preferences[pref.key] ? '#00b4d8' : '#ccc' } }}
                  />
                </Box>
              ))}

              <Divider sx={{ my: 2 }} />

              {/* Account Security */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <SecurityIcon sx={{ color: '#1a3a5c', fontSize: 18 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1a3a5c' }}>Account Security</Typography>
              </Box>
              {[
                { icon: <KeyIcon fontSize="small" />, label: 'Change Password' },
                { icon: <ShieldIcon fontSize="small" />, label: 'Two-Factor Authentication: Enabled' },
                { icon: <HistoryIcon fontSize="small" />, label: 'View Security Log' },
              ].map((item, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, cursor: 'pointer', '&:hover': { color: '#00b4d8' } }}>
                  <Box sx={{ color: '#5a7a9a' }}>{item.icon}</Box>
                  <Typography variant="body2" sx={{ color: '#5a7a9a' }}>{item.label}</Typography>
                </Box>
              ))}
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained" size="large" startIcon={<SaveIcon />}
              onClick={handleSaveChanges} disabled={saving}
              sx={{
                background: 'linear-gradient(135deg, #00b4d8, #0077b6)',
                px: 6, fontWeight: 700, borderRadius: 3,
              }}
            >
              {saving ? <CircularProgress size={18} color="inherit" /> : 'SAVE CHANGES'}
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* RIGHT: Sidebar */}
      <Box sx={{ width: 340, flexShrink: 0, overflow: 'auto', borderLeft: '1px solid #e0e0e0', background: '#fff' }}>
        <Tabs value={sideTab} onChange={(_, v) => setSideTab(v)} sx={{ borderBottom: '1px solid #e0e0e0', minHeight: 48 }}>
          <Tab label="Itinerary" sx={{ fontWeight: 600, fontSize: '0.8rem', minHeight: 48 }} />
          <Tab label="Profile" sx={{ fontWeight: 600, fontSize: '0.8rem', minHeight: 48 }} />
          <Tab label="Saved Routes" sx={{ fontWeight: 600, fontSize: '0.8rem', minHeight: 48 }} />
        </Tabs>

        {sideTab === 1 && (
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1a3a5c', mb: 2 }}>PROFILE OVERVIEW</Typography>

            <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
              <Avatar sx={{ width: 60, height: 60, bgcolor: '#00b4d8', fontSize: '1.5rem', border: '3px solid #1a3a5c' }}>
                {user.firstName[0]}
              </Avatar>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>User Name:</Typography>
                <Typography variant="body1" sx={{ fontWeight: 800, color: '#1a3a5c' }}>{user.firstName} {user.lastName}</Typography>
                <Typography variant="caption">Member Since: {user.memberSince}</Typography>
                <Box>
                  <Chip label="Phone Number" size="small" sx={{ fontSize: '0.6rem', mt: 0.5 }} />
                </Box>
                <Chip label={`⭐ ${user.level}`} size="small" sx={{ bgcolor: '#fff8e1', color: '#f39c12', fontWeight: 700, fontSize: '0.65rem', mt: 0.5 }} />
              </Box>
            </Box>

            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>Contact Info</Typography>

            {[
              { label: 'Full Name', value: `${user.firstName} ${user.lastName}` },
              { label: 'Email Address', value: user.email },
              { label: 'Phone Number', value: user.phone || '—' },
            ].map((f) => (
              <Box key={f.label} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
                <Typography variant="caption" sx={{ color: '#666' }}>{f.label}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#1a3a5c' }}>{f.value}</Typography>
                  <EditIcon sx={{ fontSize: 14, color: '#00b4d8', cursor: 'pointer' }} />
                </Box>
              </Box>
            ))}

            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>Travel Preferences</Typography>

            {[
              { label: 'Preferred Transport:', value: user.preferences.preferredTransport.join(', '), enabled: user.preferences.transportEnabled },
              { label: 'Dining Type:', value: user.preferences.diningType, enabled: user.preferences.diningEnabled },
              { label: 'Activity Pace:', value: user.preferences.activityPace, enabled: user.preferences.paceEnabled },
              { label: 'Language:', value: user.preferences.language, enabled: user.preferences.languageEnabled },
            ].map((p) => (
              <Box key={p.label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#666' }}>{p.label}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#1a3a5c' }}>{p.value}</Typography>
                  <Switch size="small" checked={p.enabled} readOnly sx={{ transform: 'scale(0.75)' }} />
                </Box>
              </Box>
            ))}

            <Button
              fullWidth variant="contained" sx={{ mt: 2, background: 'linear-gradient(135deg, #00b4d8, #0077b6)', fontWeight: 700 }}
              onClick={handleSaveChanges}
            >
              Save
            </Button>
          </Box>
        )}
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}
