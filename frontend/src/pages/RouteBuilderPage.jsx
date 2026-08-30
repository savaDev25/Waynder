import React, { useState } from 'react';
import {
  Box, TextField, Typography, Button, Snackbar, Alert, Divider,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import Navbar from '../components/Navbar';
import StopSelector from '../components/routes/StopSelector';
import RouteMapPreview from '../components/routes/RouteMapPreview';
import RecommendedLandmarksPanel from '../components/recomendations/RecommendedLandmarksPanel';
import { routeService } from '../api';
import { useCurrentUser } from '../hooks/useCurrentUser';

// Standalone route creation -- left panel mirrors Google Maps' directions
// UI (search, lettered draggable stops), right side shows the live preview.
export default function RouteBuilderPage() {
  const { userId, setUserId } = useCurrentUser();
  const [routeName, setRouteName] = useState('');
  const [stops, setStops] = useState([]);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, msg: '', severity: 'success' });

  const canSave = Boolean(userId) && routeName.trim().length > 0 && stops.length > 0 && !saving;

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
    } catch (err) {
      setSnackbar({ open: true, msg: err.message || 'Failed to save route', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ mt: '60px', display: 'flex', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
      <Navbar />

      <Box sx={{ width: 380, flexShrink: 0, overflow: 'auto', borderRight: '1px solid #e0e0e0', bgcolor: '#fff', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 2, background: 'linear-gradient(135deg, #0d1f33, #1a3a5c)' }}>
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 800, fontSize: '0.95rem' }}>
            🧭 Build a Route
          </Typography>
          <Typography variant="caption" sx={{ color: '#00b4d8' }}>
            Add stops in the order you'd like to visit them
          </Typography>
        </Box>

        {!userId && (
          <Alert severity="warning" sx={{ m: 2, fontSize: '0.75rem' }}>
            No user set yet (temporary until login exists).
            <TextField
              size="small" placeholder="Paste a user id and press Enter" fullWidth sx={{ mt: 1 }}
              onKeyDown={(e) => { if (e.key === 'Enter') setUserId(e.target.value.trim()); }}
            />
          </Alert>
        )}

        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth size="small" label="Route name"
            value={routeName} onChange={(e) => setRouteName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <StopSelector stops={stops} onChange={setStops} />
        </Box>

        <Divider />

        <Box sx={{ p: 2 }}>
          <RecommendedLandmarksPanel
            basedOnIds={stops.map((s) => s.id)}
            onAdd={(landmark) => setStops((prev) => (prev.some((s) => s.id === landmark.id) ? prev : [...prev, landmark]))}
          />
        </Box>

        <Box sx={{ mt: 'auto', p: 2, borderTop: '1px solid #eee' }}>
          <Button
            fullWidth variant="contained" startIcon={<SaveIcon />}
            disabled={!canSave}
            onClick={handleSave}
            sx={{ background: 'linear-gradient(135deg,#00b4d8,#0077b6)', fontWeight: 700, py: 1 }}
          >
            {saving ? 'Saving...' : `Save Route (${stops.length} stop${stops.length !== 1 ? 's' : ''})`}
          </Button>
        </Box>
      </Box>

      <Box sx={{ flex: 1, position: 'relative' }}>
        <RouteMapPreview stops={stops} height="100%" />
      </Box>

      <Snackbar
        open={snackbar.open} autoHideDuration={3500}
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