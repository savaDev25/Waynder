import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Button, Grid, Card, CardContent,
  CardMedia, CardActions, Chip, TextField, MenuItem, Select,
  FormControl, Paper, Avatar, Rating, Divider, IconButton,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ExploreIcon from '@mui/icons-material/Explore';
import MapIcon from '@mui/icons-material/Map';
import StarIcon from '@mui/icons-material/Star';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Navbar from '../components/Navbar';
import TransportModeSelector from '../components/TransportModeSelector';

// --- STABLE IMAGE DATA ---
const TOURISM_ROUTES = [
  {
    id: 1,
    name: 'Historic Center Tour',
    description: 'Recorre el corazón histórico de Guadalajara: catedral, murales y más.',
    image: 'https://images.unsplash.com/photo-1585938389612-a552a28d6914?auto=format&fit=crop&w=800&q=80',
    duration: '3h', category: 'Cultural', stops: 8, emoji: '🎺',
  },
  {
    id: 2,
    name: 'Tequila Express',
    description: 'Explora los campos de agave y las destilerías que dieron fama mundial a Jalisco.',
    image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ca1?auto=format&fit=crop&w=800&q=80',
    duration: '6h', category: 'Experiences', stops: 5, emoji: '🥃',
  },
  {
    id: 3,
    name: 'Ajijic Village Trip',
    description: 'Descubre el pintoresco pueblo de Ajijic a orillas del Lago de Chapala.',
    image: 'https://images.unsplash.com/photo-1595843454683-979927694389?auto=format&fit=crop&w=800&q=80',
    duration: '4h', category: 'Nature', stops: 6, emoji: '🌊',
  },
];

const TESTIMONIALS = [
  { name: 'María González', role: 'Tourist from CDMX', text: 'WonderGDL me ayudó a descubrir lugares que nunca hubiera encontrado solo. La planificación de rutas es increíble.', rating: 5, avatar: '👩' },
  { name: 'James Wilson', role: 'International Visitor', text: 'Amazing app! Helped me navigate Guadalajara perfectly during the World Cup. Routes were spot on.', rating: 5, avatar: '👨' },
  { name: 'Carlos Reyes', role: 'Local Resident', text: 'Como tapatío, uso WonderGDL todos los días para optimizar mis trayectos en transporte público.', rating: 4, avatar: '🧑' },
];

const FEATURED_EXPERIENCES = [
  { name: 'Tlaquepaque\nArtisan Market', img: 'https://images.unsplash.com/photo-1599949104055-2d04026aee1e?auto=format&fit=crop&w=400&q=80', color: '#e67e22' },
  { name: 'Bosque de la\nPrimavera', img: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=400&q=80', color: '#2ecc71' },
  { name: 'Hospicio\nCabañas', img: 'https://images.unsplash.com/photo-1518105779142-d975b22f1b0a?auto=format&fit=crop&w=400&q=80', color: '#9b59b6' },
  { name: 'Chapala\nLake', img: 'https://images.unsplash.com/photo-1595843454683-979927694389?auto=format&fit=crop&w=400&q=80', color: '#00b4d8' },
];

// Reusable Image Fallback Function
const handleImgError = (e, name, color = '00b4d8') => {
  e.target.onerror = null; 
  const cleanColor = color.replace('#', '');
  e.target.src = `https://placehold.co/600x400/${cleanColor}/FFFFFF?text=${encodeURIComponent(name)}`;
};

export default function HomePage() {
  const navigate = useNavigate();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [travelMode, setTravelMode] = useState('bus');
  const [heroSlide, setHeroSlide] = useState(0);

  const heroImages = [
    'https://images.unsplash.com/photo-1585938389612-a552a28d6914?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1518548419970-58e3b4079ca1?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1595843454683-979927694389?auto=format&fit=crop&w=1200&q=80',
  ];

  useEffect(() => {
    const interval = setInterval(() => setHeroSlide((s) => (s + 1) % heroImages.length), 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  const handleQuickRoute = () => {
    if (origin && destination) {
      navigate(`/plan?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=${travelMode}`);
    }
  };

  return (
    <Box sx={{ mt: '60px' }}>
      <Navbar />

      {/* HERO SECTION */}
      <Box sx={{ position: 'relative', height: { xs: 320, md: 420 }, overflow: 'hidden' }}>
        <Box
          sx={{
            position: 'absolute', inset: 0,
            backgroundImage: 'url("/60783833-a0d7-4f0c-b1be-5bf3dbedf8a9.webp")',
            backgroundSize: 'cover', backgroundPosition: 'center',
            transition: 'background-image 0.8s ease',
            filter: 'brightness(0.55)',
          }}
        />
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(13,31,51,0.85) 0%, rgba(13,31,51,0.3) 100%)' }} />
        <Container maxWidth="lg" sx={{ height: '100%', display: 'flex', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <Box>
            <Typography variant="h2" sx={{ color: '#fff', fontWeight: 900, mb: 1, fontSize: { xs: '2rem', md: '3.2rem' }, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
              Guadalajara:
            </Typography>
            <Typography variant="h2" sx={{ color: '#00b4d8', fontWeight: 900, mb: 2, fontSize: { xs: '2rem', md: '3.2rem' } }}>
              Connected & Cultural
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.85)', mb: 3, fontWeight: 400 }}>
              Discover the city's heart through vibrant routes and seamless mobility.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="contained" size="large" startIcon={<ExploreIcon />} onClick={() => navigate('/tourism')} sx={{ background: 'linear-gradient(135deg, #00b4d8, #0077b6)', px: 3, fontWeight: 700 }}>
                Explore Routes
              </Button>
              <Button variant="outlined" size="large" startIcon={<MapIcon />} onClick={() => navigate('/mobility')} sx={{ borderColor: '#fff', color: '#fff', px: 3, fontWeight: 700, '&:hover': { borderColor: '#00b4d8', background: 'rgba(0,180,216,0.1)' } }}>
                Plan Mobility
              </Button>
            </Box>
          </Box>
        </Container>

        <Box sx={{ position: 'absolute', bottom: 16, right: 16, display: 'flex', gap: 1, zIndex: 2 }}>
          <IconButton size="small" onClick={() => setHeroSlide((s) => (s - 1 + heroImages.length) % heroImages.length)} sx={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
            <ChevronLeftIcon />
          </IconButton>
          <IconButton size="small" onClick={() => setHeroSlide((s) => (s + 1) % heroImages.length)} sx={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
            <ChevronRightIcon />
          </IconButton>
        </Box>
      </Box>

      {/* YOUR GDL JOURNEY */}
      <Box sx={{ bgcolor: '#fff', py: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" align="center" sx={{ fontWeight: 800, mb: 1, color: '#1a3a5c' }}>
            Your GDL Journey
          </Typography>
          <Typography variant="body1" align="center" sx={{ color: '#5a7a9a', mb: 5, maxWidth: 600, mx: 'auto' }}>
            WonderGDL — la plataforma que combina turismo y movilidad para explorar Guadalajara de manera inteligente.
          </Typography>

          <Grid container spacing={4} >
            <Grid  item xs={12} md={4}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#1a3a5c' }}>Discover Tourism Routes</Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                {['🎺 Mariachi', '🌵 Agave', '🥃 Tequila', '🏺 Pottery'].map((item) => (
                  <Chip key={item} label={item} sx={{ fontWeight: 600, bgcolor: '#f0f4f8' }} />
                ))}
              </Box>
              <Grid container spacing={2}>
                {TOURISM_ROUTES.map((route) => (
                  <Grid item xs={12} key={route.id}>
                    <Card sx={{ display: 'flex', cursor: 'pointer', '&:hover': { boxShadow: 6 } }} onClick={() => navigate(`/plan?route=${route.id}`)}>
                      <CardMedia 
                        component="img" 
                        sx={{ width: 100, objectFit: 'cover' }} 
                        image={route.image} 
                        alt={route.name}
                        onError={(e) => handleImgError(e, route.name)} 
                      />
                      <CardContent sx={{ flex: 1, p: 1.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1a3a5c' }}>{route.name}</Typography>
                        <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>{route.description.substring(0, 60)}...</Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Chip label={route.duration} size="small" sx={{ fontSize: '0.65rem' }} />
                          <Chip label={`${route.stops} stops`} size="small" sx={{ fontSize: '0.65rem' }} />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Planner Widget */}
            <Grid item xs={12} md={5}>
               <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#1a3a5c' }}>Seamless Mobility</Typography>
               <TransportModeSelector selected={['sitren']} size="small" />
               <Box sx={{ mt: 2 }}>
                {[
                  { name: 'SITREN Center', route: 'Line 1 & 3 Connect', icon: '🚌' },
                  { name: 'Mi Macro Periférico', route: 'Rapid Transit System', icon: '🚆' },
                  { name: 'MiBici', route: 'Public Bike Share', icon: '🚲' }
                ].map((line, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1, borderBottom: '1px solid #f0f4f8' }}>
                    <CheckCircleIcon sx={{ color: '#2ecc71', fontSize: 18 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{line.name}</Typography>
                      <Typography variant="caption" sx={{ color: '#999' }}>{line.route}</Typography>
                    </Box>
                    <Box sx={{ fontSize: '1.2rem' }}>{line.icon}</Box>
                  </Box>
                ))}
              </Box>
            </Grid>

            <Grid item xs={12} md={3}>
              <Paper elevation={4} sx={{ p: 3, borderRadius: 3, background: 'linear-gradient(135deg, #1a3a5c, #2d5a8c)', color: '#fff' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DirectionsBusIcon /> Route Planner
                </Typography>
                <TextField fullWidth placeholder="Origin" size="small" value={origin} onChange={(e) => setOrigin(e.target.value)} sx={{ mb: 1, '& .MuiOutlinedInput-root': { background: 'rgba(255,255,255,0.9)', borderRadius: 2 } }} />
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField fullWidth placeholder="Destination" size="small" value={destination} onChange={(e) => setDestination(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { background: 'rgba(255,255,255,0.9)', borderRadius: 2 } }} />
                  <FormControl size="small" sx={{ minWidth: 80 }}>
                    <Select value={travelMode} onChange={(e) => setTravelMode(e.target.value)} sx={{ background: 'rgba(255,255,255,0.9)', borderRadius: 2 }}>
                      <MenuItem value="bus">Bus</MenuItem>
                      <MenuItem value="bike">Bike</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Button fullWidth variant="contained" onClick={handleQuickRoute} sx={{ background: '#00b4d8', fontWeight: 700 }}>Go</Button>
              </Paper>
            </Grid>
          </Grid>

        </Container>
      </Box>

      {/* FEATURED EXPERIENCES */}
      <Box sx={{ bgcolor: '#f0f4f8', py: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" align="center" sx={{ fontWeight: 800, mb: 4, color: '#1a3a5c' }}>Featured Experiences</Typography>
          <Grid container spacing={2}>
            {FEATURED_EXPERIENCES.map((exp, i) => (
              <Grid item xs={6} md={3} key={i}>
                <Card sx={{ cursor: 'pointer', overflow: 'hidden', position: 'relative', height: 180 }} onClick={() => navigate('/nearby')}>
                  <CardMedia
                    component="img" height="180" image={exp.img} alt={exp.name}
                    sx={{ filter: 'brightness(0.7)' }}
                    onError={(e) => handleImgError(e, exp.name, exp.color)}
                  />
                  <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: 1.5, background: `linear-gradient(transparent, ${exp.color}cc)` }}>
                    <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'pre-line' }}>
                      {exp.name}
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

       {/* TESTIMONIALS */}

      <Box sx={{ bgcolor: '#f0f4f8', py: 6 }}>

        <Container maxWidth="lg">

          <Typography variant="h4" align="center" sx={{ fontWeight: 800, mb: 4, color: '#1a3a5c' }}>

            What Travelers Say

          </Typography>

          <Grid container spacing={3}>

            {TESTIMONIALS.map((t, i) => (
              <Grid item xs={12} md={4} key={i}>
                <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                  <Rating value={t.rating} readOnly size="small" sx={{ mb: 1 }} />
                  <Typography variant="body2" sx={{ color: '#444', mb: 2, fontStyle: 'italic' }}>"{t.text}"</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ bgcolor: '#00b4d8', width: 36, height: 36 }}>{t.avatar}</Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{t.name}</Typography>
                      <Typography variant="caption" sx={{ color: '#999' }}>{t.role}</Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>

      </Box>

      {/* FOOTER */}
       <Box sx={{ bgcolor: '#0d1f33', color: '#fff', py: 4 }}>
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#00b4d8', mb: 1 }}>WonderGDL</Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                La plataforma de turismo y movilidad para explorar Guadalajara.
              </Typography>
            </Grid>
            {[
              { title: 'Site Map', links: ['Home', 'Mobility Map', 'Tourism Routes', 'Plan Your Trip', 'Blog'] },
              { title: 'Contact', links: ['About', 'Careers', 'Contact', 'Press'] },
              { title: 'Stay Connected', links: ['Follow us on social media'] },
            ].map((section) => (
              <Grid item xs={6} md={3} key={section.title}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>{section.title}</Typography>
                {section.links.map((link) => (
                  <Typography key={link} variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', display: 'block', mb: 0.5 }}>{link}</Typography>
                ))}
              </Grid>
            ))}
          </Grid>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 2 }} />
          <Typography variant="caption" align="center" display="block" sx={{ color: 'rgba(255,255,255,0.4)' }}>
            © 2026 WonderGDL — Universidad de Guadalajara · CUCEI · Hackathon Smart Mobility 26A
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}