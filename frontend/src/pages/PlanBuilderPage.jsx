import React, { useState } from 'react';
import {
  Box, Paper, TextField, Typography, Button, Tabs, Tab, IconButton,
  Snackbar, Alert, Divider, Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import Navbar from '../components/Navbar';
import StopSelector from '../components/routes/StopSelector';
import RouteMapPreview from '../components/routes/RouteMapPreview';
import RecommendedLandmarksPanel from '../components/recomendations/RecommendedLandmarksPanel';
import RecommendedRoutesPanel from '../components/recomendations/RecommendedRoutePanel';
import { planService, routeService } from '../api';
import { useCurrentUser } from '../hooks/useCurrentUser';

let localDayId = 0;
const newDay = (n) => ({ localId: ++localDayId, label: `Day ${n}`, stops: [] });

// A "day" is just a Route linked to this Plan via planId -- no backend
// changes needed, this reuses Plan > Route > Landmark as already modeled.
export default function PlanBuilderPage() {
  const { userId, setUserId } = useCurrentUser();
  const [planName, setPlanName] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [days, setDays] = useState([newDay(1)]);
  const [activeDay, setActiveDay] = useState(0);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, msg: '', severity: 'success' });

  const totalStops = days.reduce((sum, d) => sum + d.stops.length, 0);
  const canSave = Boolean(userId) && planName.trim().length > 0 && totalStops > 0 && !saving;

  const addDay = () => {
    setDays((d) => [...d, newDay(d.length + 1)]);
    setActiveDay(days.length);
  };

  const removeDay = (index) => {
    if (days.length === 1) return; // always keep at least one day
    const next = days.filter((_, i) => i !== index);
    setDays(next);
    setActiveDay((a) => Math.max(0, Math.min(a, next.length - 1)));
  };

  const updateDayStops = (index, stops) => {
    setDays((prev) => prev.map((d, i) => (i === index ? { ...d, stops } : d)));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const plan = await planService.create(userId, {
        name: planName.trim(),
        description: planDescription.trim() || undefined,
      });

      const daysWithStops = days.filter((d) => d.stops.length > 0);
      await Promise.all(
        daysWithStops.map((d) =>
          routeService.create(userId, {
            name: d.label,
            planId: plan.id,
            landmarkIds: d.stops.map((s) => s.id),
          })
        )
      );

      setSnackbar({ open: true, msg: `Plan saved with ${daysWithStops.length} day(s)!`, severity: 'success' });
      setPlanName('');
      setPlanDescription('');
      setDays([newDay(1)]);
      setActiveDay(0);
    } catch (err) {
      setSnackbar({ open: true, msg: err.message || 'Failed to save plan', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const currentDay = days[activeDay];

  return (
    <Box sx={{ mt: '60px', display: 'flex', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
      <Navbar />

      <Box sx={{ width: 400, flexShrink: 0, overflow: 'auto', borderRight: '1px solid #e0e0e0', bgcolor: '#fff', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 2, background: 'linear-gradient(135deg, #0d1f33, #1a3a5c)' }}>
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 800, fontSize: '0.95rem' }}>
            🗓️ Build a Plan
          </Typography>
          <Typography variant="caption" sx={{ color: '#00b4d8' }}>
            Pick places and assign them to each day of your trip
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
            fullWidth size="small" label="Plan name"
            value={planName} onChange={(e) => setPlanName(e.target.value)}
            sx={{ mb: 1.5 }}
          />
          <TextField
            fullWidth size="small" label="Description (optional)" multiline minRows={2}
            value={planDescription} onChange={(e) => setPlanDescription(e.target.value)}
          />
        </Box>

        <Divider />

        <Box sx={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #eee' }}>
          <Tabs
            value={activeDay} onChange={(_, v) => setActiveDay(v)}
            variant="scrollable" scrollButtons="auto"
            sx={{ flex: 1, minHeight: 44 }}
          >
            {days.map((d, i) => (
              <Tab
                key={d.localId}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {d.label}
                    {d.stops.length > 0 && (
                      <Chip label={d.stops.length} size="small" sx={{ height: 16, fontSize: '0.6rem', bgcolor: '#00b4d8', color: '#fff' }} />
                    )}
                    {days.length > 1 && (
                      <CloseIcon
                        fontSize="small"
                        sx={{ fontSize: 14, ml: 0.3, color: '#999', '&:hover': { color: '#e74c3c' } }}
                        onClick={(e) => { e.stopPropagation(); removeDay(i); }}
                      />
                    )}
                  </Box>
                }
                sx={{ minHeight: 44, fontSize: '0.78rem', textTransform: 'none' }}
              />
            ))}
          </Tabs>
          <IconButton size="small" onClick={addDay} sx={{ mx: 0.5 }}>
            <AddIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ p: 2 }}>
          <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 1, fontWeight: 700 }}>
            Places for {currentDay.label}
          </Typography>
          <StopSelector
            stops={currentDay.stops}
            onChange={(stops) => updateDayStops(activeDay, stops)}
          />
        </Box>

        <Divider />

        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <RecommendedLandmarksPanel />
          <RecommendedRoutesPanel />
        </Box>

        <Box sx={{ mt: 'auto', p: 2, borderTop: '1px solid #eee' }}>
          <Button
            fullWidth variant="contained" startIcon={<SaveIcon />}
            disabled={!canSave}
            onClick={handleSave}
            sx={{ background: 'linear-gradient(135deg,#00b4d8,#0077b6)', fontWeight: 700, py: 1 }}
          >
            {saving
              ? 'Saving...'
              : `Save Plan (${totalStops} place${totalStops !== 1 ? 's' : ''} across ${days.length} day${days.length !== 1 ? 's' : ''})`}
          </Button>
        </Box>
      </Box>

      <Box sx={{ flex: 1, position: 'relative' }}>
        <RouteMapPreview stops={currentDay.stops} height="100%" />
        <Box sx={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 500 }}>
          <Paper elevation={4} sx={{ px: 3, py: 1, borderRadius: 3, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)' }}>
            <Typography variant="body2" sx={{ fontWeight: 800, color: '#1a3a5c' }}>
              {currentDay.label} · {currentDay.stops.length} stop{currentDay.stops.length !== 1 ? 's' : ''}
            </Typography>
          </Paper>
        </Box>
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