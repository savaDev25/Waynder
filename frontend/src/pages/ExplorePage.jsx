import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Grid, Card, CardMedia, CardContent,
  CardActions, Button, Chip, TextField, InputAdornment,
  Select, MenuItem, FormControl, Slider, Divider,
  Paper, IconButton, Badge, Drawer,
  Pagination, ToggleButton, ToggleButtonGroup,
  Breadcrumbs, Link, Snackbar, CircularProgress, Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import TuneIcon from '@mui/icons-material/Tune';
import CloseIcon from '@mui/icons-material/Close';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import Navbar from '../components/Navbar';
import { landmarkService } from '../api/landmarkService';

// Small cosmetic map for known tag vocabulary (matches TAG_MAPPING in the
// OSM scraper connector). Unknown/future tags fall back to a generic icon --
// this list is allowed to be incomplete, it's decoration, not the source of
// truth for what categories exist (that's derived from real data below).
const TAG_ICONS = {
  museum: '🎨',
  attraction: '📍',
  art: '🖼️',
  viewpoint: '👀',
  nature: '🌳',
  historical: '🏛️',
};
const FALLBACK_TAG_ICON = '🏷️';

const SORT_OPTIONS = [
  { value: 'recommended', label: '⭐ Recommended' },
  { value: 'popularity', label: '🔥 Most Popular' },
  { value: 'name', label: '🔤 A–Z' },
];

const handleImgError = (e, name, color = '00b4d8') => {
  e.target.onerror = null;
  const cleanColor = color.replace('#', '');
  e.target.src = `https://placehold.co/600x400/${cleanColor}/FFFFFF?text=${encodeURIComponent(name)}`;
};

const ITEMS_PER_PAGE = 8;

// ─── Component ────────────────────────────────────────────────────────────

export default function ExplorePage() {
  const navigate = useNavigate();

  // Data
  const [landmarks, setLandmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all'); // 'all' or a tag name
  const [sortBy, setSortBy] = useState('recommended');
  const [popularityRange, setPopularityRange] = useState([0, 100]);
  const [onlyFeatured, setOnlyFeatured] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // UI
  const [viewMode, setViewMode] = useState('grid');
  const [favorites, setFavorites] = useState([]);
  const [page, setPage] = useState(1);
  const [snackbar, setSnackbar] = useState({ open: false, msg: '' });

  // ── Fetch real landmarks once on mount ────────────────────────────────
  // Everything below filters/sorts this client-side, same pattern as
  // before -- the dataset (one metro area) is small enough that this is
  // simpler than re-querying the backend per filter change.
  useEffect(() => {
    let cancelled = false;

    landmarkService
      .search()
      .then((results) => {
        if (!cancelled) setLandmarks(results);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load landmarks');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Real, present-in-the-database max, so the popularity slider's ceiling
  // means something instead of being an arbitrary guess.
  const maxPopularity = useMemo(
    () => Math.max(10, ...landmarks.map((l) => l.popularityScore || 0)),
    [landmarks]
  );

  // Categories are whatever tags actually exist in the fetched data --
  // NOT a fixed list, since the real tag vocabulary depends on what the
  // scraper/connectors have ingested so far and will grow over time.
  const categories = useMemo(() => {
    const tagSet = new Set();
    landmarks.forEach((l) => (l.tags || []).forEach((t) => tagSet.add(t)));
    return ['all', ...Array.from(tagSet).sort()];
  }, [landmarks]);

  const toggleFav = (id) => {
    setFavorites((p) => (p.includes(id) ? p.filter((f) => f !== id) : [...p, id]));
  };

  // ── Filtered + sorted results ──────────────────────────────────────────
  const results = useMemo(() => {
    let list = landmarks.filter((l) => {
      if (category !== 'all' && !(l.tags || []).includes(category)) return false;
      const haystack = `${l.name} ${l.description || ''} ${(l.tags || []).join(' ')}`.toLowerCase();
      if (search && !haystack.includes(search.toLowerCase())) return false;
      const pop = l.popularityScore || 0;
      if (pop < popularityRange[0] || pop > popularityRange[1]) return false;
      if (onlyFeatured && pop === 0) return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return (b.popularityScore || 0) - (a.popularityScore || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          // "Recommended": featured (has any popularity) first, then by popularity
          return (b.popularityScore || 0) - (a.popularityScore || 0);
      }
    });

    return list;
  }, [landmarks, search, category, sortBy, popularityRange, onlyFeatured]);

  const totalPages = Math.ceil(results.length / ITEMS_PER_PAGE);
  const paged = results.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const activeFilterCount = [
    category !== 'all',
    onlyFeatured,
    popularityRange[0] > 0 || popularityRange[1] < maxPopularity,
  ].filter(Boolean).length;

  const resetFilters = () => {
    setCategory('all');
    setSortBy('recommended');
    setPopularityRange([0, maxPopularity]);
    setOnlyFeatured(false);
    setSearch('');
    setPage(1);
  };

  // ── Sidebar filters panel (shared between desktop & mobile drawer) ─────
  const FiltersPanel = () => (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1a3a5c', display: 'flex', alignItems: 'center', gap: 1 }}>
          <TuneIcon fontSize="small" /> Filters
        </Typography>
        {activeFilterCount > 0 && (
          <Button size="small" onClick={resetFilters} sx={{ fontSize: '0.72rem', color: '#e74c3c', p: 0 }}>
            Clear all ({activeFilterCount})
          </Button>
        )}
      </Box>

      {/* Featured -- genuinely backed by popularityScore, not invented */}
      <Box
        onClick={() => { setOnlyFeatured((v) => !v); setPage(1); }}
        sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          p: 1, borderRadius: 2, cursor: 'pointer', mb: 2,
          bgcolor: onlyFeatured ? '#e3f4f8' : '#f8fafc',
          border: `1px solid ${onlyFeatured ? '#00b4d8' : '#eee'}`,
          '&:hover': { bgcolor: '#e3f4f8' },
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: onlyFeatured ? 700 : 400, fontSize: '0.82rem' }}>
          🔥 Popular spots only
        </Typography>
        <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: onlyFeatured ? '#00b4d8' : '#ccc' }} />
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#1a3a5c' }}>
        🔥 Popularity Score
      </Typography>
      <Box sx={{ px: 1 }}>
        <Slider
          value={popularityRange}
          onChange={(_, v) => { setPopularityRange(v); setPage(1); }}
          min={0} max={maxPopularity} step={1}
          valueLabelDisplay="auto"
          sx={{ color: '#00b4d8' }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption" sx={{ color: '#666' }}>{popularityRange[0]}</Typography>
          <Typography variant="caption" sx={{ color: '#666' }}>{popularityRange[1]}+</Typography>
        </Box>
      </Box>

      {/*
        Removed vs. the original mock version: price range, neighborhood
        select, transport chips, open-now / free / accessible toggles.
        None of these have a matching field on the Landmark entity yet --
        add them to the schema + DTOs first (see LandmarkResponseDTO),
        then reintroduce the corresponding filter here.
      */}
    </Box>
  );

  // ── Place card ───────────────────────────────────────────────────────
  const PlaceCard = ({ place, list = false }) => {
    const isFav = favorites.includes(place.id);
    const isFeatured = (place.popularityScore || 0) > 0;

    return (
      <Card
        sx={{
          display: 'flex',
          flexDirection: list ? 'row' : 'column',
          height: list ? 'auto' : '100%',
          cursor: 'pointer',
          position: 'relative',
          transition: 'all 0.2s ease',
          '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 12px 32px rgba(26,58,92,0.18)' },
        }}
      >
        <Box sx={{ position: 'relative', flexShrink: 0, width: list ? 180 : '100%', height: list ? '100%' : 190 }}>
          <CardMedia
            component="img"
            image={place.imageUrl || `https://placehold.co/600x400/00b4d8/FFFFFF?text=${encodeURIComponent(place.name)}`}
            alt={place.name}
            sx={{ width: '100%', height: list ? 140 : 190, objectFit: 'cover' }}
            onError={(e) => handleImgError(e, place.name)}
          />

          <Box sx={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {isFeatured && (
              <Chip
                icon={<LocalFireDepartmentIcon sx={{ fontSize: '13px !important', color: '#fff !important' }} />}
                label="Popular"
                size="small"
                sx={{ bgcolor: '#f39c12', color: '#fff', fontWeight: 700, fontSize: '0.62rem', height: 20 }}
              />
            )}
          </Box>

          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); toggleFav(place.id); }}
            sx={{ position: 'absolute', top: 6, right: 6, bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: '#fff' }, p: 0.5 }}
          >
            {isFav
              ? <FavoriteIcon sx={{ color: '#e74c3c', fontSize: 18 }} />
              : <FavoriteBorderIcon sx={{ color: '#666', fontSize: 18 }} />}
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <CardContent sx={{ p: 1.8, pb: '8px !important', flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.8, flexWrap: 'wrap' }}>
              {(place.tags || []).length === 0 && (
                <Chip label="Uncategorized" size="small" sx={{ fontSize: '0.6rem', height: 18, bgcolor: '#e8edf2', color: '#1a3a5c' }} />
              )}
              {(place.tags || []).map((tag) => (
                <Chip
                  key={tag}
                  label={`${TAG_ICONS[tag] || FALLBACK_TAG_ICON} ${tag}`}
                  size="small"
                  sx={{ fontSize: '0.6rem', height: 18, bgcolor: '#e8edf2', color: '#1a3a5c', fontWeight: 600 }}
                />
              ))}
            </Box>

            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1a3a5c', fontSize: '0.95rem', lineHeight: 1.2, mb: 0.5 }}>
              {place.name}
            </Typography>

            <Typography
              variant="body2"
              sx={{ color: '#555', fontSize: '0.78rem', lineHeight: 1.4, mb: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
            >
              {place.description || 'No description available yet.'}
            </Typography>

            {place.address && (
              <Typography variant="caption" sx={{ color: '#999', display: 'flex', alignItems: 'center', gap: 0.3, mb: 1 }}>
                <LocationOnIcon sx={{ fontSize: 12 }} /> {place.address}
              </Typography>
            )}

            {isFeatured && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                <LocalFireDepartmentIcon sx={{ color: '#f39c12', fontSize: 14 }} />
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#444' }}>
                  {place.popularityScore} popularity
                </Typography>
              </Box>
            )}
          </CardContent>

          <CardActions sx={{ px: 1.8, pb: 1.5, pt: 0, gap: 0.8 }}>
            <Button
              size="small" variant="contained" fullWidth
              onClick={() => navigate(`/plan?place=${place.id}`)}
              sx={{ background: 'linear-gradient(135deg,#1a3a5c,#2d5a8c)', fontWeight: 700, fontSize: '0.75rem', py: 0.7 }}
            >
              Add to Trip
            </Button>
            <Button
              size="small" variant="outlined" fullWidth
              onClick={() => navigate(`/nearby?id=${place.id}`)}
              sx={{ fontWeight: 600, fontSize: '0.75rem', py: 0.7, borderColor: '#00b4d8', color: '#00b4d8' }}
            >
              View on Map
            </Button>
          </CardActions>
        </Box>
      </Card>
    );
  };

  // ── Render ──────────────────────────────────────────────────────────
  return (
    <Box sx={{ mt: '60px', minHeight: 'calc(100vh - 60px)', bgcolor: '#f5f7fa' }}>
      <Navbar />

      <Box sx={{ background: 'linear-gradient(135deg,#0d1f33 0%,#1a3a5c 60%,#00688b 100%)', py: { xs: 3, md: 5 }, px: 2 }}>
        <Container maxWidth="xl">
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 1.5 }}>
            <Link underline="hover" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', cursor: 'pointer' }} onClick={() => navigate('/')}>Home</Link>
            <Typography sx={{ color: '#00b4d8', fontSize: '0.8rem', fontWeight: 700 }}>Explore</Typography>
          </Breadcrumbs>

          <Typography variant="h3" sx={{ color: '#fff', fontWeight: 900, mb: 0.5, fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
            🌵 Explore Guadalajara
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.75)', fontWeight: 400, mb: 3, fontSize: '1rem' }}>
            {loading ? 'Cargando lugares...' : `Descubre ${landmarks.length} puntos de interés en la ZMG`}
          </Typography>

          <Box sx={{ maxWidth: 600, display: 'flex', gap: 1 }}>
            <TextField
              fullWidth placeholder="Busca museos, parques, lugares..."
              value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              size="small"
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'rgba(255,255,255,0.7)' }} /></InputAdornment>,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'rgba(255,255,255,0.12)', borderRadius: 2, color: '#fff', fontSize: '0.9rem',
                  '&:hover fieldset': { borderColor: '#00b4d8' },
                  '&.Mui-focused fieldset': { borderColor: '#00b4d8' },
                },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.25)' },
                '& input::placeholder': { color: 'rgba(255,255,255,0.5)' },
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 1, mt: 2.5, flexWrap: 'wrap' }}>
            {categories.map((cat) => {
              const active = category === cat;
              const label = cat === 'all' ? 'All' : `${TAG_ICONS[cat] || FALLBACK_TAG_ICON} ${cat}`;
              return (
                <Chip
                  key={cat}
                  label={label}
                  onClick={() => { setCategory(cat); setPage(1); }}
                  sx={{
                    fontWeight: active ? 800 : 500,
                    bgcolor: active ? '#00b4d8' : 'rgba(255,255,255,0.12)',
                    color: active ? '#fff' : 'rgba(255,255,255,0.85)',
                    border: active ? '2px solid #00b4d8' : '2px solid transparent',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: active ? '#0077b6' : 'rgba(255,255,255,0.2)' },
                  }}
                />
              );
            })}
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
          <Paper
            elevation={2}
            sx={{
              width: 250, flexShrink: 0, borderRadius: 3,
              display: { xs: 'none', md: 'block' },
              position: 'sticky', top: 76, maxHeight: 'calc(100vh - 100px)', overflow: 'auto',
            }}
          >
            <FiltersPanel />
          </Paper>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                Couldn't load landmarks: {error}
              </Alert>
            )}

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress sx={{ color: '#00b4d8' }} />
              </Box>
            ) : (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
                  <Typography variant="body2" sx={{ color: '#666', fontWeight: 500, flex: 1 }}>
                    <strong style={{ color: '#1a3a5c' }}>{results.length}</strong> places found
                    {search && <span> for "<strong>{search}</strong>"</span>}
                  </Typography>

                  <Badge badgeContent={activeFilterCount || null} color="primary" sx={{ display: { md: 'none' } }}>
                    <Button
                      size="small" startIcon={<FilterListIcon />} variant="outlined"
                      onClick={() => setMobileFiltersOpen(true)}
                      sx={{ fontWeight: 600, borderRadius: 2, fontSize: '0.8rem' }}
                    >
                      Filters
                    </Button>
                  </Badge>

                  <FormControl size="small" sx={{ minWidth: 190 }}>
                    <Select
                      value={sortBy}
                      onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                      sx={{ borderRadius: 2, fontSize: '0.82rem', bgcolor: '#fff' }}
                    >
                      {SORT_OPTIONS.map((o) => (
                        <MenuItem key={o.value} value={o.value} sx={{ fontSize: '0.82rem' }}>{o.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <ToggleButtonGroup
                    value={viewMode} exclusive
                    onChange={(_, v) => { if (v) setViewMode(v); }}
                    size="small" sx={{ bgcolor: '#fff' }}
                  >
                    <ToggleButton value="grid" sx={{ px: 1.2 }}><GridViewIcon fontSize="small" /></ToggleButton>
                    <ToggleButton value="list" sx={{ px: 1.2 }}><ViewListIcon fontSize="small" /></ToggleButton>
                  </ToggleButtonGroup>
                </Box>

                {activeFilterCount > 0 && (
                  <Box sx={{ display: 'flex', gap: 0.8, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#666' }}>Active:</Typography>
                    {category !== 'all' && (
                      <Chip label={category} size="small" onDelete={() => setCategory('all')}
                        sx={{ bgcolor: '#00b4d8', color: '#fff', fontWeight: 700, fontSize: '0.65rem', height: 22 }} />
                    )}
                    {onlyFeatured && (
                      <Chip label="Popular" size="small" onDelete={() => setOnlyFeatured(false)}
                        sx={{ bgcolor: '#f39c12', color: '#fff', fontSize: '0.65rem', height: 22 }} />
                    )}
                  </Box>
                )}

                {paged.length === 0 ? (
                  <Paper elevation={1} sx={{ p: 6, borderRadius: 3, textAlign: 'center' }}>
                    <Typography variant="h2" sx={{ mb: 1 }}>🔍</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a3a5c', mb: 0.5 }}>No places found</Typography>
                    <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>Try adjusting your filters or search query.</Typography>
                    <Button variant="outlined" onClick={resetFilters}>Clear Filters</Button>
                  </Paper>
                ) : viewMode === 'grid' ? (
                  <Grid container spacing={2}>
                    {paged.map((place) => (
                      <Grid item xs={12} sm={6} lg={4} xl={3} key={place.id}>
                        <PlaceCard place={place} />
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {paged.map((place) => (
                      <PlaceCard key={place.id} place={place} list />
                    ))}
                  </Box>
                )}

                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                      count={totalPages} page={page}
                      onChange={(_, v) => { setPage(v); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      color="primary" shape="rounded" size="large"
                      sx={{ '& .MuiPaginationItem-root': { fontWeight: 600, borderRadius: 2 } }}
                    />
                  </Box>
                )}

                {favorites.length > 0 && (
                  <Paper elevation={3} sx={{ mt: 4, p: 2.5, borderRadius: 3, background: 'linear-gradient(135deg,#1a3a5c,#2d5a8c)', color: '#fff', display: 'flex', alignItems: 'center', gap: 2 }}>
                    <FavoriteIcon sx={{ color: '#e74c3c', fontSize: 28 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {favorites.length} place{favorites.length > 1 ? 's' : ''} saved to favorites
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        Add them all to a single trip
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      onClick={() => navigate('/plan')}
                      sx={{ bgcolor: '#00b4d8', '&:hover': { bgcolor: '#0077b6' }, fontWeight: 700 }}
                    >
                      Plan Trip
                    </Button>
                  </Paper>
                )}
              </>
            )}
          </Box>
        </Box>
      </Container>

      <Drawer
        anchor="left" open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        PaperProps={{ sx: { width: 280, borderRadius: '0 16px 16px 0' } }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
          <IconButton onClick={() => setMobileFiltersOpen(false)}><CloseIcon /></IconButton>
        </Box>
        <FiltersPanel />
      </Drawer>

      <Snackbar
        open={snackbar.open} autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.msg}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}