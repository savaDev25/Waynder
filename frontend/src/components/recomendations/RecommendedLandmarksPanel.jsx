import React from 'react';
import { Box, Paper, Typography, Skeleton } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

/**
 * Placeholder for landmark recommendations ("similar to what you've already
 * added"). Built now with the real final layout on purpose -- once the
 * recommendation engine exists, only this component's internals change
 * (skeletons -> real cards), the surrounding pages won't need to shift.
 */
export default function RecommendedLandmarksPanel() {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, bgcolor: '#fafcff' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <AutoAwesomeIcon sx={{ color: '#00b4d8', fontSize: 18 }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1a3a5c' }}>
          Recommended for you
        </Typography>
      </Box>
      <Typography variant="caption" sx={{ color: '#999', display: 'block', mb: 1.5 }}>
        Personalized suggestions based on what you've added are coming soon.
      </Typography>
      {[1, 2, 3].map((i) => (
        <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
          <Skeleton variant="rounded" width={44} height={44} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="70%" />
            <Skeleton variant="text" width="45%" />
          </Box>
        </Box>
      ))}
    </Paper>
  );
}