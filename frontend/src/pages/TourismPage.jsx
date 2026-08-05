import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Paper, Typography, Grid, Card, CardMedia, CardContent,
  CardActions, Button, Chip, Rating, Divider, Tab, Tabs,
  TextField, InputAdornment, Select, MenuItem, FormControl,
  InputLabel, Avatar, IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShareIcon from '@mui/icons-material/Share';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Navbar from '../components/Navbar';
import MapComponent from '../components/MapComponent';

const ALL_ROUTES = [
  {
    id: 1, name: 'Historic Center Tour', category: 'Cultural', duration: '3h', stops: 8,
    difficulty: 'Easy', rating: 4.9, reviews: 248, price: 'Free',
    description: 'Explora la catedral, el Instituto Cultural Cabañas, y los principales monumentos del corazón histórico de Guadalajara.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Catedral_de_Guadalajara%2C_Mexico%2C_2013-10-11%2C_DD_01.JPG/640px-Catedral_de_Guadalajara%2C_Mexico%2C_2013-10-11%2C_DD_01.JPG',
    transport: ['Bus', 'Walking'], emoji: '🏛️',
    highlights: ['Catedral de Guadalajara', 'Hospicio Cabañas', 'Plaza Tapatía', 'Mercado San Juan de Dios'],
    lat: 20.6597, lng: -103.3496,
  },
  {
    id: 2, name: 'Tequila Express', category: 'Experiences', duration: '6h', stops: 5,
    difficulty: 'Easy', rating: 4.8, reviews: 512, price: '$580 MXN',
    description: 'Viaja en tren a Tequila, visita campos de agave y destilerías históricas. Incluye degustación.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Jimadores.jpg/640px-Jimadores.jpg',
    transport: ['Train', 'Walking'], emoji: '🥃',
    highlights: ['Destilería José Cuervo', 'Campos de Agave', 'Pueblo Mágico Tequila', 'Degustación incluida'],
    lat: 20.8780, lng: -103.8341,
  },
  {
    id: 3, name: 'Ajijic Village Trip', category: 'Nature', duration: '4h', stops: 6,
    difficulty: 'Easy', rating: 4.7, reviews: 189, price: '$120 MXN',
    description: 'Visita el encantador pueblo de Ajijic en las orillas del Lago de Chapala, famoso por su comunidad artística.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Lago_de_Chapala.JPG/640px-Lago_de_Chapala.JPG',
    transport: ['Bus', 'Walking'], emoji: '🌊',
    highlights: ['Malecón de Ajijic', 'Lago de Chapala', 'Galerías de arte', 'Mercado artesanal'],
    lat: 20.2974, lng: -103.1850,
  },
  {
    id: 4, name: 'Tlaquepaque Artisans', category: 'Shopping', duration: '3h', stops: 10,
    difficulty: 'Easy', rating: 4.8, reviews: 374, price: 'Free',
    description: 'El barrio de las artesanías. Cerámica talavera, vidrio soplado, muebles coloniales y gastronomía local.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Tlaquepaque_market.jpg/640px-Tlaquepaque_market.jpg',
    transport: ['Bus', 'Bike'], emoji: '🎨',
    highlights: ['El Parián', 'Galerías de arte', 'Cerámica Talavera', 'Restaurantes típicos'],
    lat: 20.6432, lng: -103.3175,
  },
  {
    id: 5, name: 'Bosque La Primavera', category: 'Nature', duration: '5h', stops: 4,
    difficulty: 'Moderate', rating: 4.6, reviews: 156, price: '$50 MXN',
    description: 'Reserva de la biósfera a las afueras de Guadalajara. Senderismo, cascadas y aguas termales.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Bosque_La_Primavera.jpg/640px-Bosque_La_Primavera.jpg',
    transport: ['Bus', 'Walking'], emoji: '🌲',
    highlights: ['Senderismo', 'Cascadas', 'Aguas termales', 'Observación de aves'],
    lat: 20.6700, lng: -103.5200,
  },
  {
    id: 6, name: 'Chapala Lakeside', category: 'Nature', duration: '4h', stops: 5,
    difficulty: 'Easy', rating: 4.7, reviews: 203, price: '$80 MXN',
    description: 'El lago más grande de México. Paseo en lancha, malecón y gastronomía lacustre.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Lago_de_Chapala.JPG/640px-Lago_de_Chapala.JPG',
    transport: ['Bus', 'Walking'], emoji: '⛵',
    highlights: ['Lago de Chapala', 'Malecón', 'Isla de los Alacranes', 'Caldo Michi'],
    lat: 20.2974, lng: -103.1850,
  },
];

const CATEGORIES = ['All', 'Cultural', 'Nature', 'Experiences', 'Shopping'];

export default function TourismPage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [favorites, setFavorites] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [sideTab, setSideTab] = useState(0);

  const filtered = ALL_ROUTES
    .filter((r) => {
      const matchCat = selectedCategory === 'All' || r.category === selectedCategory;
      const matchSearch = !searchQuery || r.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'duration') return parseInt(a.duration) - parseInt(b.duration);
      if (sortBy === 'reviews') return b.reviews - a.reviews;
      return 0;
    });

  const toggleFavorite = (id) => {
    setFavorites((prev) => prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]);
  };

  const handleImgError = (e, name, color = '00b4d8') => {
    e.target.onerror = null; 
    const cleanColor = color.replace('#', '');
    e.target.src = `https://placehold.co/600x400/${cleanColor}/FFFFFF?text=${encodeURIComponent(name)}`;
  };

  const markers = filtered.map((r) => ({ lat: r.lat, lng: r.lng, label: r.name, icon: r.emoji, color: '#1a3a5c' }));

  return (
    <Box sx={{ mt: '60px', height: 'calc(100vh - 60px)', overflow: 'auto' }}>
      <Navbar />

      {/* Hero */}
      <Box sx={{ background: 'linear-gradient(135deg, #0d1f33, #1a3a5c)', py: 4, px: 3 }}>
        <Typography variant="h4" sx={{ color: '#fff', fontWeight: 900, mb: 0.5 }}>
          🗺️ Tourism Routes
        </Typography>
        <Typography variant="body1" sx={{ color: '#00b4d8', mb: 2 }}>
          Descubre lo mejor de Guadalajara y la ZMG
        </Typography>

        {/* Search & filter bar */}
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
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select
              value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              displayEmpty
              sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: 2, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' } }}
            >
              <MenuItem value="rating">⭐ Best Rated</MenuItem>
              <MenuItem value="duration">⏱️ Shortest</MenuItem>
              <MenuItem value="reviews">💬 Most Reviewed</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Category tabs */}
        <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
          {CATEGORIES.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              onClick={() => setSelectedCategory(cat)}
              sx={{
                fontWeight: selectedCategory === cat ? 700 : 500,
                bgcolor: selectedCategory === cat ? '#00b4d8' : 'rgba(255,255,255,0.15)',
                color: '#fff',
                cursor: 'pointer',
                '&:hover': { bgcolor: '#00b4d8' },
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Main content: grid + map */}
      <Box sx={{ display: 'flex', height: 'calc(100% - 200px)', minHeight: 500 }}>
        {/* Routes grid */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, color: '#666' }}>
            {filtered.length} routes found
          </Typography>
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
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img" height="140" image={route.image} alt={route.name}
                      onError={(e) => handleImgError(e, route.name)} 
                    />
                    <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(route.id); }}
                        sx={{ bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: '#fff' } }}
                      >
                        {favorites.includes(route.id)
                          ? <FavoriteIcon sx={{ color: '#e74c3c', fontSize: 16 }} />
                          : <FavoriteBorderIcon sx={{ color: '#666', fontSize: 16 }} />}
                      </IconButton>
                    </Box>
                    <Chip
                      label={route.category}
                      size="small"
                      sx={{ position: 'absolute', top: 8, left: 8, bgcolor: '#1a3a5c', color: '#fff', fontSize: '0.65rem', fontWeight: 700 }}
                    />
                    <Box
                      sx={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
                        p: 1,
                      }}
                    >
                      <Typography variant="h6" sx={{ color: '#fff', fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.2 }}>
                        {route.emoji} {route.name}
                      </Typography>
                    </Box>
                  </Box>

                  <CardContent sx={{ flex: 1, p: 1.5, pb: '8px !important' }}>
                    <Typography variant="body2" sx={{ color: '#555', mb: 1, fontSize: '0.78rem', lineHeight: 1.4 }}>
                      {route.description.substring(0, 90)}...
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                      <Chip icon={<AccessTimeIcon sx={{ fontSize: '12px !important' }} />} label={route.duration} size="small" sx={{ fontSize: '0.65rem', height: 22 }} />
                      <Chip icon={<LocationOnIcon sx={{ fontSize: '12px !important' }} />} label={`${route.stops} stops`} size="small" sx={{ fontSize: '0.65rem', height: 22 }} />
                      <Chip label={route.difficulty} size="small" sx={{ fontSize: '0.65rem', height: 22, bgcolor: route.difficulty === 'Easy' ? '#e8f8ee' : '#fff8e1', color: route.difficulty === 'Easy' ? '#2ecc71' : '#f39c12' }} />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Rating value={route.rating} readOnly size="small" precision={0.1} />
                      <Typography variant="caption" sx={{ color: '#666' }}>{route.rating} ({route.reviews})</Typography>
                      <Box sx={{ flex: 1 }} />
                      <Typography variant="caption" sx={{ fontWeight: 700, color: route.price === 'Free' ? '#2ecc71' : '#1a3a5c' }}>
                        {route.price}
                      </Typography>
                    </Box>
                  </CardContent>

                  <CardActions sx={{ p: 1.5, pt: 0, gap: 1 }}>
                    <Button
                      size="small" variant="contained" endIcon={<ArrowForwardIcon />}
                      onClick={(e) => { e.stopPropagation(); navigate(`/plan?route=${route.id}`); }}
                      sx={{ flex: 1, background: '#00b4d8', fontWeight: 700, fontSize: '0.75rem' }}
                    >
                      Start Here
                    </Button>
                    <IconButton size="small" sx={{ border: '1px solid #e0e0e0' }}>
                      <ShareIcon fontSize="small" />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Right: Mini map + selected route detail */}
        <Box sx={{ width: 320, flexShrink: 0, borderLeft: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ height: 200 }}>
            <MapComponent
              height="200px"
              markers={markers}
              center={[20.6597, -103.3496]}
              zoom={10}
            />
          </Box>

          {selectedRoute ? (
            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#1a3a5c', mb: 0.5 }}>
                {selectedRoute.emoji} {selectedRoute.name}
              </Typography>
              <Rating value={selectedRoute.rating} readOnly size="small" />
              <Typography variant="body2" sx={{ color: '#555', my: 1.5 }}>{selectedRoute.description}</Typography>

              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Highlights</Typography>
              {selectedRoute.highlights.map((h, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#00b4d8', flexShrink: 0 }} />
                  <Typography variant="body2" sx={{ color: '#444', fontSize: '0.82rem' }}>{h}</Typography>
                </Box>
              ))}

              <Divider sx={{ my: 1.5 }} />

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                <Chip icon={<AccessTimeIcon />} label={selectedRoute.duration} size="small" />
                <Chip label={selectedRoute.price} size="small" sx={{ bgcolor: '#e8f8ee', color: '#2ecc71', fontWeight: 700 }} />
                {selectedRoute.transport.map((t) => (
                  <Chip key={t} label={t} size="small" sx={{ bgcolor: '#e8edf2' }} />
                ))}
              </Box>

              <Button
                fullWidth variant="contained"
                onClick={() => navigate(`/plan?route=${selectedRoute.id}`)}
                sx={{ background: 'linear-gradient(135deg, #1a3a5c, #2d5a8c)', fontWeight: 700 }}
              >
                Plan This Route
              </Button>
            </Box>
          ) : (
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#ccc', p: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ mt: 1 }}>Select a route to see details</Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
