import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';

// Category color palette
const CATEGORY_COLORS = {
  'Infrastructure': '#F59E0B',
  'Streetlight': '#F59E0B',
  'Roads & Infrastructure': '#EF4444',
  'Pothole': '#EF4444',
  'Sanitation': '#10B981',
  'Garbage Overflow': '#10B981',
  'Water Supply': '#0284C7',
  'Water Leakage': '#0284C7',
  'Public Works': '#6366F1',
  'Drainage & Sewage': '#6366F1',
  'Traffic Management': '#8B5CF6',
  'Traffic Signal': '#8B5CF6'
};

const CATEGORY_ICONS = {
  'Infrastructure': '💡',
  'Streetlight': '💡',
  'Roads & Infrastructure': '🚧',
  'Pothole': '🕳️',
  'Sanitation': '🗑️',
  'Garbage Overflow': '🗑️',
  'Water Supply': '💧',
  'Water Leakage': '💧',
  'Public Works': '🌊',
  'Drainage & Sewage': '🌊',
  'Traffic Management': '🚦',
  'Traffic Signal': '🚦'
};

export default function LeafletMap({
  points = [],
  center = [12.9716, 77.5946],
  zoom = 13,
  height = '500px',
  onLocationSelect = null,
  selectedLocation = null,
  showHotspots = true
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const hotspotsLayerRef = useRef(null);
  const selectionMarkerRef = useRef(null);
  const navigate = useNavigate();

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: true,
        scrollWheelZoom: true
      });

      // Standard OpenStreetMap Tile Layer (Zero Google Key Required)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      hotspotsLayerRef.current = L.layerGroup().addTo(map);

      // Handle map clicks for coordinate selection
      if (onLocationSelect) {
        map.on('click', (e) => {
          const { lat, lng } = e.latlng;
          onLocationSelect({
            lat: parseFloat(lat.toFixed(6)),
            lng: parseFloat(lng.toFixed(6))
          });
        });
      }

      mapInstanceRef.current = map;
    }

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Interactive Selection Marker (for Submit page)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (selectionMarkerRef.current) {
      selectionMarkerRef.current.remove();
      selectionMarkerRef.current = null;
    }

    if (selectedLocation?.lat && selectedLocation?.lng) {
      const pinIcon = L.divIcon({
        className: 'selection-pin',
        html: `
          <div style="
            background: #0284C7;
            color: white;
            width: 36px;
            height: 36px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 10px rgba(2, 132, 199, 0.4);
            border: 3px solid white;
          ">
            <span style="transform: rotate(45deg); font-size: 14px;">📍</span>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36]
      });

      const marker = L.marker([selectedLocation.lat, selectedLocation.lng], { icon: pinIcon })
        .addTo(map)
        .bindPopup('<b>Selected Incident Location</b>')
        .openPopup();

      selectionMarkerRef.current = marker;
      map.panTo([selectedLocation.lat, selectedLocation.lng]);
    }
  }, [selectedLocation]);

  // Update Markers and Hotspot Circles
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    if (hotspotsLayerRef.current) {
      hotspotsLayerRef.current.clearLayers();
    }

    if (!points || points.length === 0) return;

    // Detect clusters/hotspots for visualization
    if (showHotspots && hotspotsLayerRef.current) {
      const clusterCenters = [];
      const thresholdMeters = 600;

      points.forEach((p) => {
        let matchedCluster = null;
        for (const cluster of clusterCenters) {
          const dist = L.latLng(p.latitude, p.longitude).distanceTo(L.latLng(cluster.lat, cluster.lng));
          if (dist < thresholdMeters) {
            matchedCluster = cluster;
            break;
          }
        }

        if (matchedCluster) {
          matchedCluster.count += 1;
        } else {
          clusterCenters.push({
            lat: p.latitude,
            lng: p.longitude,
            count: 1
          });
        }
      });

      // Render glowing hotspot circles for dense clusters
      clusterCenters.forEach((cluster) => {
        if (cluster.count >= 2) {
          const radius = Math.min(600, 200 + cluster.count * 80);
          L.circle([cluster.lat, cluster.lng], {
            radius,
            color: '#EF4444',
            fillColor: '#F87171',
            fillOpacity: 0.18,
            weight: 1.5,
            dashArray: '4, 6'
          })
            .bindTooltip(`🔥 Civic Hotspot: ${cluster.count} Complaints Reported Here`, {
              permanent: false,
              direction: 'top'
            })
            .addTo(hotspotsLayerRef.current);
        }
      });
    }

    // Add markers for each complaint
    points.forEach((c) => {
      if (!c.latitude || !c.longitude) return;

      const categoryColor = CATEGORY_COLORS[c.subcategory] || CATEGORY_COLORS[c.category] || '#0284C7';
      const categoryEmoji = CATEGORY_ICONS[c.subcategory] || CATEGORY_ICONS[c.category] || '⚠️';

      const customIcon = L.divIcon({
        className: 'custom-civic-marker',
        html: `
          <div style="
            background-color: ${categoryColor};
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 10px rgba(0,0,0,0.25);
            border: 2px solid white;
            font-size: 14px;
            cursor: pointer;
          ">
            <span>${categoryEmoji}</span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18]
      });

      const priorityBadgeColor =
        c.priority === 'HIGH' ? '#EF4444' : c.priority === 'MEDIUM' ? '#F59E0B' : '#10B981';

      const popupContent = document.createElement('div');
      popupContent.className = 'civic-popup';
      popupContent.style.minWidth = '220px';
      popupContent.innerHTML = `
        <div style="font-family: system-ui, -apple-system, sans-serif;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-family: monospace; font-weight: 700; color: #0369A1; background: #E0F2FE; padding: 2px 6px; border-radius: 4px; font-size: 11px;">
              ${c.complaint_code}
            </span>
            <span style="font-size: 10px; font-weight: 700; color: white; background: ${priorityBadgeColor}; padding: 2px 6px; border-radius: 9999px;">
              ${c.priority}
            </span>
          </div>
          <h4 style="font-size: 13px; font-weight: 700; color: #0F172A; margin: 4px 0;">
            ${c.summary || c.description.substring(0, 60)}
          </h4>
          <p style="font-size: 11px; color: #64748B; margin: 2px 0 6px 0;">
            📍 ${c.address || 'Reported Location'}
          </p>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; padding-top: 6px; border-top: 1px solid #E2E8F0;">
            <span style="font-size: 11px; font-weight: 600; color: #475569;">
              Status: <span style="color: #0284C7;">${c.status}</span>
            </span>
            <button id="view-btn-${c.complaint_code}" style="
              background: #0284C7;
              color: white;
              border: none;
              padding: 4px 10px;
              border-radius: 6px;
              font-size: 11px;
              font-weight: 600;
              cursor: pointer;
            ">
              View Details →
            </button>
          </div>
        </div>
      `;

      // Attach button click event
      const marker = L.marker([c.latitude, c.longitude], { icon: customIcon })
        .addTo(markersLayerRef.current)
        .bindPopup(popupContent);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-btn-${c.complaint_code}`);
        if (btn) {
          btn.onclick = () => {
            navigate(`/complaints/${c.complaint_code}`);
          };
        }
      });
    });

    // Auto-fit bounds if points exist
    if (points.length > 1) {
      const validPoints = points.filter(p => p.latitude && p.longitude);
      if (validPoints.length > 0) {
        const bounds = L.latLngBounds(validPoints.map(p => [p.latitude, p.longitude]));
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    }
  }, [points, showHotspots, navigate]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm" style={{ height }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
      {onLocationSelect && (
        <div className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1.5 pointer-events-none">
          <span>👆 Click anywhere on map to pin location</span>
        </div>
      )}
    </div>
  );
}
