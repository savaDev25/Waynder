import React, { useState, useEffect, useRef } from 'react';
import {
  Box, TextField, InputAdornment, List, ListItem, ListItemText,
  IconButton, Paper, Typography, CircularProgress, Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import { landmarkService } from '../../api';

const STOP_LETTER = (i) => String.fromCharCode(65 + (i % 26));

/**
 * Search + ordered stop list, Google-Maps-directions-style: lettered stops
 * (A, B, C...) draggable to reorder. `stops`/`onChange` are controlled by
 * the parent so this is reusable for a standalone route AND for a single
 * day inside a multi-day plan.
 */
export default function StopSelector({ stops, onChange, placeholder = 'Search for a place to add...' }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const dragIndex = useRef(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setSearching(true);
    const timeout = setTimeout(() => {
      landmarkService
        .search({ q: query.trim() })
        .then((r) => { if (!cancelled) setResults(r); })
        .catch(() => { if (!cancelled) setResults([]); })
        .finally(() => { if (!cancelled) setSearching(false); });
    }, 300); // debounce so we don't search on every keystroke
    return () => { cancelled = true; clearTimeout(timeout); };
  }, [query]);

  const addStop = (landmark) => {
    if (stops.some((s) => s.id === landmark.id)) return; // no duplicates
    onChange([...stops, landmark]);
    setQuery('');
    setResults([]);
  };

  const removeStop = (id) => {
    onChange(stops.filter((s) => s.id !== id));
  };

  const handleDrop = (dropIndex) => {
    if (dragIndex.current === null || dragIndex.current === dropIndex) return;
    const next = [...stops];
    const [moved] = next.splice(dragIndex.current, 1);
    next.splice(dropIndex, 0, moved);
    onChange(next);
    dragIndex.current = null;
  };

  return (
    <Box>
      <TextField
        fullWidth
        size="small"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        InputProps={{
          startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: '#999' }} /></InputAdornment>,
          endAdornment: searching ? <CircularProgress size={16} /> : null,
        }}
        sx={{ mb: results.length > 0 ? 1 : 2 }}
      />

      {results.length > 0 && (
        <Paper variant="outlined" sx={{ mb: 2, maxHeight: 220, overflow: 'auto', borderRadius: 2 }}>
          <List dense disablePadding>
            {results.map((r) => (
              <ListItem
                key={r.id}
                secondaryAction={
                  <IconButton size="small" onClick={() => addStop(r)}>
                    <AddIcon fontSize="small" sx={{ color: '#00b4d8' }} />
                  </IconButton>
                }
                sx={{ '&:hover': { bgcolor: '#f5f9fb' } }}
              >
                <ListItemText
                  primary={r.name}
                  secondary={r.address || (r.tags || []).join(', ') || null}
                  primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }}
                  secondaryTypographyProps={{ fontSize: '0.72rem' }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {stops.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, textAlign: 'center', bgcolor: '#fafcff' }}>
          <Typography variant="caption" sx={{ color: '#999' }}>
            No stops yet — search above to add your first place.
          </Typography>
        </Paper>
      ) : (
        <List dense disablePadding>
          {stops.map((stop, i) => (
            <ListItem
              key={stop.id}
              draggable
              onDragStart={() => { dragIndex.current = i; }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(i)}
              sx={{
                mb: 0.8, borderRadius: 2, border: '1px solid #eee', bgcolor: '#fff',
                cursor: 'grab', '&:hover': { borderColor: '#00b4d8' },
              }}
              secondaryAction={
                <IconButton size="small" onClick={() => removeStop(stop.id)}>
                  <CloseIcon fontSize="small" sx={{ color: '#999' }} />
                </IconButton>
              }
            >
              <DragIndicatorIcon sx={{ color: '#ccc', mr: 1, fontSize: 18 }} />
              <Chip
                label={STOP_LETTER(i)}
                size="small"
                sx={{ mr: 1, fontWeight: 800, bgcolor: '#1a3a5c', color: '#fff', height: 22, minWidth: 22 }}
              />
              <ListItemText
                primary={stop.name}
                secondary={stop.address}
                primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }}
                secondaryTypographyProps={{ fontSize: '0.72rem' }}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}