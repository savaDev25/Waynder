import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Paper, Typography, Grid, Card, CardContent, CardActions,
  Button, Chip, Divider, TextField, InputAdornment, Select, MenuItem,
  FormControl, CircularProgress, Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Navbar from '../components/Navbar';
import MapComponent from '../components/MapComponent';
import { routeService } from '../api';

const SORT_OPTIONS = [
  { value: 'newest', label: '🆕 Newest' },
  { value: 'stops_desc', label: '📍 Most Stops' },
  { value: 'name', label: '🔤 A–Z' },
];

export default function TourismPage() {
  const navigate = useNavigate();

  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedRoute, setSelectedRoute] = useState(null);

  useEffect(() => {
    let cancelled = false;
    routeService
      .listAll()
      .then((r) => { if (!cancelled) setRoutes(r); })
      .catch((err) => { if (!cancelled) setError(err.message || 'Failed to load routes'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filtered = routes
    .filter((r) => !searchQuery || r.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'stops_desc') return b.landmarks.length - a.landmarks.length;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return new Date(b.createdAt) - new Date(a.createdAt); // newest first
    });

  // One marker per route, at its first stop -- a rough "where does this
  // route start" pin, since routes don't have a single coordinate of
  // their own.
  const markers = filtered
    .filter((r) => r.landmarks.length > 0)
    .map((r) => ({
      lat: r.landmarks[0].lat,
      lng: r.landmarks[0].lng,
      label: r.name,
      icon: '🗺️',
      color: '#1a3a5c',
    }));

  return (
    <Box sx={{ mt: '60px', height: 'calc(100vh - 60px)', overflow: 'auto' }}>
      <Navbar />

      <Box sx={{ background: 'linear-gradient(135deg, #0d1f33, #1a3a5c)', py: 4, px: 3 }}>
        <Typography variant="h4" sx={{ color: '#fff', fontWeight: 900, mb: 0.5 }}>
          🗺️ Tourism Routes
        </Typography>
        <Typography variant="body1" sx={{ color: '#00b4d8', mb: 2 }}>
          Descubre rutas creadas por la comunidad en la ZMG
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Search routes..." size="small" value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#fff', fontSize: 18 }} /></InputAdornment> }}
            sx={{
              flex: 1, maxWidth: 300,
              '& .MuiOutlinedInput-root': { bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2, color: '#fff' },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
              '& input::placeholder': { color: 'rgba(255,255,255,0.6)' },
            }}
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <Select
              value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: 2, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' } }}
            >
              {SORT_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/*
          Removed vs. the original mock: category tabs (Cultural/Nature/...).
          Routes don't have a category/tag field -- that concept lives on
          Landmark, not Route. Could add a derived "dominant tag" later by
          aggregating each route's landmarks' tags, but that needs a bit
          more backend support (RouteLandmarkResponseDTO doesn't carry tags
          today) -- worth doing as a deliberate follow-up, not bolted on here.
        */}
      </Box>

      <Box sx={{ display: 'flex', minHeight: 500 }}>
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress sx={{ color: '#00b4d8' }} />
            </Box>
          ) : (
            <>
              <Typography variant="subtitle2" sx={{ mb: 2, color: '#666' }}>
                {filtered.length} routes found
              </Typography>

              {filtered.length === 0 ? (
                <Paper elevation={0} sx={{ p: 6, textAlign: 'center', border: '1px dashed #ddd', borderRadius: 3 }}>
                  <Typography variant="h3" sx={{ mb: 1 }}>🗺️</Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    No routes yet — be the first to build one!
                  </Typography>
                  <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/plan')}>
                    Build a Route
                  </Button>
                </Paper>
              ) : (
                <Grid container spacing={2}>
                  {filtered.map((route) => (
                    <Grid item xs={12} sm={6} lg={4} key={route.id}>
                      <Card
                        sx={{
                          cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column',
                          border: selectedRoute?.id === route.id ? '2px solid #00b4d8' : '1px solid transparent',
                          transition: 'all 0.2s',
                        }}
                        onClick={() => setSelectedRoute(route)}
                      >
                        <Box sx={{ p: 2, background: 'linear-gradient(135deg,#1a3a5c,#2d5a8c)' }}>
                          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 800, fontSize: '0.95rem' }}>
                            🗺️ {route.name}
                          </Typography>
                        </Box>

                        <CardContent sx={{ flex: 1, p: 1.5, pb: '8px !important' }}>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                            <Chip
                              icon={<LocationOnIcon sx={{ fontSize: '12px !important' }} />}
                              label={`${route.landmarks.length} stop${route.landmarks.length !== 1 ? 's' : ''}`}
                              size="small" sx={{ fontSize: '0.65rem', height: 22 }}
                            />
                          </Box>

                          {route.landmarks.slice(0, 3).map((l, i) => (
                            <Typography key={l.landmarkId} variant="caption" sx={{ color: '#555', display: 'block', fontSize: '0.75rem' }}>
                              {String.fromCharCode(65 + i)}. {l.name}
                            </Typography>
                          ))}
                          {route.landmarks.length > 3 && (
                            <Typography variant="caption" sx={{ color: '#999', fontSize: '0.72rem' }}>
                              +{route.landmarks.length - 3} more
                            </Typography>
                          )}
                        </CardContent>

                        <CardActions sx={{ p: 1.5, pt: 0 }}>
                          <Button
                            fullWidth size="small" variant="contained" endIcon={<ArrowForwardIcon />}
                            onClick={(e) => { e.stopPropagation(); navigate(`/plan?route=${route.id}`); }}
                            sx={{ background: '#00b4d8', fontWeight: 700, fontSize: '0.75rem' }}
                          >
                            Start Here
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          )}
        </Box>

        {/* Right: mini map + selected route detail */}
        <Box sx={{ width: 320, flexShrink: 0, borderLeft: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ height: 200 }}>
            <MapComponent height="200px" markers={markers} center={[20.6597, -103.3496]} zoom={10} />
          </Box>

          {selectedRoute ? (
            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#1a3a5c', mb: 1 }}>
                🗺️ {selectedRoute.name}
              </Typography>

              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Stops</Typography>
              {selectedRoute.landmarks.map((l, i) => (
                <Box key={l.landmarkId} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Chip label={String.fromCharCode(65 + i)} size="small" sx={{ height: 20, fontWeight: 800, bgcolor: '#1a3a5c', color: '#fff' }} />
                  <Typography variant="body2" sx={{ color: '#444', fontSize: '0.82rem' }}>{l.name}</Typography>
                </Box>
              ))}

              <Divider sx={{ my: 1.5 }} />

              <Button
                fullWidth variant="contained"
                onClick={() => navigate(`/plan?route=${selectedRoute.id}`)}
                sx={{ background: 'linear-gradient(135deg, #1a3a5c, #2d5a8c)', fontWeight: 700 }}
              >
                Plan This Route
              </Button>
            </Box>
          ) : (
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', p: 3, textAlign: 'center' }}>
              <Typography variant="body2">Select a route to see details</Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}