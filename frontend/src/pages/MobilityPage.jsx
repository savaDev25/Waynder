import React, { useState } from 'react';
import {
  Box, Paper, Typography, Chip, Switch, FormControlLabel,
  Divider, Tab, Tabs, Button, List, ListItem, ListItemIcon,
  ListItemText, Alert, Collapse, IconButton,
} from '@mui/material';
import TrainIcon from '@mui/icons-material/Train';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Navbar from '../components/Navbar';
import MapComponent from '../components/MapComponent';

const TRANSIT_LINES = [
  {
    id: 'tren_ligero', name: 'Tren Ligero', shortName: 'Línea 1',
    color: '#e74c3c', type: 'metro', active: true,
    stations: ['Periférico', 'Tetlán', 'Tlaquepaque', 'Niños Héroes', 'Juárez'],
    frequency: '5-8 min', operatingHours: '6:00 - 23:00',
    route: [[20.6432, -103.3175], [20.6520, -103.3330], [20.6597, -103.3496]],
    color_map: '#e74c3c',
  },
  {
    id: 'macro', name: 'Mi Macro Periférico', shortName: 'Línea 3 BRT',
    color: '#e67e22', type: 'brt', active: true,
    stations: ['Av. López Mateos', 'Midtown', 'Expo', 'Periférico Norte'],
    frequency: '3-6 min', operatingHours: '5:30 - 22:30',
    route: [[20.6700, -103.4100], [20.6597, -103.3496], [20.6400, -103.3200]],
    color_map: '#e67e22',
  },
  {
    id: 'sitren_a', name: 'SITREN Ruta 51A', shortName: 'Bus 51A',
    color: '#00b4d8', type: 'bus', active: true,
    stations: ['Centro', 'San Juan de Dios', 'Mercado', 'Plaza del Sol'],
    frequency: '10-15 min', operatingHours: '6:00 - 22:00',
    route: [[20.6597, -103.3496], [20.6500, -103.3600], [20.6400, -103.3800]],
    color_map: '#00b4d8',
  },
  {
    id: 'bici', name: 'Bici Pública MiBici', shortName: 'MiBici',
    color: '#2ecc71', type: 'bike', active: true,
    stations: ['Plaza Tapatía', 'Andares', 'Expo', 'Plaza del Sol', 'Chapultepec'],
    frequency: 'On demand', operatingHours: '24/7',
    route: null,
    color_map: '#2ecc71',
  },
];

const ALERTS = [
  { id: 1, type: 'warning', message: 'Tren Ligero: Retraso de 10 min entre Juárez y Periférico por mantenimiento.', line: 'Línea 1' },
  { id: 2, type: 'info', message: 'Ruta 51A: Desviación temporal en Av. Hidalgo por obras. Rutas alternativas disponibles.', line: 'Bus 51A' },
];

const MARKERS = [
  { lat: 20.6597, lng: -103.3496, label: 'Centro Histórico', icon: '🏛️', color: '#1a3a5c' },
  { lat: 20.6432, lng: -103.3175, label: 'Tlaquepaque', icon: '🎨', color: '#e67e22' },
  { lat: 20.6700, lng: -103.4100, label: 'Av. López Mateos', icon: '🚌', color: '#00b4d8' },
  { lat: 20.6800, lng: -103.3800, label: 'Andares (MiBici)', icon: '🚲', color: '#2ecc71' },
  { lat: 20.2974, lng: -103.1850, label: 'Chapala Lake', icon: '🌊', color: '#0077b6' },
];

const TYPE_ICON = {
  metro: TrainIcon,
  brt: DirectionsBusIcon,
  bus: DirectionsBusIcon,
  bike: DirectionsBikeIcon,
};

export default function MobilityPage() {
  const [activeLines, setActiveLines] = useState(['tren_ligero', 'macro', 'sitren_a', 'bici']);
  const [sideTab, setSideTab] = useState(0);
  const [expandedLine, setExpandedLine] = useState(null);
  const [showAlerts, setShowAlerts] = useState(true);

  const toggleLine = (id) => {
    setActiveLines((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    );
  };

  const activeRoutes = TRANSIT_LINES
    .filter((l) => activeLines.includes(l.id) && l.route)
    .map((l) => ({ coordinates: l.route, color: l.color_map, weight: l.type === 'metro' ? 5 : 3 }));

  return (
    <Box sx={{ mt: '60px', display: 'flex', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
      <Navbar />

      {/* LEFT: Lines control */}
      <Box sx={{ width: 260, flexShrink: 0, overflow: 'auto', borderRight: '1px solid #e0e0e0', background: '#fff' }}>
        <Box sx={{ p: 2, background: 'linear-gradient(135deg, #0d1f33, #1a3a5c)' }}>
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 800, fontSize: '0.95rem' }}>
            🚌 Mobility Map
          </Typography>
          <Typography variant="caption" sx={{ color: '#00b4d8' }}>
            Zona Metropolitana de Guadalajara
          </Typography>
        </Box>

        {/* Alerts */}
        {showAlerts && ALERTS.map((alert) => (
          <Alert
            key={alert.id}
            severity={alert.type === 'warning' ? 'warning' : 'info'}
            icon={<WarningAmberIcon fontSize="small" />}
            sx={{ mx: 1.5, mt: 1.5, borderRadius: 2, fontSize: '0.72rem', py: 0.5 }}
          >
            <strong>{alert.line}:</strong> {alert.message}
          </Alert>
        ))}

        <Divider sx={{ my: 1.5 }} />

        <Box sx={{ px: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1a3a5c', mb: 1.5 }}>
            Transit Lines
          </Typography>

          {TRANSIT_LINES.map((line) => {
            const Icon = TYPE_ICON[line.type];
            const isActive = activeLines.includes(line.id);
            const isExpanded = expandedLine === line.id;

            return (
              <Box key={line.id} sx={{ mb: 1 }}>
                <Box
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 1,
                    p: 1.2, borderRadius: 2, cursor: 'pointer',
                    bgcolor: isActive ? `${line.color}15` : '#f8f8f8',
                    border: `1px solid ${isActive ? line.color : '#eee'}`,
                    transition: 'all 0.2s',
                  }}
                >
                  <Box
                    sx={{
                      width: 32, height: 32, borderRadius: '50%',
                      bgcolor: isActive ? line.color : '#e0e0e0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon sx={{ color: '#fff', fontSize: 16 }} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#1a3a5c', lineHeight: 1.2 }}>
                      {line.shortName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666', fontSize: '0.65rem' }}>
                      {line.frequency}
                    </Typography>
                  </Box>
                  <Switch
                    size="small" checked={isActive}
                    onChange={() => toggleLine(line.id)}
                    sx={{ mr: -0.5 }}
                  />
                  <IconButton
                    size="small" onClick={() => setExpandedLine(isExpanded ? null : line.id)}
                    sx={{ p: 0.2 }}
                  >
                    {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                  </IconButton>
                </Box>

                <Collapse in={isExpanded}>
                  <Box sx={{ pl: 2, pr: 1, py: 1, bgcolor: '#fafafa', borderRadius: '0 0 8px 8px', border: '1px solid #eee', borderTop: 'none' }}>
                    <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>
                      🕐 {line.operatingHours}
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5, color: '#1a3a5c' }}>
                      Key Stations:
                    </Typography>
                    {line.stations.map((station, i) => (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.3 }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: line.color, flexShrink: 0 }} />
                        <Typography variant="caption" sx={{ color: '#444', fontSize: '0.65rem' }}>{station}</Typography>
                      </Box>
                    ))}
                    {line.active ? (
                      <Chip icon={<CheckCircleIcon />} label="Operational" size="small" sx={{ mt: 0.5, bgcolor: '#e8f8ee', color: '#2ecc71', fontSize: '0.6rem', height: 20 }} />
                    ) : (
                      <Chip icon={<WarningAmberIcon />} label="Disrupted" size="small" sx={{ mt: 0.5, bgcolor: '#fff3e0', color: '#e67e22', fontSize: '0.6rem', height: 20 }} />
                    )}
                  </Box>
                </Collapse>
              </Box>
            );
          })}
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Box sx={{ px: 2, pb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#1a3a5c' }}>Legend</Typography>
          {[
            { color: '#e74c3c', label: 'Tren Ligero / Metro' },
            { color: '#e67e22', label: 'Mi Macro BRT' },
            { color: '#00b4d8', label: 'SITREN Bus' },
            { color: '#2ecc71', label: 'Bici Pública' },
          ].map((item) => (
            <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Box sx={{ width: 20, height: 4, borderRadius: 2, bgcolor: item.color }} />
              <Typography variant="caption" sx={{ color: '#444' }}>{item.label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* CENTER: Map */}
      <Box sx={{ flex: 1, position: 'relative' }}>
        <MapComponent
          height="100%"
          markers={MARKERS}
          routes={activeRoutes}
          center={[20.6597, -103.3496]}
          zoom={13}
        />

        {/* Overlay title */}
        <Box sx={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 500 }}>
          <Paper elevation={4} sx={{ px: 3, py: 1.2, borderRadius: 3, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1a3a5c', textAlign: 'center' }}>
              Mobility Map — ZMG
            </Typography>
          </Paper>
        </Box>

        {/* Quick stats */}
        <Box sx={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 500, display: 'flex', gap: 1 }}>
          {[
            { label: 'Active Lines', value: activeLines.length, color: '#00b4d8' },
            { label: 'Stations', value: '200+', color: '#2ecc71' },
            { label: 'Alerts', value: ALERTS.length, color: '#e67e22' },
          ].map((stat) => (
            <Paper key={stat.label} elevation={4} sx={{ px: 2, py: 1, borderRadius: 2, background: 'rgba(255,255,255,0.95)', textAlign: 'center', backdropFilter: 'blur(8px)' }}>
              <Typography variant="h6" sx={{ fontWeight: 900, color: stat.color, lineHeight: 1 }}>{stat.value}</Typography>
              <Typography variant="caption" sx={{ color: '#666' }}>{stat.label}</Typography>
            </Paper>
          ))}
        </Box>
      </Box>

      {/* RIGHT: Sidebar */}
      <Box sx={{ width: 300, flexShrink: 0, overflow: 'auto', borderLeft: '1px solid #e0e0e0', background: '#fff' }}>
        <Tabs value={sideTab} onChange={(_, v) => setSideTab(v)} sx={{ borderBottom: '1px solid #e0e0e0', minHeight: 48 }}>
          <Tab label="Live Status" sx={{ fontWeight: 600, fontSize: '0.8rem', minHeight: 48 }} />
          <Tab label="Schedules" sx={{ fontWeight: 600, fontSize: '0.8rem', minHeight: 48 }} />
        </Tabs>

        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1a3a5c', mb: 1.5 }}>
            🟢 Live Status — {new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
          </Typography>

          {TRANSIT_LINES.map((line) => {
            const Icon = TYPE_ICON[line.type];
            const isActive = activeLines.includes(line.id);
            const hasAlert = ALERTS.some((a) => a.line === line.shortName);

            return (
              <Box key={line.id} sx={{ mb: 1.5, p: 1.5, borderRadius: 2, border: '1px solid #f0f0f0', bgcolor: hasAlert ? '#fff8f0' : '#fafcff' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Icon sx={{ color: line.color, fontSize: 18 }} />
                  <Typography variant="body2" sx={{ fontWeight: 700, flex: 1 }}>{line.name}</Typography>
                  <Chip
                    label={hasAlert ? '⚠️ Alert' : '✅ OK'}
                    size="small"
                    sx={{
                      fontSize: '0.6rem', height: 18,
                      bgcolor: hasAlert ? '#fff3cd' : '#d4edda',
                      color: hasAlert ? '#856404' : '#155724',
                      fontWeight: 700,
                    }}
                  />
                </Box>
                <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                  Frequency: {line.frequency} · Hours: {line.operatingHours}
                </Typography>
                {hasAlert && (
                  <Alert severity="warning" sx={{ mt: 0.5, py: 0.2, fontSize: '0.65rem' }}>
                    {ALERTS.find((a) => a.line === line.shortName)?.message}
                  </Alert>
                )}
              </Box>
            );
          })}

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#1a3a5c' }}>
            🗺️ Seamless Mobility
          </Typography>
          <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 2 }}>
            Combina diferentes modos de transporte para llegar a tu destino de manera eficiente.
          </Typography>

          <Button
            fullWidth variant="contained"
            onClick={() => window.location.href = '/plan'}
            sx={{ background: 'linear-gradient(135deg, #00b4d8, #0077b6)', fontWeight: 700 }}
          >
            Plan My Route
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
