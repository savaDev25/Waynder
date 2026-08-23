import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, Button, Chip, CircularProgress } from '@mui/material';
import ConstructionIcon from '@mui/icons-material/Construction';
import TrainIcon from '@mui/icons-material/Train';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import MapIcon from '@mui/icons-material/Map';
import Navbar from '../components/Navbar';
import MapComponent from '../components/MapComponent';
import { landmarkService } from '../api';

// Public transit (metro/BRT/bus/bike-share lines, schedules, live alerts) has
// no equivalent anywhere in the backend data model -- unlike the other pages,
// this isn't "some fields are fake," it's a whole domain (GTFS-style transit
// data) that was never built. Rather than present invented live status as if
// real, this is an honest placeholder until that's a deliberate feature.
const PLANNED_FEATURES = [
  { icon: TrainIcon, label: 'Real transit line routes (Tren Ligero, Mi Macro, buses)' },
  { icon: NotificationsActiveIcon, label: 'Live service alerts and delays' },
  { icon: DirectionsBikeIcon, label: 'Bike-share station availability' },
  { icon: MapIcon, label: 'Combined multi-modal trip planning' },
];

export default function MobilityPage() {
  const navigate = useNavigate();
  const [landmarks, setLandmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  // The map itself is real -- shows actual landmarks already in the system,
  // just without any transit line overlay (since none exists yet).
  useEffect(() => {
    let cancelled = false;
    landmarkService
      .search()
      .then((r) => { if (!cancelled) setLandmarks(r); })
      .catch(() => { if (!cancelled) setLandmarks([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const markers = landmarks.map((l) => ({ lat: l.lat, lng: l.lng, label: l.name, icon: '📍', color: '#1a3a5c' }));

  return (
    <Box sx={{ mt: '60px', display: 'flex', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
      <Navbar />

      <Box sx={{ flex: 1, position: 'relative' }}>
        {loading ? (
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress sx={{ color: '#00b4d8' }} />
          </Box>
        ) : (
          <MapComponent height="100%" markers={markers} center={[20.6597, -103.3496]} zoom={12} />
        )}

        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <Paper
            elevation={8}
            sx={{
              pointerEvents: 'auto', maxWidth: 460, m: 2, p: 4, borderRadius: 4,
              background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(10px)', textAlign: 'center',
            }}
          >
            <Box
              sx={{
                width: 64, height: 64, borderRadius: '50%', mx: 'auto', mb: 2,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg,#00b4d8,#0077b6)',
              }}
            >
              <ConstructionIcon sx={{ color: '#fff', fontSize: 30 }} />
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 900, color: '#1a3a5c', mb: 1 }}>
              🚌 Mobility Map — Coming Soon
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
              Public transit integration (transit lines, live status, and multi-modal trip
              planning) is on the roadmap. Here's what's planned:
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, mb: 3, textAlign: 'left' }}>
              {PLANNED_FEATURES.map(({ icon: Icon, label }) => (
                <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: '#e3f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon sx={{ color: '#00b4d8', fontSize: 18 }} />
                  </Box>
                  <Typography variant="body2" sx={{ color: '#444', fontSize: '0.85rem' }}>{label}</Typography>
                </Box>
              ))}
            </Box>

            <Chip
              icon={<DirectionsBusIcon sx={{ fontSize: '14px !important' }} />}
              label={`${landmarks.length} places already on the map`}
              size="small"
              sx={{ mb: 2, bgcolor: '#f0f4f8', color: '#1a3a5c', fontWeight: 600 }}
            />

            <Button
              fullWidth variant="contained"
              onClick={() => navigate('/plan')}
              sx={{ background: 'linear-gradient(135deg, #00b4d8, #0077b6)', fontWeight: 700, py: 1.2 }}
            >
              Plan a Trip Instead
            </Button>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}