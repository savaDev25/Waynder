import React from 'react';
import { Box, Typography, Paper, Tooltip } from '@mui/material';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import TrainIcon from '@mui/icons-material/Train';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';

const TRANSPORT_MODES = [
  {
    id: 'sitren',
    label: 'SITREN',
    sublabel: '(Bus)',
    icon: DirectionsBusIcon,
    color: '#00b4d8',
    bgColor: '#e3f4f8',
    description: 'Sistema de Transporte en Red - Red de autobuses de Guadalajara',
  },
  {
    id: 'mi_macro',
    label: 'Mi Macro',
    sublabel: '(BRT)',
    icon: TrainIcon,
    color: '#e74c3c',
    bgColor: '#fde8e8',
    description: 'Bus Rapid Transit - Líneas exprés de alta capacidad',
  },
  {
    id: 'bici_publica',
    label: 'Bici Pública',
    sublabel: '(Bike Share)',
    icon: DirectionsBikeIcon,
    color: '#2ecc71',
    bgColor: '#e8f8ee',
    description: 'Sistema de bicicletas públicas compartidas',
  },
  {
    id: 'walking',
    label: 'Walking',
    sublabel: '',
    icon: DirectionsWalkIcon,
    color: '#1a3a5c',
    bgColor: '#e8edf2',
    description: 'Ruta a pie entre puntos de interés',
  },
];

export { TRANSPORT_MODES };

export default function TransportModeSelector({
  selected = [],
  onSelect,
  multiple = true,
  size = 'medium',
}) {
  const handleClick = (modeId) => {
    if (!onSelect) return;
    if (multiple) {
      if (selected.includes(modeId)) {
        onSelect(selected.filter((m) => m !== modeId));
      } else {
        onSelect([...selected, modeId]);
      }
    } else {
      onSelect(modeId === selected[0] ? [] : [modeId]);
    }
  };

  const isSmall = size === 'small';

  return (
    <Box sx={{ display: 'flex', gap: isSmall ? 1 : 1.5, flexWrap: 'wrap' }}>
      {TRANSPORT_MODES.map((mode) => {
        const Icon = mode.icon;
        const isSelected = selected.includes(mode.id);
        return (
          <Tooltip key={mode.id} title={mode.description} arrow>
            <Paper
              onClick={() => handleClick(mode.id)}
              elevation={isSelected ? 4 : 1}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: isSmall ? 1 : 1.5,
                width: isSmall ? 64 : 80,
                cursor: 'pointer',
                borderRadius: 2,
                border: isSelected ? `2px solid ${mode.color}` : '2px solid transparent',
                background: isSelected ? mode.bgColor : '#fff',
                transition: 'all 0.2s ease',
                '&:hover': {
                  background: mode.bgColor,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 4px 12px ${mode.color}40`,
                },
              }}
            >
              <Box
                sx={{
                  width: isSmall ? 32 : 40,
                  height: isSmall ? 32 : 40,
                  borderRadius: '50%',
                  background: isSelected ? mode.color : `${mode.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 0.5,
                  transition: 'all 0.2s ease',
                }}
              >
                <Icon sx={{ color: isSelected ? '#fff' : mode.color, fontSize: isSmall ? 18 : 22 }} />
              </Box>
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, color: isSelected ? mode.color : '#1a3a5c', fontSize: '0.65rem', textAlign: 'center', lineHeight: 1.2 }}
              >
                {mode.label}
              </Typography>
              {mode.sublabel && (
                <Typography
                  variant="caption"
                  sx={{ color: '#666', fontSize: '0.6rem', textAlign: 'center', lineHeight: 1 }}
                >
                  {mode.sublabel}
                </Typography>
              )}
            </Paper>
          </Tooltip>
        );
      })}
    </Box>
  );
}
