import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Skeleton, Chip } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PlaceIcon from '@mui/icons-material/Place';
import { recommendationService } from '../../api';

/**
 * Now backed by real Stage 1 recommendations (see backend RecommendationService)
 * once `basedOnIds` has at least one landmark in it. Falls back to the
 * original "coming soon" skeleton state when there's nothing selected yet --
 * same component either way, so callers (RouteBuilderPage, PlanBuilderPage)
 * don't need different UI for "before" vs "after" this went live.
 */
export default function RecommendedLandmarksPanel({ basedOnIds = [], onAdd }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (basedOnIds.length === 0) {
      setRecommendations([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    recommendationService
      .recommendLandmarks(basedOnIds, 4)
      .then((r) => { if (!cancelled) setRecommendations(r); })
      .catch(() => { if (!cancelled) setRecommendations([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [basedOnIds.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  const showPlaceholder = basedOnIds.length === 0;

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, bgcolor: '#fafcff' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <AutoAwesomeIcon sx={{ color: '#00b4d8', fontSize: 18 }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1a3a5c' }}>
          Recommended for you
        </Typography>
      </Box>

      {showPlaceholder ? (
        <>
          <Typography variant="caption" sx={{ color: '#999', display: 'block', mb: 1.5 }}>
            Add a place and we'll suggest what goes well with it.
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
        </>
      ) : loading ? (
        [1, 2].map((i) => <Skeleton key={i} variant="rounded" height={56} sx={{ mb: 1, borderRadius: 2 }} />)
      ) : recommendations.length === 0 ? (
        <Typography variant="caption" sx={{ color: '#999' }}>
          No complementary suggestions nearby yet.
        </Typography>
      ) : (
        recommendations.map((r) => (
          <Box
            key={r.id}
            onClick={() => onAdd?.(r)}
            sx={{
              display: 'flex', alignItems: 'center', gap: 1, p: 1, mb: 0.8, borderRadius: 2,
              border: '1px solid #eee', bgcolor: '#fff', cursor: onAdd ? 'pointer' : 'default',
              '&:hover': onAdd ? { borderColor: '#00b4d8' } : {},
            }}
          >
            <PlaceIcon sx={{ color: '#00b4d8', fontSize: 20, flexShrink: 0 }} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.82rem' }}>{r.name}</Typography>
              <Chip
                label={r.reason}
                size="small"
                sx={{ fontSize: '0.6rem', height: 16, bgcolor: '#e3f4f8', color: '#1a3a5c', mt: 0.3 }}
              />
            </Box>
          </Box>
        ))
      )}
    </Paper>
  );
}