import React, { useMemo } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import MapComponent from '../MapComponent';

const STOP_LETTER = (i) => String.fromCharCode(65 + (i % 26));

/**
 * Renders ordered stops as lettered markers connected by a line -- the
 * "Google Maps directions" look. Reused by both the standalone route
 * builder and each day of the plan builder.
 */
export default function RouteMapPreview({ stops, height = '100%' }) {
  const markers = useMemo(
    () => stops.map((s, i) => ({
      lat: s.lat,
      lng: s.lng,
      label: `${STOP_LETTER(i)} · ${s.name}`,
      icon: '📍',
      color: '#00b4d8',
    })),
    [stops]
  );

  const routes = useMemo(() => {
    if (stops.length < 2) return [];
    return [{ coordinates: stops.map((s) => [s.lat, s.lng]), color: '#00b4d8', weight: 4 }];
  }, [stops]);

  const center = stops.length > 0
    ? [stops[0].lat, stops[0].lng]
    : [20.6597, -103.3496]; // Guadalajara centro as a sane default

  if (stops.length === 0) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f0f4f8' }}>
        <Paper elevation={0} sx={{ p: 3, textAlign: 'center', bgcolor: 'transparent' }}>
          <Typography variant="h4" sx={{ mb: 1 }}>🗺️</Typography>
          <Typography variant="body2" sx={{ color: '#999' }}>
            Add stops to see them on the map
          </Typography>
        </Paper>
      </Box>
    );
  }

  return <MapComponent height={height} markers={markers} routes={routes} center={center} zoom={13} />;
}