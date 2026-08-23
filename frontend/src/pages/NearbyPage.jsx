import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Paper, Typography, Checkbox, FormControlLabel, TextField,
  Button, Chip, CircularProgress, Alert, Tab, Tabs,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MapIcon from '@mui/icons-material/Map';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlined';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import Navbar from '../components/Navbar';
import MapComponent from '../components/MapComponent';
import { landmarkService } from '../api';
import { haversineKm, formatDistance } from '../utils/distance';

const TAG_ICONS = {
  museum: '🎨', attraction: '📍', art: '🖼️', viewpoint: '👀', nature: '🌳', historical: '🏛️',
};
const FALLBACK_ICON = '📍';

// Guadalajara centro -- used only if the browser denies/lacks geolocation,
// so "nearby" still means something instead of the page just breaking.
const FALLBACK_ORIGIN = { lat: 20.6597, lng: -103.3496 };

const handleImgError = (e, name, color = '00b4d8') => {
  e.target.onerror = null;
  const cleanColor = color.replace('#', '');
  e.target.src = `https://placehold.co/600x400/${cleanColor}/FFFFFF?text=${encodeURIComponent(name)}`;
};

export default function NearbyPage() {
  const navigate = useNavigate();

  const [landmarks, setLandmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [origin, setOrigin] = useState(null);
  const [locating, setLocating] = useState(true);
  const [usedFallbackOrigin, setUsedFallbackOrigin] = useState(false);

  const [selectedTags, setSelectedTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapCenter, setMapCenter] = useState([FALLBACK_ORIGIN.lat, FALLBACK_ORIGIN.lng]);
  const [mapZoom, setMapZoom] = useState(12);

  useEffect(() => {
    let cancelled = false;
    landmarkService
      .search()
      .then((r) => { if (!cancelled) setLandmarks(r); })
      .catch((err) => { if (!cancelled) setError(err.message || 'Failed to load places'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // Real device location -- this is what makes "nearby" actually mean
  // something, instead of a fixed list of places around one hardcoded point.
  useEffect(() => {
    if (!navigator.geolocation) {
      setOrigin(FALLBACK_ORIGIN);
      setUsedFallbackOrigin(true);
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const real = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setOrigin(real);
        setMapCenter([real.lat, real.lng]);
        setLocating(false);
      },
      () => {
        setOrigin(FALLBACK_ORIGIN);
        setUsedFallbackOrigin(true);
        setLocating(false);
      },
      { timeout: 8000 }
    );
  }, []);

  // Categories are whatever tags actually exist in the data, same approach
  // as ExplorePage -- not a fixed list that may not match real content.
  const availableTags = useMemo(() => {
    const set = new Set();
    landmarks.forEach((l) => (l.tags || []).forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [landmarks]);

  const withDistance = useMemo(() => {
    if (!origin) return [];
    return landmarks.map((l) => ({ ...l, distanceKm: haversineKm(origin.lat, origin.lng, l.lat, l.lng) }));
  }, [landmarks, origin]);

  const filtered = withDistance
    .filter((p) => {
      const matchTag = selectedTags.length === 0 || selectedTags.some((t) => (p.tags || []).includes(t));
      const haystack = `${p.name} ${p.description || ''}`.toLowerCase();
      const matchSearch = !searchQuery || haystack.includes(searchQuery.toLowerCase());
      return matchTag && matchSearch;
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);

  const toggleTag = (tag) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  // Hands off to the route builder with this landmark pre-added as a stop --
  // PlanTripPage reads ?addLandmark= on mount (see PlanTripPage.jsx).
  const handleAddToTrip = (placeId) => {
    navigate(`/plan?addLandmark=${placeId}`);
  };

  const handleViewOnMap = (place) => {
    setMapCenter([place.lat, place.lng]);
    setMapZoom(15);
  };

  const markers = filtered.map((p) => ({
    lat: p.lat, lng: p.lng, label: p.name,
    icon: TAG_ICONS[(p.tags || [])[0]] || FALLBACK_ICON, color: '#1a3a5c',
  }));
  if (origin) {
    markers.unshift({ lat: origin.lat, lng: origin.lng, label: 'You are here', icon: '📍', color: '#e74c3c' });
  }

  return (
    <Box sx={{ mt: '60px', display: 'flex', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
      <Navbar />

      {/* LEFT: Filters */}
      <Box sx={{ width: 240, flexShrink: 0, overflow: 'auto', borderRight: '1px solid #e0e0e0', background: '#fff' }}>
        <Paper elevation={0} sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1a3a5c', mb: 2, fontSize: '0.95rem', letterSpacing: '0.08em' }}>
            FILTER BY CATEGORY
          </Typography>

          {availableTags.length === 0 ? (
            <Typography variant="caption" sx={{ color: '#999' }}>No categories yet.</Typography>
          ) : (
            availableTags.map((tag) => (
              <FormControlLabel
                key={tag}
                control={
                  <Checkbox
                    size="small"
                    checked={selectedTags.includes(tag)}
                    onChange={() => toggleTag(tag)}
                    sx={{ color: '#00b4d8', '&.Mui-checked': { color: '#00b4d8' } }}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>{TAG_ICONS[tag] || FALLBACK_ICON}</span>
                    <Typography variant="body2" sx={{ fontWeight: selectedTags.includes(tag) ? 700 : 400 }}>
                      {tag}
                    </Typography>
                  </Box>
                }
                sx={{ display: 'flex', mb: 0.5 }}
              />
            ))
          )}

          <TextField
            fullWidth placeholder="Search" size="small" sx={{ mt: 2 }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{ endAdornment: <SearchIcon sx={{ color: '#999', fontSize: 18 }} /> }}
          />

          {locating && (
            <Alert severity="info" icon={<MyLocationIcon fontSize="small" />} sx={{ mt: 2, fontSize: '0.72rem' }}>
              Getting your location...
            </Alert>
          )}
          {!locating && usedFallbackOrigin && (
            <Alert severity="warning" sx={{ mt: 2, fontSize: '0.72rem' }}>
              Location unavailable — showing distances from Centro.
            </Alert>
          )}
        </Paper>
      </Box>

      {/* CENTER: Map + overlay */}
      <Box sx={{ flex: 1, position: 'relative' }}>
        <MapComponent height="100%" markers={markers} center={mapCenter} zoom={mapZoom} />

        <Paper
          elevation={8}
          sx={{ position: 'absolute', top: 16, right: 16, width: 280, maxHeight: 'calc(100% - 32px)', overflow: 'auto', borderRadius: 3, zIndex: 1000 }}
        >
          <Box sx={{ p: 2, background: 'linear-gradient(135deg, #1a3a5c, #2d5a8c)', borderRadius: '12px 12px 0 0' }}>
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 800, fontSize: '1rem', textAlign: 'center' }}>
              EXPLORE NEARBY
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}><CircularProgress size={24} /></Box>
          ) : filtered.length === 0 ? (
            <Typography variant="body2" sx={{ p: 2, color: '#999', textAlign: 'center' }}>No places found.</Typography>
          ) : (
            filtered.map((place) => (
              <Box key={place.id} sx={{ borderBottom: '1px solid #f0f0f0' }}>
                <Box sx={{ display: 'flex', gap: 1.5, p: 1.5 }}>
                  <Box sx={{ width: 72, height: 60, borderRadius: 1.5, overflow: 'hidden', flexShrink: 0 }}>
                    <img
                      src={place.imageUrl || `https://placehold.co/600x400/00b4d8/FFFFFF?text=${encodeURIComponent(place.name)}`}
                      alt={place.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => handleImgError(e, place.name)}
                    />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#1a3a5c', lineHeight: 1.2, mb: 0.3 }}>
                      {place.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {place.description || 'No description available.'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                      {(place.tags || [])[0] && <Chip label={place.tags[0]} size="small" sx={{ fontSize: '0.6rem', height: 18 }} />}
                      <Chip label={formatDistance(place.distanceKm)} size="small" sx={{ fontSize: '0.6rem', height: 18, bgcolor: '#e3f4f8', color: '#1a3a5c', fontWeight: 700 }} />
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, px: 1.5, pb: 1.5 }}>
                  <Button size="small" variant="outlined" startIcon={<MapIcon />}
                    onClick={() => handleViewOnMap(place)}
                    sx={{ fontSize: '0.65rem', py: 0.3, color: '#00b4d8', borderColor: '#00b4d8' }}>
                    View on Map
                  </Button>
                  <Button size="small" variant="contained" startIcon={<AddCircleOutlineIcon />}
                    onClick={() => handleAddToTrip(place.id)}
                    sx={{ fontSize: '0.65rem', py: 0.3, background: '#00b4d8' }}>
                    Add to Trip
                  </Button>
                </Box>
              </Box>
            ))
          )}
        </Paper>

        <Box sx={{ position: 'absolute', top: 16, left: 16, zIndex: 500 }}>
          <Paper elevation={4} sx={{ px: 3, py: 1.5, borderRadius: 3, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)' }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1a3a5c' }}>
              Nearby Points of Interest
            </Typography>
          </Paper>
        </Box>
      </Box>

      {/* RIGHT: Sidebar list */}
      <Box sx={{ width: 320, flexShrink: 0, overflow: 'auto', borderLeft: '1px solid #e0e0e0', background: '#fff' }}>
        <Tabs value={0} sx={{ borderBottom: '1px solid #e0e0e0', minHeight: 48 }}>
          <Tab label="Nearby" sx={{ fontWeight: 600, fontSize: '0.82rem', minHeight: 48 }} />
        </Tabs>

        {error && <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>}

        {filtered.map((place) => (
          <Box key={place.id} sx={{ borderBottom: '1px solid #f5f5f5', display: 'flex', gap: 1.5, p: 1.5 }}>
            <Box sx={{ width: 80, height: 68, borderRadius: 1.5, overflow: 'hidden', flexShrink: 0 }}>
              <img
                src={place.imageUrl || `https://placehold.co/600x400/00b4d8/FFFFFF?text=${encodeURIComponent(place.name)}`}
                alt={place.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => handleImgError(e, place.name)}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#1a3a5c', mb: 0.3 }}>{place.name}</Typography>
              <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>
                {(place.description || 'No description available.').substring(0, 55)}...
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
                {(place.tags || [])[0] && <Chip label={place.tags[0]} size="small" sx={{ fontSize: '0.6rem', height: 18 }} />}
                <Chip label={formatDistance(place.distanceKm)} size="small" sx={{ fontSize: '0.6rem', height: 18, bgcolor: '#e3f4f8', color: '#1a3a5c' }} />
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Button size="small" onClick={() => handleViewOnMap(place)} sx={{ fontSize: '0.6rem', py: 0.2, px: 0.8, color: '#00b4d8', border: '1px solid #00b4d8', minWidth: 'auto' }}>View on Map</Button>
                <Button size="small" onClick={() => handleAddToTrip(place.id)} sx={{ fontSize: '0.6rem', py: 0.2, px: 0.8, color: '#fff', background: '#00b4d8', minWidth: 'auto', '&:hover': { background: '#0077b6' } }}>Add to Trip</Button>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}