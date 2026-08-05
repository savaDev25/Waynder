import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';

// We use Leaflet directly via CDN-style dynamic import
let L;

const GDL_CENTER = [20.6597, -103.3496];

export default function MapComponent({
  height = '100%',
  routes = [],
  markers = [],
  center = GDL_CENTER,
  zoom = 13,
  onMapClick,
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    // Dynamically load Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Initialize map
    const initMap = async () => {
      if (mapInstanceRef.current) return;
      const leaflet = await import('leaflet');
      L = leaflet.default;

      // Fix default icon paths
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (!mapRef.current) return;

      const map = L.map(mapRef.current, {
        center,
        zoom,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // OpenStreetMap tiles with a light style
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Click handler
      if (onMapClick) {
        map.on('click', (e) => onMapClick(e.latlng));
      }

      mapInstanceRef.current = map;
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when they change
  useEffect(() => {
    if (!mapInstanceRef.current || !L) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    markers.forEach(({ lat, lng, label, icon, color = '#1a3a5c' }) => {
      const markerIcon = L.divIcon({
        html: `
          <div style="
            background: ${color};
            color: white;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            width: 32px; height: 32px;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            border: 2px solid white;
          ">
            <span style="transform: rotate(45deg); font-size: 14px;">${icon || '📍'}</span>
          </div>
        `,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const marker = L.marker([lat, lng], { icon: markerIcon })
        .addTo(mapInstanceRef.current);

      if (label) {
        marker.bindPopup(`<strong>${label}</strong>`);
      }

      markersRef.current.push(marker);
    });
  }, [markers]);

  // Draw routes
  useEffect(() => {
    if (!mapInstanceRef.current || !L) return;

    routes.forEach(({ coordinates, color = '#00b4d8', weight = 4 }) => {
      if (coordinates && coordinates.length > 1) {
        L.polyline(coordinates, {
          color,
          weight,
          opacity: 0.8,
          dashArray: color === '#2ecc71' ? '10, 5' : null,
        }).addTo(mapInstanceRef.current);
      }
    });
  }, [routes]);

  return (
    <Box
      ref={mapRef}
      sx={{
        width: '100%',
        height,
        minHeight: 300,
        borderRadius: 0,
        '& .leaflet-container': { borderRadius: 'inherit' },
      }}
    />
  );
}
