import React from 'react';
import { Box, Paper, Typography, Skeleton } from '@mui/material';
import ExploreIcon from '@mui/icons-material/Explore';

/** Same placeholder pattern as RecommendedLandmarksPanel, for route suggestions. */
export default function RecommendedRoutesPanel() {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, bgcolor: '#fafcff' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <ExploreIcon sx={{ color: '#00b4d8', fontSize: 18 }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1a3a5c' }}>
          Suggested Routes
        </Typography>
      </Box>
      <Typography variant="caption" sx={{ color: '#999', display: 'block', mb: 1.5 }}>
        Once recommendations are live, we'll suggest ready-made routes connecting nearby places.
      </Typography>
      {[1, 2].map((i) => (
        <Skeleton key={i} variant="rounded" height={56} sx={{ mb: 1, borderRadius: 2 }} />
      ))}
    </Paper>
  );
}