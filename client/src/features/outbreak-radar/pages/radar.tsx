import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { outbreakService } from '@/services/endpoints';
import type { OutbreakCluster, OutbreakStats } from '@/types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Radio,
  AlertOctagon,
  ShieldAlert,
  MapPin,
  TrendingUp,
  ScanLine,
  Filter,
  CheckCircle2,
  Bug,
  Wind,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';

export default function OutbreakRadar() {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [outbreaks, setOutbreaks] = useState<OutbreakCluster[]>([]);
  const [stats, setStats] = useState<OutbreakStats | null>(null);
  const [selectedOutbreak, setSelectedOutbreak] = useState<OutbreakCluster | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Fetch Outbreak Data
  useEffect(() => {
    outbreakService
      .getOutbreaks()
      .then((res) => {
        if (res.data?.success) {
          const list: OutbreakCluster[] = res.data.data.outbreaks || [];
          setOutbreaks(list);
          setStats(res.data.data.stats);
          if (list.length > 0) setSelectedOutbreak(list[0]);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Centered on South Asia / Default regional coordinates
    const map = L.map(mapContainerRef.current, {
      center: [13.0827, 80.2707],
      zoom: 6,
      zoomControl: true,
    });

    // Dark / Modern CartoDB Voyager or Positron tiles for high-aesthetic sleek map
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      maxZoom: 18,
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Plot Outbreak Markers on Map
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || outbreaks.length === 0) return;

    markersLayerRef.current.clearLayers();

    const filtered =
      filterSeverity === 'all'
        ? outbreaks
        : outbreaks.filter((o) => o.severity === filterSeverity);

    filtered.forEach((cluster) => {
      const isSelected = selectedOutbreak?.id === cluster.id;
      const color =
        cluster.severity === 'critical'
          ? '#ef4444'
          : cluster.severity === 'high'
          ? '#f97316'
          : '#eab308';

      // Pulsing radar marker icon
      const customIcon = L.divIcon({
        className: 'custom-radar-pin',
        html: `
          <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background: ${color}33; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 22px; height: 22px; border-radius: 50%; background: ${color}; border: 2.5px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: 900;">
              ${cluster.reportedCases}
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      // Pin marker
      const marker = L.marker([cluster.latitude, cluster.longitude], { icon: customIcon })
        .addTo(markersLayerRef.current!)
        .on('click', () => {
          setSelectedOutbreak(cluster);
          mapInstanceRef.current?.flyTo([cluster.latitude, cluster.longitude], 9, { duration: 1.2 });
        });

      // Outbreak Risk Radius Circle
      L.circle([cluster.latitude, cluster.longitude], {
        radius: cluster.radiusKm * 1000,
        color: color,
        fillColor: color,
        fillOpacity: isSelected ? 0.2 : 0.1,
        weight: isSelected ? 2 : 1,
        dashArray: '4, 4',
      }).addTo(markersLayerRef.current!);
    });

    if (selectedOutbreak) {
      mapInstanceRef.current.panTo([selectedOutbreak.latitude, selectedOutbreak.longitude]);
    }
  }, [outbreaks, filterSeverity, selectedOutbreak]);

  const selectOutbreak = (cluster: OutbreakCluster) => {
    setSelectedOutbreak(cluster);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([cluster.latitude, cluster.longitude], 9, { duration: 1.2 });
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col animate-fade-in" style={{ gap: '28px' }}>
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Disease Outbreak Radar 📡
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/20">
              Innovation 5
            </span>
          </div>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Real-time geospatial epidemiological monitoring: detect plant disease clusters and safeguard your crops before epidemics arrive.
          </p>
        </div>

        <button
          onClick={() => navigate('/scan')}
          className="px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 transition-all self-start sm:self-auto"
        >
          <ScanLine className="w-4 h-4" /> Report New Sighting (Scan)
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className="p-4 rounded-2xl border flex flex-col gap-1 shadow-sm"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 animate-pulse" /> Active Outbreaks
          </span>
          <p className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
            {stats?.totalActiveOutbreaks || 5} Regional Zones
          </p>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            Within monitored perimeter
          </span>
        </div>

        <div
          className="p-4 rounded-2xl border flex flex-col gap-1 shadow-sm"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
            <Bug className="w-3.5 h-3.5" /> Total Cases Tracked
          </span>
          <p className="text-2xl font-black text-amber-500">
            {stats?.totalCasesTracked || 56} Infections
          </p>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            Aggregated user scans (30 days)
          </span>
        </div>

        <div
          className="p-4 rounded-2xl border flex flex-col gap-1 shadow-sm"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-red-500 flex items-center gap-1.5">
            <AlertOctagon className="w-3.5 h-3.5" /> Critical Surge Zones
          </span>
          <p className="text-2xl font-black text-red-500">
            {stats?.criticalZonesCount || 2} Epidemic Clusters
          </p>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            Requiring immediate quarantine
          </span>
        </div>

        <div
          className="p-4 rounded-2xl border flex flex-col gap-1 shadow-sm"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5" /> Dominant Pathogen
          </span>
          <p className="text-sm font-black truncate mt-1" style={{ color: 'var(--text-primary)' }}>
            {stats?.dominantThreat || 'Early Blight (Alternaria)'}
          </p>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            Spreading through fungal vectors
          </span>
        </div>
      </div>

      {/* Main Radar Layout: Interactive Map + Details Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Leaflet Map Column (7 cols) */}
        <div
          className="lg:col-span-7 rounded-3xl border overflow-hidden flex flex-col shadow-xl"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)', height: '540px' }}
        >
          <div
            className="p-4 border-b flex items-center justify-between z-10"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
          >
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-rose-500 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                Live Epidemiological Map
              </span>
            </div>

            {/* Severity Filter */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="px-2 py-1 rounded-lg text-xs font-bold outline-none border"
                style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
              >
                <option value="all">All Severities</option>
                <option value="critical">🔴 Critical Surge</option>
                <option value="high">🟠 High Spread</option>
                <option value="medium">🟡 Moderate</option>
              </select>
            </div>
          </div>

          {/* Leaflet Map Container */}
          <div ref={mapContainerRef} className="w-full flex-1 z-0" />
        </div>

        {/* Outbreak Details & Prevention Protocol (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {selectedOutbreak ? (
            <div
              className="p-6 rounded-3xl border flex flex-col gap-4 shadow-xl animate-fade-in"
              style={{
                background: 'linear-gradient(135deg, rgba(239,68,68,0.06) 0%, rgba(249,115,22,0.02) 100%), var(--bg-card)',
                borderColor: 'var(--border-default)',
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-500">
                    {selectedOutbreak.riskLevel}
                  </span>
                  <h3 className="text-xl font-black mt-0.5" style={{ color: 'var(--text-primary)' }}>
                    {selectedOutbreak.disease}
                  </h3>
                  <p className="text-xs font-semibold flex items-center gap-1 mt-1 text-gray-400">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    {selectedOutbreak.city} (~{selectedOutbreak.radiusKm} km radius)
                  </p>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-black">
                  {selectedOutbreak.reportedCases} Cases
                </div>
              </div>

              {/* Host Crops */}
              <div>
                <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                  Vulnerable Host Plants:
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {selectedOutbreak.affectedCrops.map((c) => (
                    <span
                      key={c}
                      className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                    >
                      🌱 {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Contagion Vector */}
              <div
                className="p-3.5 rounded-2xl border flex items-center gap-3"
                style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-default)' }}
              >
                <Wind className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                    Transmission Vector
                  </p>
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {selectedOutbreak.primaryVector}
                  </p>
                </div>
              </div>

              {/* Preventative Protocol Checklist */}
              <div className="flex flex-col gap-2 pt-1 border-t" style={{ borderColor: 'var(--border-default)' }}>
                <span className="text-xs font-black uppercase tracking-wider text-emerald-500">
                  Neighborhood Preventative Shield
                </span>
                {selectedOutbreak.preventiveProtocol.map((proto, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                      {proto}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Quick Outbreak List */}
          <div
            className="p-4 rounded-3xl border flex flex-col gap-2.5 overflow-y-auto max-h-60"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
          >
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Nearby Monitored Outbreak Clusters
            </span>
            {outbreaks.map((cluster) => (
              <div
                key={cluster.id}
                onClick={() => selectOutbreak(cluster)}
                className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                  selectedOutbreak?.id === cluster.id
                    ? 'border-rose-500 bg-rose-500/10'
                    : 'border-transparent hover:border-gray-700'
                }`}
                style={{ background: selectedOutbreak?.id === cluster.id ? undefined : 'var(--bg-primary)' }}
              >
                <div>
                  <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                    {cluster.disease}
                  </p>
                  <p className="text-[11px] text-gray-400">{cluster.city}</p>
                </div>
                <span
                  className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                    cluster.severity === 'critical'
                      ? 'text-red-500 bg-red-500/10'
                      : 'text-amber-500 bg-amber-500/10'
                  }`}
                >
                  {cluster.reportedCases} cases
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
