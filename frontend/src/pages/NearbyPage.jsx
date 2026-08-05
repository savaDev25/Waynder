import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Checkbox, FormControlLabel, TextField,
  Button, Chip, CircularProgress, Card, CardMedia, CardContent,
  Divider, Tab, Tabs, IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlined';
import MapIcon from '@mui/icons-material/Map';
import Navbar from '../components/Navbar';
import MapComponent from '../components/MapComponent';
import { placesService } from '../services/placesService';

const CATEGORIES = [
  { id: 'cultural', label: 'Cultural Sites', icon: '🏛️' },
  { id: 'museum', label: 'Museums', icon: '🎨' },
  { id: 'park', label: 'Parks & Gardens', icon: '🌳' },
  { id: 'dining', label: 'Dining', icon: '🍽️' },
  { id: 'tequila', label: 'Tequila Experiences', icon: '🥃' },
  { id: 'boutique', label: 'Boutique Shops', icon: '🛍️' },
  { id: 'landmark', label: 'Historic Landmarks', icon: '🏰' },
];

const NEARBY_PLACES = [
  {
    id: 1, name: 'Hospicio Cabañas Mural', category: 'Museum',
    description: 'World Heritage Site with murals by José Clemente Orozco.',
    lat: 20.6677, lng: -103.3428,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Hospicio_Caba%C3%B1as%2C_Guadalajara.jpg/320px-Hospicio_Caba%C3%B1as%2C_Guadalajara.jpg',
    rating: 4.8, color: '#9b59b6',
  },
  {
    id: 2, name: 'Bosque Colomos', category: 'Park',
    description: 'Parque urbano natural en el corazón de Guadalajara.',
    lat: 20.6932, lng: -103.3947,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Bosque_La_Primavera.jpg/320px-Bosque_La_Primavera.jpg',
    rating: 4.6, color: '#2ecc71',
  },
  {
    id: 3, name: 'Birrieria las Nueve Esquinas', category: 'Dining',
    description: 'Iconic birria restaurant in a historic neighborhood.',
    lat: 20.6571, lng: -103.3494,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Birria_de_res.jpg/320px-Birria_de_res.jpg',
    rating: 4.7, color: '#e67e22',
  },
  {
    id: 4, name: 'Historic Center', category: 'Historic Landmark',
    description: 'Centro histórico con la catedral y principales monumentos.',
    lat: 20.6597, lng: -103.3496,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Catedral_de_Guadalajara%2C_Mexico%2C_2013-10-11%2C_DD_01.JPG/320px-Catedral_de_Guadalajara%2C_Mexico%2C_2013-10-11%2C_DD_01.JPG',
    rating: 4.9, color: '#1a3a5c',
  },
  {
    id: 5, name: 'Tlaquepaque Artisan Market', category: 'Boutique Shops',
    description: 'Mercado de artesanías con cerámica, vidrio y más.',
    lat: 20.6432, lng: -103.3175,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Tlaquepaque_market.jpg/320px-Tlaquepaque_market.jpg',
    rating: 4.7, color: '#e74c3c',
  },
  {
    id: 6, name: 'Destilería Tequila', category: 'Tequila Experiences',
    description: 'Visita una destilería y conoce el proceso del tequila.',
    lat: 20.8780, lng: -103.8341,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Jimadores.jpg/320px-Jimadores.jpg',
    rating: 4.5, color: '#f39c12',
  },
];

const handleImgError = (e, name, color = '00b4d8') => {
  e.target.onerror = null; 
  const cleanColor = color.replace('#', '');
  e.target.src = `https://placehold.co/600x400/${cleanColor}/FFFFFF?text=${encodeURIComponent(name)}`;
};

export default function NearbyPage() {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sideTab, setSideTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [places, setPlaces] = useState(NEARBY_PLACES);

  const filteredPlaces = places.filter((p) => {
    const matchCat = selectedCategories.length === 0 ||
      selectedCategories.some((c) => p.category.toLowerCase().includes(c));
    const matchSearch = !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const toggleCategory = (catId) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]
    );
  };

  const handleAddToTrip = async (placeId) => {
    try {
      // Real call: await placesService.addToTrip(placeId, currentTripId);
      console.log('Added to trip:', placeId);
    } catch (err) {
      console.error(err);
    }
  };

  const markers = filteredPlaces.map((p) => ({
    lat: p.lat, lng: p.lng, label: p.name, icon: CATEGORIES.find(c => p.category.toLowerCase().includes(c.id))?.icon || '📍', color: p.color,
  }));

  return (
    <Box sx={{ mt: '60px', display: 'flex', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
      <Navbar />

      {/* LEFT: Filters */}
      <Box sx={{ width: 240, flexShrink: 0, overflow: 'auto', borderRight: '1px solid #e0e0e0', background: '#fff', p: 0 }}>
        <Paper elevation={0} sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1a3a5c', mb: 2, fontSize: '0.95rem', letterSpacing: '0.08em' }}>
            FILTER BY CATEGORY
          </Typography>
          {CATEGORIES.map((cat) => (
            <FormControlLabel
              key={cat.id}
              control={
                <Checkbox
                  size="small"
                  checked={selectedCategories.includes(cat.id)}
                  onChange={() => toggleCategory(cat.id)}
                  sx={{ color: '#00b4d8', '&.Mui-checked': { color: '#00b4d8' } }}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>{cat.icon}</span>
                  <Typography variant="body2" sx={{ fontWeight: selectedCategories.includes(cat.id) ? 700 : 400 }}>
                    {cat.label}
                  </Typography>
                </Box>
              }
              sx={{ display: 'flex', mb: 0.5 }}
            />
          ))}

          <TextField
            fullWidth placeholder="Search" size="small" sx={{ mt: 2 }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{ endAdornment: <SearchIcon sx={{ color: '#999', fontSize: 18 }} /> }}
          />
        </Paper>
      </Box>

      {/* CENTER: Map + overlay */}
      <Box sx={{ flex: 1, position: 'relative' }}>
        <MapComponent
          height="100%"
          markers={markers}
          center={[20.6597, -103.3496]}
          zoom={12}
        />

        {/* Explore Nearby overlay */}
        <Paper
          elevation={8}
          sx={{
            position: 'absolute', top: 16, right: 16, width: 280,
            maxHeight: 'calc(100% - 32px)', overflow: 'auto',
            borderRadius: 3, zIndex: 1000,
          }}
        >
          <Box sx={{ p: 2, background: 'linear-gradient(135deg, #1a3a5c, #2d5a8c)', borderRadius: '12px 12px 0 0' }}>
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 800, fontSize: '1rem', textAlign: 'center' }}>
              EXPLORE NEARBY
            </Typography>
          </Box>

          {filteredPlaces.map((place) => (
            <Box key={place.id} sx={{ borderBottom: '1px solid #f0f0f0' }}>
              <Box sx={{ display: 'flex', gap: 1.5, p: 1.5 }}>
                <Box
                  sx={{ width: 72, height: 60, borderRadius: 1.5, overflow: 'hidden', flexShrink: 0 }}
                >
                  <img
                    src={place.image} alt={place.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => handleImgError(e, place.name)}                   
                    />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#1a3a5c', lineHeight: 1.2, mb: 0.3 }}>
                    {place.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {place.description}
                  </Typography>
                  <Chip label={place.category} size="small" sx={{ fontSize: '0.6rem', height: 18, bgcolor: `${place.color}20`, color: place.color, fontWeight: 600 }} />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, px: 1.5, pb: 1.5 }}>
                <Button size="small" variant="outlined" startIcon={<MapIcon />}
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
          ))}
        </Paper>

        {/* Header */}
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
        <Tabs value={sideTab} onChange={(_, v) => setSideTab(v)} sx={{ borderBottom: '1px solid #e0e0e0', minHeight: 48 }}>
          <Tab label="Itinerary" sx={{ fontWeight: 600, fontSize: '0.82rem', minHeight: 48 }} />
          <Tab label="Nearby" sx={{ fontWeight: 600, fontSize: '0.82rem', minHeight: 48 }} />
          <Tab label="Saved Routes" sx={{ fontWeight: 600, fontSize: '0.82rem', minHeight: 48 }} />
        </Tabs>

        {/* Filter by Category dropdown */}
        <Box sx={{ p: 1.5, borderBottom: '1px solid #f0f0f0' }}>
          <Button fullWidth variant="outlined" endIcon={<FilterListIcon />}
            sx={{ justifyContent: 'space-between', textTransform: 'none', borderColor: '#e0e0e0', color: '#444' }}>
            Filter by Category
          </Button>
        </Box>

        {filteredPlaces.map((place) => (
          <Box key={place.id} sx={{ borderBottom: '1px solid #f5f5f5', display: 'flex', gap: 1.5, p: 1.5 }}>
            <Box sx={{ width: 80, height: 68, borderRadius: 1.5, overflow: 'hidden', flexShrink: 0 }}>
              <img
                src={place.image} alt={place.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => handleImgError(e, place.name)}/>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#1a3a5c', mb: 0.3 }}>{place.name}</Typography>
              <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>{place.description.substring(0, 55)}...</Typography>
              <Chip label={place.category} size="small" sx={{ fontSize: '0.6rem', height: 18, mb: 0.5, bgcolor: `${place.color}15`, color: place.color }} />
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Button size="small" sx={{ fontSize: '0.6rem', py: 0.2, px: 0.8, color: '#00b4d8', border: '1px solid #00b4d8', minWidth: 'auto' }}>View on Map</Button>
                <Button size="small" sx={{ fontSize: '0.6rem', py: 0.2, px: 0.8, color: '#fff', background: '#00b4d8', minWidth: 'auto', '&:hover': { background: '#0077b6' } }}
                  onClick={() => handleAddToTrip(place.id)}>Add to Trip</Button>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
