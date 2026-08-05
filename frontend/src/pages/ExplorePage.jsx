import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Grid, Card, CardMedia, CardContent,
  CardActions, Button, Chip, Rating, TextField, InputAdornment,
  Select, MenuItem, FormControl, InputLabel, Slider, Divider,
  Paper, IconButton, Tooltip, Badge, Drawer, useMediaQuery,
  Pagination, ToggleButton, ToggleButtonGroup, Collapse,
  Breadcrumbs, Link, Snackbar,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShareIcon from '@mui/icons-material/Share';
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StarIcon from '@mui/icons-material/Star';
import TuneIcon from '@mui/icons-material/Tune';
import CloseIcon from '@mui/icons-material/Close';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import Navbar from '../components/Navbar';


const CATEGORIES = [
  { id: 'all',       label: 'All',                 icon: '🗺️' },
  { id: 'cultural',  label: 'Cultural Sites',       icon: '🏛️' },
  { id: 'museum',    label: 'Museums',              icon: '🎨' },
  { id: 'park',      label: 'Parks & Nature',       icon: '🌳' },
  { id: 'dining',    label: 'Dining',               icon: '🍽️' },
  { id: 'tequila',   label: 'Tequila & Spirits',    icon: '🥃' },
  { id: 'boutique',  label: 'Boutique & Shopping',  icon: '🛍️' },
  { id: 'landmark',  label: 'Historic Landmarks',   icon: '🏰' },
  { id: 'nightlife', label: 'Nightlife',             icon: '🎶' },
];

const TRANSPORT = ['Bus', 'BRT', 'Walking', 'Bike', 'Train'];

const PLACES = [
  {
    id: 1,
    name: 'Hospicio Cabañas',
    category: 'museum',
    tags: ['UNESCO', 'Art', 'Murals'],
    rating: 4.9, reviews: 1842,
    price: '$80 MXN', priceNum: 80,
    duration: '2h',
    transport: ['Bus', 'Walking'],
    neighborhood: 'Centro Histórico',
    description: 'Declarado Patrimonio de la Humanidad por la UNESCO, alberga los impresionantes murales de José Clemente Orozco en su cúpula.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Hospicio_Caba%C3%B1as%2C_Guadalajara.jpg/640px-Hospicio_Caba%C3%B1as%2C_Guadalajara.jpg',
    featured: true,
    accessible: true,
    openNow: true,
    hours: 'Tue–Sun 10:00–18:00',
  },
  {
    id: 2,
    name: 'Catedral de Guadalajara',
    category: 'landmark',
    tags: ['Architecture', 'History', 'Religion'],
    rating: 4.9, reviews: 3201,
    price: 'Free', priceNum: 0,
    duration: '1h',
    transport: ['Bus', 'BRT', 'Walking'],
    neighborhood: 'Centro Histórico',
    description: 'Icónica catedral neogótica con torres gemelas que domina el skyline de Guadalajara desde el siglo XVI.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Catedral_de_Guadalajara%2C_Mexico%2C_2013-10-11%2C_DD_01.JPG/640px-Catedral_de_Guadalajara%2C_Mexico%2C_2013-10-11%2C_DD_01.JPG',
    featured: true,
    accessible: true,
    openNow: true,
    hours: 'Daily 08:00–20:00',
  },
  {
    id: 3,
    name: 'Mercado San Juan de Dios',
    category: 'boutique',
    tags: ['Market', 'Food', 'Shopping'],
    rating: 4.6, reviews: 2105,
    price: 'Free', priceNum: 0,
    duration: '2h',
    transport: ['Bus', 'Walking'],
    neighborhood: 'Centro Histórico',
    description: 'El mercado cubierto más grande de América Latina. Artesanías, ropa, electrónicos y una increíble zona gastronómica.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Tlaquepaque_market.jpg/640px-Tlaquepaque_market.jpg',
    featured: false,
    accessible: true,
    openNow: true,
    hours: 'Daily 09:00–20:00',
  },
  {
    id: 4,
    name: 'Bosque Colomos',
    category: 'park',
    tags: ['Nature', 'Walking', 'Jogging'],
    rating: 4.7, reviews: 987,
    price: 'Free', priceNum: 0,
    duration: '2–3h',
    transport: ['Bus', 'Bike'],
    neighborhood: 'Providencia',
    description: 'Pulmón verde de Guadalajara con jardines japoneses, vivero y extensas áreas para caminar y hacer deporte.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Bosque_La_Primavera.jpg/640px-Bosque_La_Primavera.jpg',
    featured: false,
    accessible: true,
    openNow: true,
    hours: 'Daily 06:00–20:00',
  },
  {
    id: 5,
    name: 'El Parián de Tlaquepaque',
    category: 'cultural',
    tags: ['Artisans', 'Crafts', 'Culture'],
    rating: 4.8, reviews: 1563,
    price: 'Free', priceNum: 0,
    duration: '3h',
    transport: ['Bus', 'Bike'],
    neighborhood: 'Tlaquepaque',
    description: 'Centro artesanal con talleres de cerámica talavera, vidrio soplado y muebles coloniales. El corazón cultural de Tlaquepaque.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Tlaquepaque_market.jpg/640px-Tlaquepaque_market.jpg',
    featured: true,
    accessible: false,
    openNow: true,
    hours: 'Daily 10:00–19:00',
  },
  {
    id: 6,
    name: 'Birriería Las Nueve Esquinas',
    category: 'dining',
    tags: ['Traditional', 'Birria', 'Local Food'],
    rating: 4.8, reviews: 2840,
    price: '$150–300 MXN', priceNum: 150,
    duration: '1h',
    transport: ['Bus', 'Walking'],
    neighborhood: 'Mexicaltzingo',
    description: 'Restaurante icónico en el barrio histórico de las Nueve Esquinas. La birria más famosa de Guadalajara desde 1945.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Birria_de_res.jpg/640px-Birria_de_res.jpg',
    featured: false,
    accessible: true,
    openNow: true,
    hours: 'Daily 08:00–17:00',
  },
  {
    id: 7,
    name: 'Destilería José Cuervo',
    category: 'tequila',
    tags: ['Tequila', 'Tour', 'History'],
    rating: 4.7, reviews: 4120,
    price: '$580 MXN', priceNum: 580,
    duration: '6h',
    transport: ['Train', 'Bus'],
    neighborhood: 'Tequila, Jalisco',
    description: 'Tour completo a la destilería más famosa del mundo. Visita campos de agave, proceso de destilación y degustación premium.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Jimadores.jpg/640px-Jimadores.jpg',
    featured: true,
    accessible: false,
    openNow: false,
    hours: 'Mon–Sat 09:00–16:00',
  },
  {
    id: 8,
    name: 'Lago de Chapala',
    category: 'park',
    tags: ['Lake', 'Nature', 'Scenic'],
    rating: 4.7, reviews: 2310,
    price: '$80 MXN', priceNum: 80,
    duration: '4h',
    transport: ['Bus'],
    neighborhood: 'Chapala',
    description: 'El lago más grande de México. Paseo en lancha, malecón pintoresco, gastronomía lacustre y artesanías.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Lago_de_Chapala.JPG/640px-Lago_de_Chapala.JPG',
    featured: false,
    accessible: true,
    openNow: true,
    hours: 'Daily (outdoor)',
  },
  {
    id: 9,
    name: 'Zoológico Guadalajara',
    category: 'park',
    tags: ['Animals', 'Family', 'Kids'],
    rating: 4.5, reviews: 5621,
    price: '$250 MXN', priceNum: 250,
    duration: '3–4h',
    transport: ['Bus', 'BRT'],
    neighborhood: 'Huentitán',
    description: 'Uno de los zoológicos más grandes de México con más de 2,500 animales de 360 especies distintas.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Bosque_La_Primavera.jpg/640px-Bosque_La_Primavera.jpg',
    featured: false,
    accessible: true,
    openNow: true,
    hours: 'Tue–Sun 10:00–17:00',
  },
  {
    id: 10,
    name: 'Instituto Cultural Cabañas',
    category: 'cultural',
    tags: ['Culture', 'Events', 'Art'],
    rating: 4.8, reviews: 1120,
    price: '$100 MXN', priceNum: 100,
    duration: '2h',
    transport: ['Bus', 'Walking'],
    neighborhood: 'Centro Histórico',
    description: 'Complejo cultural que alberga exposiciones temporales, danza, teatro y conciertos en un entorno histórico incomparable.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Hospicio_Caba%C3%B1as%2C_Guadalajara.jpg/640px-Hospicio_Caba%C3%B1as%2C_Guadalajara.jpg',
    featured: false,
    accessible: true,
    openNow: false,
    hours: 'Tue–Sun 10:00–18:00',
  },
  {
    id: 11,
    name: 'Avenida Chapultepec',
    category: 'nightlife',
    tags: ['Bars', 'Restaurants', 'Nightlife'],
    rating: 4.6, reviews: 3400,
    price: 'Varies', priceNum: 0,
    duration: '2–4h',
    transport: ['Bus', 'Walking', 'Bike'],
    neighborhood: 'Americana',
    description: 'El corredor más vibrante de Guadalajara con decenas de bares, restaurantes gourmet y terraza para disfrutar el ambiente tapatío.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Catedral_de_Guadalajara%2C_Mexico%2C_2013-10-11%2C_DD_01.JPG/640px-Catedral_de_Guadalajara%2C_Mexico%2C_2013-10-11%2C_DD_01.JPG',
    featured: false,
    accessible: true,
    openNow: true,
    hours: 'Daily 12:00–02:00',
  },
  {
    id: 12,
    name: 'Museo Regional de Guadalajara',
    category: 'museum',
    tags: ['History', 'Pre-Hispanic', 'Colonial'],
    rating: 4.6, reviews: 890,
    price: '$85 MXN', priceNum: 85,
    duration: '2h',
    transport: ['Bus', 'Walking'],
    neighborhood: 'Centro Histórico',
    description: 'Instalado en el ex-Seminario de San José, conserva piezas arqueológicas y etnográficas del estado de Jalisco.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Hospicio_Caba%C3%B1as%2C_Guadalajara.jpg/640px-Hospicio_Caba%C3%B1as%2C_Guadalajara.jpg',
    featured: false,
    accessible: true,
    openNow: false,
    hours: 'Tue–Sat 09:00–17:00',
  },
];

const SORT_OPTIONS = [
  { value: 'recommended', label: '⭐ Recommended' },
  { value: 'rating',      label: '🌟 Best Rated' },
  { value: 'reviews',     label: '💬 Most Reviewed' },
  { value: 'price_asc',   label: '💰 Price: Low to High' },
  { value: 'price_desc',  label: '💸 Price: High to Low' },
  { value: 'name',        label: '🔤 A–Z' },
];

const handleImgError = (e, name, color = '00b4d8') => {
  e.target.onerror = null; 
  const cleanColor = color.replace('#', '');
  e.target.src = `https://placehold.co/600x400/${cleanColor}/FFFFFF?text=${encodeURIComponent(name)}`;
};

const NEIGHBORHOODS = ['All Areas', 'Centro Histórico', 'Tlaquepaque', 'Providencia', 'Americana', 'Chapala', 'Tequila, Jalisco', 'Huentitán', 'Mexicaltzingo'];

const ITEMS_PER_PAGE = 8;

// ─── Component ────────────────────────────────────────────────────────────────

export default function ExplorePage() {
  const navigate = useNavigate();

  // Filters
  const [search, setSearch]               = useState('');
  const [category, setCategory]           = useState('all');
  const [sortBy, setSortBy]               = useState('recommended');
  const [priceRange, setPriceRange]       = useState([0, 600]);
  const [selectedTransport, setTransport] = useState([]);
  const [neighborhood, setNeighborhood]   = useState('All Areas');
  const [onlyFeatured, setOnlyFeatured]   = useState(false);
  const [onlyOpen, setOnlyOpen]           = useState(false);
  const [onlyFree, setOnlyFree]           = useState(false);
  const [onlyAccessible, setAccessible]   = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // UI
  const [viewMode, setViewMode]   = useState('grid');
  const [favorites, setFavorites] = useState([]);
  const [page, setPage]           = useState(1);
  const [snackbar, setSnackbar]   = useState({ open: false, msg: '' });

  const toggleFav = (id) => {
    setFavorites((p) => p.includes(id) ? p.filter((f) => f !== id) : [...p, id]);
  };

  // ── Filtered + sorted results ──────────────────────────────────────────────
  const results = useMemo(() => {
    let list = PLACES.filter((p) => {
      if (category !== 'all' && p.category !== category) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) &&
          !p.description.toLowerCase().includes(search.toLowerCase()) &&
          !p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))) return false;
      if (p.priceNum < priceRange[0] || p.priceNum > priceRange[1]) return false;
      if (selectedTransport.length && !selectedTransport.some((t) => p.transport.includes(t))) return false;
      if (neighborhood !== 'All Areas' && p.neighborhood !== neighborhood) return false;
      if (onlyFeatured && !p.featured) return false;
      if (onlyOpen && !p.openNow) return false;
      if (onlyFree && p.priceNum !== 0) return false;
      if (onlyAccessible && !p.accessible) return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      switch (sortBy) {
        case 'rating':     return b.rating - a.rating;
        case 'reviews':    return b.reviews - a.reviews;
        case 'price_asc':  return a.priceNum - b.priceNum;
        case 'price_desc': return b.priceNum - a.priceNum;
        case 'name':       return a.name.localeCompare(b.name);
        default:           return (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.rating - a.rating;
      }
    });

    return list;
  }, [search, category, sortBy, priceRange, selectedTransport, neighborhood, onlyFeatured, onlyOpen, onlyFree, onlyAccessible]);

  const totalPages  = Math.ceil(results.length / ITEMS_PER_PAGE);
  const paged       = results.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const activeFilterCount = [
    category !== 'all', selectedTransport.length > 0, neighborhood !== 'All Areas',
    onlyFeatured, onlyOpen, onlyFree, onlyAccessible,
    priceRange[0] > 0 || priceRange[1] < 600,
  ].filter(Boolean).length;

  const resetFilters = () => {
    setCategory('all'); setSortBy('recommended'); setPriceRange([0, 600]);
    setTransport([]); setNeighborhood('All Areas');
    setOnlyFeatured(false); setOnlyOpen(false); setOnlyFree(false); setAccessible(false);
    setSearch(''); setPage(1);
  };

  // ── Sidebar filters panel (shared between desktop & mobile drawer) ─────────
  const FiltersPanel = () => (
    <Box sx={{ p: 2 }}>
      {/* Header */}
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

      {/* Open now + Free + Featured + Accessible */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 2 }}>
        {[
          { label: '🟢 Open Now',    val: onlyOpen,       set: (v) => { setOnlyOpen(v); setPage(1); } },
          { label: '🆓 Free Entry',  val: onlyFree,       set: (v) => { setOnlyFree(v); setPage(1); } },
          { label: '⭐ Featured',    val: onlyFeatured,   set: (v) => { setOnlyFeatured(v); setPage(1); } },
          { label: '♿ Accessible',  val: onlyAccessible, set: (v) => { setAccessible(v); setPage(1); } },
        ].map((f) => (
          <Box key={f.label}
            onClick={() => f.set(!f.val)}
            sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              p: 1, borderRadius: 2, cursor: 'pointer',
              bgcolor: f.val ? '#e3f4f8' : '#f8fafc',
              border: `1px solid ${f.val ? '#00b4d8' : '#eee'}`,
              transition: 'all 0.15s',
              '&:hover': { bgcolor: '#e3f4f8' },
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: f.val ? 700 : 400, fontSize: '0.82rem' }}>{f.label}</Typography>
            <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: f.val ? '#00b4d8' : '#ccc' }} />
          </Box>
        ))}
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Price range */}
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#1a3a5c' }}>
        💰 Price Range (MXN)
      </Typography>
      <Box sx={{ px: 1 }}>
        <Slider
          value={priceRange}
          onChange={(_, v) => { setPriceRange(v); setPage(1); }}
          min={0} max={600} step={10}
          valueLabelDisplay="auto"
          valueLabelFormat={(v) => v === 0 ? 'Free' : `$${v}`}
          sx={{ color: '#00b4d8' }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption" sx={{ color: '#666' }}>{priceRange[0] === 0 ? 'Free' : `$${priceRange[0]}`}</Typography>
          <Typography variant="caption" sx={{ color: '#666' }}>${priceRange[1]}+</Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Neighborhood */}
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#1a3a5c' }}>
        📍 Area / Neighborhood
      </Typography>
      <FormControl fullWidth size="small">
        <Select
          value={neighborhood}
          onChange={(e) => { setNeighborhood(e.target.value); setPage(1); }}
          sx={{ borderRadius: 2, fontSize: '0.82rem' }}
        >
          {NEIGHBORHOODS.map((n) => (
            <MenuItem key={n} value={n} sx={{ fontSize: '0.82rem' }}>{n}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <Divider sx={{ my: 2 }} />

      {/* Transport */}
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#1a3a5c' }}>
        🚌 How to Get There
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
        {TRANSPORT.map((t) => {
          const active = selectedTransport.includes(t);
          return (
            <Chip
              key={t} label={t} size="small"
              onClick={() => {
                setTransport((p) => active ? p.filter((x) => x !== t) : [...p, t]);
                setPage(1);
              }}
              sx={{
                fontWeight: active ? 700 : 400,
                bgcolor: active ? '#1a3a5c' : '#f0f4f8',
                color: active ? '#fff' : '#444',
                cursor: 'pointer',
                '&:hover': { bgcolor: active ? '#0d1f33' : '#e0e8f0' },
              }}
            />
          );
        })}
      </Box>
    </Box>
  );

  // ── Place card ─────────────────────────────────────────────────────────────
  const PlaceCard = ({ place, list = false }) => {
    const isFav = favorites.includes(place.id);

    return (
      <Card
        sx={{
          display: list ? 'flex' : 'flex',
          flexDirection: list ? 'row' : 'column',
          height: list ? 'auto' : '100%',
          cursor: 'pointer',
          position: 'relative',
          transition: 'all 0.2s ease',
          '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 12px 32px rgba(26,58,92,0.18)' },
        }}
      >
        {/* Image */}
        <Box sx={{ position: 'relative', flexShrink: 0, width: list ? 180 : '100%', height: list ? '100%' : 190 }}>
          <CardMedia
            component="img"
            image={place.image}
            alt={place.name}
            sx={{ width: '100%', height: list ? 140 : 190, objectFit: 'cover' }}
            onError={(e) => handleImgError(e, place.name)}
          />

          {/* Overlays */}
          <Box sx={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {place.featured && (
              <Chip label="⭐ Featured" size="small" sx={{ bgcolor: '#f39c12', color: '#fff', fontWeight: 700, fontSize: '0.62rem', height: 20 }} />
            )}
            {place.openNow
              ? <Chip label="Open" size="small" sx={{ bgcolor: '#2ecc71', color: '#fff', fontWeight: 700, fontSize: '0.62rem', height: 20 }} />
              : <Chip label="Closed" size="small" sx={{ bgcolor: '#e74c3c', color: '#fff', fontWeight: 700, fontSize: '0.62rem', height: 20 }} />
            }
          </Box>

          {/* Fav button */}
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

        {/* Content */}
        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <CardContent sx={{ p: 1.8, pb: '8px !important', flex: 1 }}>

            {/* Category chip + neighborhood */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
              <Chip
                label={CATEGORIES.find((c) => c.id === place.category)?.label || place.category}
                size="small"
                sx={{ fontSize: '0.6rem', height: 18, bgcolor: '#e8edf2', color: '#1a3a5c', fontWeight: 600 }}
              />
              <Typography variant="caption" sx={{ color: '#999', display: 'flex', alignItems: 'center', gap: 0.3 }}>
                <LocationOnIcon sx={{ fontSize: 11 }} />{place.neighborhood}
              </Typography>
            </Box>

            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1a3a5c', fontSize: '0.95rem', lineHeight: 1.2, mb: 0.5 }}>
              {place.name}
            </Typography>

            <Typography variant="body2" sx={{ color: '#555', fontSize: '0.78rem', lineHeight: 1.4, mb: 1, display: '-webkit-box', WebkitLineClamp: list ? 2 : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {place.description}
            </Typography>

            {/* Tags */}
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
              {place.tags.map((tag) => (
                <Chip key={tag} label={tag} size="small" variant="outlined"
                  sx={{ fontSize: '0.6rem', height: 18, borderColor: '#d0d8e4', color: '#5a7a9a' }} />
              ))}
            </Box>

            {/* Meta row */}
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                <StarIcon sx={{ color: '#f39c12', fontSize: 14 }} />
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#444' }}>{place.rating}</Typography>
                <Typography variant="caption" sx={{ color: '#999' }}>({place.reviews.toLocaleString()})</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                <AccessTimeIcon sx={{ fontSize: 13, color: '#666' }} />
                <Typography variant="caption" sx={{ color: '#666' }}>{place.duration}</Typography>
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: place.priceNum === 0 ? '#2ecc71' : '#1a3a5c', ml: 'auto' }}>
                {place.price}
              </Typography>
            </Box>

            {/* Transport chips */}
            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.8, flexWrap: 'wrap' }}>
              {place.transport.map((t) => (
                <Chip key={t} icon={<DirectionsBusIcon sx={{ fontSize: '10px !important' }} />}
                  label={t} size="small"
                  sx={{ fontSize: '0.58rem', height: 18, bgcolor: '#f0f4f8', color: '#5a7a9a' }} />
              ))}
            </Box>
          </CardContent>

          {/* Actions */}
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

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ mt: '60px', minHeight: 'calc(100vh - 60px)', bgcolor: '#f5f7fa' }}>
      <Navbar />

      {/* ── Hero banner ─────────────────────────────────────────────────────── */}
      <Box
        sx={{
          background: 'linear-gradient(135deg,#0d1f33 0%,#1a3a5c 60%,#00688b 100%)',
          py: { xs: 3, md: 5 }, px: 2,
        }}
      >
        <Container maxWidth="xl">
          {/* Breadcrumb */}
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 1.5 }}>
            <Link underline="hover" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', cursor: 'pointer' }} onClick={() => navigate('/')}>Home</Link>
            <Typography sx={{ color: '#00b4d8', fontSize: '0.8rem', fontWeight: 700 }}>Explore</Typography>
          </Breadcrumbs>

          <Typography variant="h3" sx={{ color: '#fff', fontWeight: 900, mb: 0.5, fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
            🌵 Explore Guadalajara
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.75)', fontWeight: 400, mb: 3, fontSize: '1rem' }}>
            Descubre {PLACES.length} puntos de interés únicos en la ZMG
          </Typography>

          {/* Search bar */}
          <Box sx={{ maxWidth: 600, display: 'flex', gap: 1 }}>
            <TextField
              fullWidth placeholder="Busca museos, restaurantes, parques..."
              value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              size="small"
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'rgba(255,255,255,0.7)' }} /></InputAdornment>,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'rgba(255,255,255,0.12)', borderRadius: 2,
                  color: '#fff', fontSize: '0.9rem',
                  '&:hover fieldset': { borderColor: '#00b4d8' },
                  '&.Mui-focused fieldset': { borderColor: '#00b4d8' },
                },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.25)' },
                '& input::placeholder': { color: 'rgba(255,255,255,0.5)' },
              }}
            />
            <Button
              variant="contained"
              sx={{ bgcolor: '#00b4d8', '&:hover': { bgcolor: '#0077b6' }, fontWeight: 700, px: 3, borderRadius: 2 }}
            >
              Search
            </Button>
          </Box>

          {/* Category pills */}
          <Box sx={{ display: 'flex', gap: 1, mt: 2.5, flexWrap: 'wrap' }}>
            {CATEGORIES.map((cat) => {
              const active = category === cat.id;
              return (
                <Chip
                  key={cat.id}
                  label={`${cat.icon} ${cat.label}`}
                  onClick={() => { setCategory(cat.id); setPage(1); }}
                  sx={{
                    fontWeight: active ? 800 : 500,
                    bgcolor: active ? '#00b4d8' : 'rgba(255,255,255,0.12)',
                    color: active ? '#fff' : 'rgba(255,255,255,0.85)',
                    border: active ? '2px solid #00b4d8' : '2px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    '&:hover': { bgcolor: active ? '#0077b6' : 'rgba(255,255,255,0.2)' },
                  }}
                />
              );
            })}
          </Box>
        </Container>
      </Box>

      {/* ── Main layout ─────────────────────────────────────────────────────── */}
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>

          {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
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

          {/* ── Content area ────────────────────────────────────────────────── */}
          <Box sx={{ flex: 1, minWidth: 0 }}>

            {/* Toolbar row */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
              <Typography variant="body2" sx={{ color: '#666', fontWeight: 500, flex: 1 }}>
                <strong style={{ color: '#1a3a5c' }}>{results.length}</strong> places found
                {search && <span> for "<strong>{search}</strong>"</span>}
              </Typography>

              {/* Mobile filter button */}
              <Badge badgeContent={activeFilterCount || null} color="primary" sx={{ display: { md: 'none' } }}>
                <Button
                  size="small" startIcon={<FilterListIcon />} variant="outlined"
                  onClick={() => setMobileFiltersOpen(true)}
                  sx={{ fontWeight: 600, borderRadius: 2, fontSize: '0.8rem' }}
                >
                  Filters
                </Button>
              </Badge>

              {/* Sort */}
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

              {/* View toggle */}
              <ToggleButtonGroup
                value={viewMode} exclusive
                onChange={(_, v) => { if (v) setViewMode(v); }}
                size="small" sx={{ bgcolor: '#fff' }}
              >
                <ToggleButton value="grid" sx={{ px: 1.2 }}><GridViewIcon fontSize="small" /></ToggleButton>
                <ToggleButton value="list" sx={{ px: 1.2 }}><ViewListIcon fontSize="small" /></ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* Active filter chips */}
            {activeFilterCount > 0 && (
              <Box sx={{ display: 'flex', gap: 0.8, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <Typography variant="caption" sx={{ color: '#666' }}>Active:</Typography>
                {category !== 'all' && (
                  <Chip label={CATEGORIES.find((c) => c.id === category)?.label} size="small" onDelete={() => setCategory('all')}
                    sx={{ bgcolor: '#00b4d8', color: '#fff', fontWeight: 700, fontSize: '0.65rem', height: 22 }} />
                )}
                {neighborhood !== 'All Areas' && (
                  <Chip label={neighborhood} size="small" onDelete={() => setNeighborhood('All Areas')}
                    sx={{ bgcolor: '#1a3a5c', color: '#fff', fontWeight: 700, fontSize: '0.65rem', height: 22 }} />
                )}
                {selectedTransport.map((t) => (
                  <Chip key={t} label={t} size="small" onDelete={() => setTransport((p) => p.filter((x) => x !== t))}
                    sx={{ bgcolor: '#2ecc71', color: '#fff', fontWeight: 700, fontSize: '0.65rem', height: 22 }} />
                ))}
                {onlyOpen      && <Chip label="Open Now"    size="small" onDelete={() => setOnlyOpen(false)}      sx={{ bgcolor: '#e67e22', color: '#fff', fontSize: '0.65rem', height: 22 }} />}
                {onlyFree      && <Chip label="Free"         size="small" onDelete={() => setOnlyFree(false)}      sx={{ bgcolor: '#9b59b6', color: '#fff', fontSize: '0.65rem', height: 22 }} />}
                {onlyFeatured  && <Chip label="Featured"     size="small" onDelete={() => setOnlyFeatured(false)}  sx={{ bgcolor: '#f39c12', color: '#fff', fontSize: '0.65rem', height: 22 }} />}
                {onlyAccessible && <Chip label="Accessible"  size="small" onDelete={() => setAccessible(false)}   sx={{ bgcolor: '#3498db', color: '#fff', fontSize: '0.65rem', height: 22 }} />}
              </Box>
            )}

            {/* Results */}
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

            {/* Pagination */}
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

            {/* Favorites summary */}
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
          </Box>
        </Box>
      </Container>

      {/* ── Mobile filters drawer ─────────────────────────────────────────── */}
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
