import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin } from 'lucide-react';
import { Building, RecurringHotspot } from '../types';

interface InteractiveMapProps {
  onSelectComplaint?: (id: number) => void;
}

// Custom Marker Icons for Leaflet
const createPinIcon = (color: string, pulse: boolean = false) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center;">
        ${pulse ? `<div style="position: absolute; width: 26px; height: 26px; border-radius: 9999px; background: ${color}; opacity: 0.4; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>` : ''}
        <div style="width: 14px; height: 14px; border-radius: 9999px; background: ${color}; border: 2px solid #ffffff; box-shadow: 0 0 10px ${color};"></div>
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
  });
};

export const InteractiveMap: React.FC<InteractiveMapProps> = ({ onSelectComplaint }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  const [mapData, setMapData] = useState<{
    buildings: Building[];
    complaint_markers: any[];
    hotspots: RecurringHotspot[];
  }>({
    buildings: [],
    complaint_markers: [],
    hotspots: []
  });

  const [activeFilter, setActiveFilter] = useState<'all' | 'critical' | 'active' | 'resolved' | 'recurring'>('all');
  const [loading, setLoading] = useState(true);

  // 1. Fetch Map Data
  useEffect(() => {
    const fetchMap = async () => {
      try {
        const res = await fetch('/api/predictive/map-data');
        if (res.ok) {
          const data = await res.json();
          setMapData(data);
        }
      } catch (e) {
        console.error('Failed to load map data:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchMap();
  }, []);

  // 2. Initialize Leaflet Map Instance
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [12.9723, 77.5945],
      zoom: 16,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 3. Render Markers & Building Circles
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;

    const layerGroup = layerGroupRef.current;
    layerGroup.clearLayers();

    // Render Buildings Circles
    mapData.buildings.forEach(b => {
      const isCritical = (b.critical_complaints || 0) > 0;
      const color = isCritical ? '#ef4444' : (b.active_complaints || 0) > 2 ? '#f59e0b' : '#06b6d4';

      L.circle([b.latitude, b.longitude], {
        radius: 45,
        color: color,
        fillColor: color,
        fillOpacity: 0.12,
        weight: 1.5
      })
      .bindTooltip(`<strong>${b.name}</strong> (${b.code})<br/>Active Issues: ${b.active_complaints}`, {
        className: 'bg-slate-900 text-white text-xs border border-slate-700 rounded-lg p-1.5'
      })
      .addTo(layerGroup);
    });

    // Render Hotspots Warning Circles
    mapData.hotspots.forEach(h => {
      L.circle([h.latitude, h.longitude], {
        radius: 30,
        color: '#a855f7',
        fillColor: '#a855f7',
        fillOpacity: 0.25,
        dashArray: '4, 4'
      })
      .bindTooltip(`<strong>Recurring Hotspot</strong><br/>${h.building_name} - ${h.room}<br/>${h.complaint_count} repeat complaints`, {
        className: 'bg-purple-950 text-purple-200 text-xs border border-purple-800 rounded-lg p-1.5'
      })
      .addTo(layerGroup);
    });

    // Filter Complaints
    const filtered = mapData.complaint_markers.filter(m => {
      if (activeFilter === 'critical') return m.severity === 'Critical' || m.severity === 'High';
      if (activeFilter === 'active') return m.status !== 'Resolved';
      if (activeFilter === 'resolved') return m.status === 'Resolved';
      if (activeFilter === 'recurring') {
        return mapData.hotspots.some(h => h.building_id === m.building_id && h.room === m.room);
      }
      return true;
    });

    // Render Complaint Pins
    filtered.forEach(m => {
      const isCritical = m.severity === 'Critical';
      const isResolved = m.status === 'Resolved';
      const color = isResolved ? '#10b981' : isCritical ? '#ef4444' : '#f59e0b';

      const marker = L.marker([m.latitude, m.longitude], {
        icon: createPinIcon(color, isCritical && !isResolved)
      });

      const popupContent = document.createElement('div');
      popupContent.className = 'p-1 min-w-[200px] text-xs';
      popupContent.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; font-size: 10px; color: #94a3b8;">
          <span>${m.category}</span>
          <span style="background: ${isResolved ? '#064e3b' : isCritical ? '#7f1d1d' : '#78350f'}; color: ${isResolved ? '#34d399' : isCritical ? '#f87171' : '#fbbf24'}; padding: 2px 6px; border-radius: 4px; font-weight: bold;">
            Priority ${m.priority_score}/100
          </span>
        </div>
        <h4 style="font-weight: bold; font-size: 12px; color: #ffffff; margin: 0 0 4px 0; line-height: 1.2;">${m.title}</h4>
        <p style="font-size: 11px; color: #cbd5e1; margin: 0 0 8px 0;">${m.building_name} • ${m.floor} • ${m.room}</p>
        <div style="border-top: 1px solid #334155; padding-top: 6px; display: flex; justify-content: space-between; align-items: center; font-size: 10px;">
          <span style="color: #38bdf8; font-weight: 600;">${m.status}</span>
          ${onSelectComplaint ? `<button id="btn-inspect-${m.id}" style="color: #38bdf8; background: none; border: none; cursor: pointer; text-decoration: underline;">Inspect</button>` : ''}
        </div>
      `;

      if (onSelectComplaint) {
        marker.on('popupopen', () => {
          const btn = document.getElementById(`btn-inspect-${m.id}`);
          if (btn) {
            btn.onclick = () => onSelectComplaint(m.id);
          }
        });
      }

      marker.bindPopup(popupContent).addTo(layerGroup);
    });

  }, [mapData, activeFilter]);

  return (
    <div className="glass-panel rounded-3xl p-4 sm:p-6 border border-slate-800 relative overflow-hidden flex flex-col h-[700px]">
      
      {/* Top Map Controls & Filter Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800 z-10">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/60">
              <MapPin className="w-4 h-4" />
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white">Smart Campus Geospatial Map</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Live OpenStreetMap telemetry with facility risk clustering</p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              activeFilter === 'all' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({mapData.complaint_markers.length})
          </button>
          <button
            onClick={() => setActiveFilter('critical')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              activeFilter === 'critical' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-red-400'
            }`}
          >
            Critical Incidents
          </button>
          <button
            onClick={() => setActiveFilter('active')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              activeFilter === 'active' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-amber-400'
            }`}
          >
            Active Tickets
          </button>
          <button
            onClick={() => setActiveFilter('recurring')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              activeFilter === 'recurring' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-purple-400'
            }`}
          >
            Recurring Hotspots
          </button>
          <button
            onClick={() => setActiveFilter('resolved')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              activeFilter === 'resolved' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-emerald-400'
            }`}
          >
            Resolved
          </button>
        </div>
      </div>

      {/* Leaflet Map DOM Container */}
      <div className="flex-1 w-full rounded-2xl overflow-hidden mt-4 relative border border-slate-800">
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      {/* Map Legend */}
      <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500 animate-pulse"></span>
            <span>Critical Hazard</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Active Complaint</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Remediated & Verified</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
            <span>Recurring Hotspot Zone</span>
          </div>
        </div>
        <span className="text-[10px] text-slate-500">Coordinates centered on Central Campus Hub</span>
      </div>

    </div>
  );
};
