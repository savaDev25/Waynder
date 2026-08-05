import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Button, Divider,
  Tab, Tabs, Chip, CircularProgress, Alert, IconButton,
  List, ListItem, ListItemIcon, ListItemText, Snackbar,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import SaveIcon from '@mui/icons-material/Save';
import ShareIcon from '@mui/icons-material/Share';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import Navbar from '../components/Navbar';
import MapComponent from '../components/MapComponent';
import TransportModeSelector from '../components/TransportModeSelector';
import { routesService } from '../services/routesService';

const MOCK_ROUTE = {
  name: 'Historic Center Tour',
  steps: [
    { place: 'Historic Center', subtitle: 'Guadalajara Cathedral', mode: 'bus', duration: 30, color: '#00b4d8' },
    { place: 'Tlaquepaque', subtitle: 'Tlaquepaque Artisan Market', mode: 'bus', duration: 12, color: '#00b4d8' },
    { place: 'Ajijic Village Trip', subtitle: 'Bici Publica, Bike Share', mode: 'bike', duration: 13, color: '#2ecc71' },
  ],
  totalDuration: 55,
  markers: [
    { lat: 20.6597, lng: -103.3496, label: 'Historic Center', icon: '🏛️', color: '#1a3a5c' },
    { lat: 20.6432, lng: -103.3175, label: 'Tlaquepaque', icon: '🎨', color: '#e67e22' },
    { lat: 20.2974, lng: -103.1850, label: 'Ajijic', icon: '🌊', color: '#00b4d8' },
  ],
  routes: [
    { coordinates: [[20.6597, -103.3496], [20.6432, -103.3175]], color: '#00b4d8' },
    { coordinates: [[20.6432, -103.3175], [20.2974, -103.1850]], color: '#2ecc71', weight: 3 },
  ],
};

const SAVED_ROUTES_MOCK = [
  { id: 1, name: 'Historic & Cultural', origin: 'Tlaquepaque', destination: 'Historic Center', dateSaved: '2024-05-15', modes: '(Bus, Bike)' },
  { id: 2, name: 'Lakeside Tour', origin: 'Chapala Lake', destination: 'Ajijic Village', dateSaved: '2024-05-10', modes: '(Walking)' },
  { id: 3, name: 'Daily Commute', origin: 'Sinta Amin', destination: 'Tlaquepaque', dateSaved: '2024-05-08', modes: '(Bus, BRT)' },
  { id: 4, name: 'Market Trip', origin: 'Historic Center', destination: 'Tlaquepaque Artisan Market', dateSaved: '2024-05-01', modes: '(Bus, Bike)' },
];

export default function PlanTripPage() {
  const [searchParams] = useSearchParams();
  const [sideTab, setSideTab] = useState(0); // 0=Itinerary, 1=SavedRoutes
  const [origin, setOrigin] = useState(searchParams.get('origin') || '');
  const [destination, setDestination] = useState(searchParams.get('destination') || '');
  const [selectedModes, setSelectedModes] = useState(['sitren']);
  const [loading, setLoading] = useState(false);
  const [route, setRoute] = useState(null);
  const [showSaved, setShowSaved] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [markers, setMarkers] = useState(MOCK_ROUTE.markers);
  const [routes, setRoutes] = useState([]);

  const handleGenerateRoute = async () => {
    if (!origin || !destination) return;
    setLoading(true);
    try {
      // Real call: const data = await routesService.generateRoute({ origin, destination, modes: selectedModes });
      await new Promise((r) => setTimeout(r, 1200)); // simulate API
      setRoute(MOCK_ROUTE);
      setMarkers(MOCK_ROUTE.markers);
      setRoutes(MOCK_ROUTE.routes);
    } catch (err) {
      setSnackbar({ open: true, message: 'Error generating route. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRoute = async () => {
    if (!route) return;
    try {
      // Real call: await routesService.saveRoute({ name: route.name, origin, destination, modes: selectedModes });
      await new Promise((r) => setTimeout(r, 500));
      setSnackbar({ open: true, message: '✅ Route saved successfully!' });
    } catch {
      setSnackbar({ open: true, message: 'Error saving route.' });
    }
  };

  const handleDeleteSaved = async (id) => {
    try {
      // Real call: await routesService.deleteRoute(id);
      setSnackbar({ open: true, message: 'Route deleted.' });
    } catch {
      setSnackbar({ open: true, message: 'Error deleting route.' });
    }
  };

  const swapOriginDestination = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  return (
    <Box sx={{ mt: '60px', display: 'flex', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
      <Navbar />

      {/* LEFT: Controls Panel */}
      <Box sx={{ width: 280, flexShrink: 0, overflow: 'auto', borderRight: '1px solid #e0e0e0', background: '#fff', p: 0 }}>
        {/* Generate Route */}
        <Paper elevation={0} sx={{ p: 2, borderBottom: '1px solid #f0f0f0' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1a3a5c', mb: 2, fontSize: '1rem', letterSpacing: '0.05em' }}>
            GENERATE YOUR ROUTE
          </Typography>

          <Box sx={{ position: 'relative', mb: 2 }}>
            <TextField
              fullWidth label="From (Origin)" size="small"
              value={origin} onChange={(e) => setOrigin(e.target.value)}
              sx={{ mb: 1 }}
              InputProps={{ startAdornment: <LocationOnIcon sx={{ color: '#00b4d8', mr: 0.5, fontSize: 18 }} /> }}
            />
            <IconButton
              size="small" onClick={swapOriginDestination}
              sx={{ position: 'absolute', right: -12, top: '50%', transform: 'translateY(-50%)', zIndex: 1, background: '#fff', border: '1px solid #e0e0e0', '&:hover': { background: '#f0f4f8' } }}
            >
              <SwapVertIcon fontSize="small" />
            </IconButton>
            <TextField
              fullWidth label="To (Destination)" size="small"
              value={destination} onChange={(e) => setDestination(e.target.value)}
              InputProps={{ startAdornment: <LocationOnIcon sx={{ color: '#e74c3c', mr: 0.5, fontSize: 18 }} /> }}
            />
          </Box>

          <TransportModeSelector selected={selectedModes} onSelect={setSelectedModes} size="small" />

          <Button
            fullWidth variant="contained" sx={{ mt: 2, py: 1.2, fontWeight: 700 }}
            onClick={handleGenerateRoute} disabled={loading || !origin || !destination}
          >
            {loading ? <CircularProgress size={18} color="inherit" /> : 'Generate Route'}
          </Button>

          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Button variant="outlined" fullWidth size="small" onClick={() => { setOrigin(''); setDestination(''); setRoute(null); setRoutes([]); }}>
              Clear
            </Button>
            <Button variant="outlined" fullWidth size="small" onClick={() => setShowSaved(!showSaved)}>
              Saved Routes
            </Button>
          </Box>
        </Paper>

        {/* Saved Routes Table */}
        {showSaved && (
          <Box sx={{ p: 2, borderBottom: '1px solid #f0f0f0' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: '#1a3a5c' }}>My Saved Routes</Typography>
            {SAVED_ROUTES_MOCK.map((r) => (
              <Box key={r.id} sx={{ mb: 1.5, p: 1.5, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e8edf2' }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#1a3a5c' }}>{r.name}</Typography>
                <Typography variant="caption" sx={{ color: '#666' }}>{r.origin} → {r.destination}</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                  <Chip label={r.modes} size="small" sx={{ fontSize: '0.6rem', height: 20 }} />
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Button size="small" sx={{ fontSize: '0.65rem', py: 0.2, px: 0.8, minWidth: 'auto', color: '#00b4d8', border: '1px solid #00b4d8' }}>View</Button>
                    <Button size="small" sx={{ fontSize: '0.65rem', py: 0.2, px: 0.8, minWidth: 'auto', color: '#e74c3c', border: '1px solid #e74c3c' }} onClick={() => handleDeleteSaved(r.id)}>Del</Button>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* CENTER: Map */}
      <Box sx={{ flex: 1, position: 'relative' }}>
        <MapComponent
          height="100%"
          markers={markers}
          routes={routes}
          center={[20.6597, -103.3496]}
          zoom={12}
        />

        {/* Map overlay labels */}
        {route && (
          <Box sx={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 1000 }}>
            <Chip
              label={`Route: ${route.name} · ${route.totalDuration} min total`}
              sx={{ background: 'rgba(26,58,92,0.9)', color: '#fff', fontWeight: 700, backdropFilter: 'blur(4px)' }}
            />
          </Box>
        )}
      </Box>

      {/* RIGHT: Sidebar */}
      <Box sx={{ width: 340, flexShrink: 0, overflow: 'auto', borderLeft: '1px solid #e0e0e0', background: '#fff' }}>
        <Tabs value={sideTab} onChange={(_, v) => setSideTab(v)} sx={{ borderBottom: '1px solid #e0e0e0', minHeight: 48 }}>
          <Tab label="Itinerary" sx={{ fontWeight: 600, fontSize: '0.85rem', minHeight: 48 }} />
          <Tab label="Saved Routes" sx={{ fontWeight: 600, fontSize: '0.85rem', minHeight: 48 }} />
        </Tabs>

        {sideTab === 0 && (
          <Box sx={{ p: 2 }}>
            {route ? (
              <>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, color: '#1a3a5c', fontSize: '0.95rem' }}>
                  Plan Your Trip — Route Planner
                </Typography>

                <TransportModeSelector selected={selectedModes} onSelect={setSelectedModes} size="small" />

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Step & Itinerary</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#00b4d8', cursor: 'pointer' }}>
                    <AccessTimeIcon fontSize="small" />
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>All more</Typography>
                  </Box>
                </Box>

                <Typography variant="caption" sx={{ color: '#999', display: 'block', mb: 1 }}>Route (Origin)</Typography>

                {route.steps.map((step, i) => {
                  const Icon = step.mode === 'bike' ? DirectionsBikeIcon : DirectionsBusIcon;
                  return (
                    <Box key={i} sx={{ display: 'flex', gap: 1.5, mb: 2, position: 'relative' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: `${step.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${step.color}` }}>
                          <Icon sx={{ color: step.color, fontSize: 18 }} />
                        </Box>
                        {i < route.steps.length - 1 && (
                          <Box sx={{ width: 2, height: 24, background: '#e0e0e0', mt: 0.5 }} />
                        )}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1a3a5c' }}>{step.place}</Typography>
                        <Typography variant="caption" sx={{ color: '#666' }}>{step.subtitle}</Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: '#00b4d8', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {step.duration} min
                      </Typography>
                    </Box>
                  );
                })}

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined" size="small" startIcon={<PhoneAndroidIcon />} fullWidth
                    sx={{ fontSize: '0.75rem', borderColor: '#1a3a5c', color: '#1a3a5c' }}
                  >
                    Send to Phone
                  </Button>
                  <Button
                    variant="outlined" size="small" startIcon={<ShareIcon />} fullWidth
                    sx={{ fontSize: '0.75rem', borderColor: '#1a3a5c', color: '#1a3a5c' }}
                  >
                    Export
                  </Button>
                </Box>

                <Button
                  fullWidth variant="contained" startIcon={<SaveIcon />} sx={{ mt: 1, fontWeight: 700 }}
                  onClick={handleSaveRoute}
                >
                  Save Route
                </Button>

                {/* Mini map preview */}
                <Box sx={{ mt: 2, borderRadius: 2, overflow: 'hidden', height: 120 }}>
                  <MapComponent
                    height="120px"
                    markers={[
                      { lat: 20.2974, lng: -103.1850, label: 'Ajijic Village Trip', icon: '🌊', color: '#00b4d8' },
                    ]}
                    center={[20.4, -103.2]}
                    zoom={9}
                  />
                </Box>
              </>
            ) : (
              <Box sx={{ textAlign: 'center', py: 6, color: '#5a7a9a' }}>
                <Typography variant="h2" sx={{ mb: 2 }}>🗺️</Typography>
                <Typography variant="body2">Generate a route to see your itinerary here.</Typography>
                <Typography variant="caption">Enter origin and destination on the left.</Typography>
              </Box>
            )}
          </Box>
        )}

        {sideTab === 1 && (
          <Box sx={{ p: 2 }}>
            {SAVED_ROUTES_MOCK.map((r) => (
              <Box key={r.id} sx={{ mb: 2, borderRadius: 2, overflow: 'hidden', border: '1px solid #e8edf2' }}>
                <Box sx={{ height: 80 }}>
                  <MapComponent
                    height="80px"
                    markers={[{ lat: 20.6597, lng: -103.3496, icon: '📍', color: '#1a3a5c' }]}
                    center={[20.6597, -103.3496]} zoom={11}
                  />
                </Box>
                <Box sx={{ p: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1a3a5c' }}>{r.name}</Typography>
                  <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                    {r.origin} → {r.destination}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                    <Button size="small" variant="contained" sx={{ fontSize: '0.7rem', py: 0.3, px: 1 }}>View</Button>
                    <Button size="small" variant="outlined" sx={{ fontSize: '0.7rem', py: 0.3, px: 1 }}>View</Button>
                  </Box>
                </Box>
              </Box>
            ))}
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
