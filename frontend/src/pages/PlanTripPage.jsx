import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Button, Divider,
  Tab, Tabs, Chip, CircularProgress, Alert, IconButton, Snackbar,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Navbar from '../components/Navbar';
import RouteMapPreview from '../components/routes/RouteMapPreview';
import StopSelector from '../components/routes/StopSelector';
import RecommendedLandmarksPanel from '../components/recomendations/RecommendedLandmarksPanel';
import { routeService, landmarkService } from '../api';
import { useCurrentUser } from '../hooks/useCurrentUser';

const STOP_LETTER = (i) => String.fromCharCode(65 + (i % 26));

export default function PlanTripPage() {
  const { userId, setUserId } = useCurrentUser();
  const [searchParams] = useSearchParams();

  const [routeName, setRouteName] = useState('');
  const [stops, setStops] = useState([]);
  const [saving, setSaving] = useState(false);

  const [sideTab, setSideTab] = useState(0); // 0 = Itinerary, 1 = Saved Routes
  const [savedRoutes, setSavedRoutes] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [savedError, setSavedError] = useState(null);

  const [snackbar, setSnackbar] = useState({ open: false, msg: '', severity: 'success' });

  const canSave = Boolean(userId) && routeName.trim().length > 0 && stops.length > 0 && !saving;

  const loadSavedRoutes = useCallback(() => {
    if (!userId) return;
    setLoadingSaved(true);
    routeService
      .listByUser(userId)
      .then(setSavedRoutes)
      .catch((err) => setSavedError(err.message || 'Failed to load saved routes'))
      .finally(() => setLoadingSaved(false));
  }, [userId]);

  // Coming from TourismPage's "Start Here" / "Plan This Route" (?route=<id>):
  // load that route straight into the builder, same as clicking 👁️ on a
  // saved route below.
  //
  // Coming from NearbyPage's "Add to Trip" (?addLandmark=<id>): fetch that
  // one landmark and add it as a stop, without discarding whatever's
  // already being built.
  useEffect(() => {
    const routeId = searchParams.get('route');
    const landmarkId = searchParams.get('addLandmark');

    if (routeId) {
      handleViewSaved(routeId);
    } else if (landmarkId) {
      landmarkService
        .getById(landmarkId)
        .then((landmark) => {
          setStops((prev) => (prev.some((s) => s.id === landmark.id) ? prev : [...prev, landmark]));
        })
        .catch((err) => setSnackbar({ open: true, msg: err.message || 'Failed to add place', severity: 'error' }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadSavedRoutes();
  }, [loadSavedRoutes]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await routeService.create(userId, {
        name: routeName.trim(),
        landmarkIds: stops.map((s) => s.id),
      });
      setSnackbar({ open: true, msg: 'Route saved!', severity: 'success' });
      setRouteName('');
      setStops([]);
      loadSavedRoutes();
      setSideTab(1);
    } catch (err) {
      setSnackbar({ open: true, msg: err.message || 'Failed to save route', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleViewSaved = async (id) => {
    try {
      const route = await routeService.getById(id);
      setRouteName(route.name);
      // Route.landmarks only carries {landmarkId, name, lat, lng, orderIndex} --
      // no address/tags on this shape, so those fields just won't render.
      setStops(route.landmarks.map((l) => ({ id: l.landmarkId, name: l.name, lat: l.lat, lng: l.lng })));
      setSideTab(0);
    } catch (err) {
      setSnackbar({ open: true, msg: err.message || 'Failed to load route', severity: 'error' });
    }
  };

  const handleDeleteSaved = async (id) => {
    try {
      await routeService.remove(id);
      setSnackbar({ open: true, msg: 'Route deleted.', severity: 'success' });
      loadSavedRoutes();
    } catch (err) {
      setSnackbar({ open: true, msg: err.message || 'Failed to delete route', severity: 'error' });
    }
  };

  return (
    <Box sx={{ mt: '60px', display: 'flex', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
      <Navbar />

      {/* LEFT: Build controls */}
      <Box sx={{ width: 300, flexShrink: 0, overflow: 'auto', borderRight: '1px solid #e0e0e0', background: '#fff' }}>
        <Paper elevation={0} sx={{ p: 2, borderBottom: '1px solid #f0f0f0' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1a3a5c', mb: 2, fontSize: '1rem', letterSpacing: '0.05em' }}>
            PLAN YOUR ROUTE
          </Typography>

          {!userId && (
            <Alert severity="warning" sx={{ mb: 2, fontSize: '0.75rem' }}>
              No user set yet (temporary until login exists).
              <TextField
                size="small" placeholder="Paste a user id and press Enter" fullWidth sx={{ mt: 1 }}
                onKeyDown={(e) => { if (e.key === 'Enter') setUserId(e.target.value.trim()); }}
              />
            </Alert>
          )}

          <TextField
            fullWidth label="Route name" size="small"
            value={routeName} onChange={(e) => setRouteName(e.target.value)}
            sx={{ mb: 2 }}
          />

          <StopSelector stops={stops} onChange={setStops} placeholder="Add a stop (origin, waypoints, destination...)" />

          <Button
            fullWidth variant="contained" startIcon={<SaveIcon />}
            disabled={!canSave} onClick={handleSave}
            sx={{ mt: 2, py: 1.2, fontWeight: 700 }}
          >
            {saving ? <CircularProgress size={18} color="inherit" /> : 'Save Route'}
          </Button>

          <Button
            variant="outlined" fullWidth size="small"
            onClick={() => { setRouteName(''); setStops([]); }}
            sx={{ mt: 1 }}
          >
            Clear
          </Button>
        </Paper>

        <Box sx={{ p: 2 }}>
          <RecommendedLandmarksPanel
            basedOnIds={stops.map((s) => s.id)}
            onAdd={(landmark) => setStops((prev) => (prev.some((s) => s.id === landmark.id) ? prev : [...prev, landmark]))}
          />
        </Box>
      </Box>

      {/* CENTER: Map */}
      <Box sx={{ flex: 1, position: 'relative' }}>
        <RouteMapPreview stops={stops} height="100%" />

        {stops.length > 0 && (
          <Box sx={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 1000 }}>
            <Chip
              label={`${routeName || 'Untitled route'} · ${stops.length} stop${stops.length !== 1 ? 's' : ''}`}
              sx={{ background: 'rgba(26,58,92,0.9)', color: '#fff', fontWeight: 700, backdropFilter: 'blur(4px)' }}
            />
          </Box>
        )}
      </Box>

      {/* RIGHT: Itinerary + Saved Routes */}
      <Box sx={{ width: 340, flexShrink: 0, overflow: 'auto', borderLeft: '1px solid #e0e0e0', background: '#fff' }}>
        <Tabs value={sideTab} onChange={(_, v) => setSideTab(v)} sx={{ borderBottom: '1px solid #e0e0e0', minHeight: 48 }}>
          <Tab label="Itinerary" sx={{ fontWeight: 600, fontSize: '0.85rem', minHeight: 48 }} />
          <Tab label="Saved Routes" sx={{ fontWeight: 600, fontSize: '0.85rem', minHeight: 48 }} />
        </Tabs>

        {sideTab === 0 && (
          <Box sx={{ p: 2 }}>
            {stops.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6, color: '#5a7a9a' }}>
                <Typography variant="h2" sx={{ mb: 2 }}>🗺️</Typography>
                <Typography variant="body2">Add stops on the left to see your itinerary here.</Typography>
              </Box>
            ) : (
              stops.map((stop, i) => (
                <Box key={stop.id} sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Box sx={{
                      width: 32, height: 32, borderRadius: '50%', bgcolor: '#e3f4f8',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '2px solid #00b4d8', fontWeight: 800, color: '#1a3a5c', fontSize: '0.8rem',
                    }}>
                      {STOP_LETTER(i)}
                    </Box>
                    {i < stops.length - 1 && <Box sx={{ width: 2, height: 24, background: '#e0e0e0', mt: 0.5 }} />}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#1a3a5c' }}>{stop.name}</Typography>
                    {stop.address && (
                      <Typography variant="caption" sx={{ color: '#666', display: 'flex', alignItems: 'center', gap: 0.3 }}>
                        <LocationOnIcon sx={{ fontSize: 12 }} /> {stop.address}
                      </Typography>
                    )}
                  </Box>
                </Box>
              ))
            )}
          </Box>
        )}

        {sideTab === 1 && (
          <Box sx={{ p: 2 }}>
            {savedError && <Alert severity="error" sx={{ mb: 2 }}>{savedError}</Alert>}

            {loadingSaved ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={24} />
              </Box>
            ) : savedRoutes.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6, color: '#5a7a9a' }}>
                <Typography variant="h2" sx={{ mb: 2 }}>📭</Typography>
                <Typography variant="body2">No saved routes yet.</Typography>
              </Box>
            ) : (
              savedRoutes.map((r) => (
                <Box key={r.id} sx={{ mb: 1.5, p: 1.5, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e8edf2' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#1a3a5c' }}>{r.name}</Typography>
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    {r.landmarks.length} stop{r.landmarks.length !== 1 ? 's' : ''}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5, mt: 0.5 }}>
                    <IconButton size="small" onClick={() => handleViewSaved(r.id)}>
                      <VisibilityIcon fontSize="small" sx={{ color: '#00b4d8' }} />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteSaved(r.id)}>
                      <DeleteOutlineOutlinedIcon fontSize="small" sx={{ color: '#e74c3c' }} />
                    </IconButton>
                  </Box>
                </Box>
              ))
            )}
          </Box>
        )}
      </Box>

      <Snackbar
        open={snackbar.open} autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
          {snackbar.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}