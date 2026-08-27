import React, { useState, useEffect } from 'react';
import { ShieldCheck, LayoutDashboard, FileKey, Users2, Aperture, Power, Shield, ExternalLink, Fingerprint, FileText, Signal, Scale, Building2, Mountain, Waves, X, Activity, MapPin, Loader2, Cpu, UploadCloud, Check } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Polygon, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchPopulation } from './worldpop';

const GLOBAL_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
.font-display { font-family: 'Chakra Petch', sans-serif; }
.font-sans { font-family: 'Inter', sans-serif; }
.font-mono { font-family: 'JetBrains Mono', monospace; }
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.bg-subtle-grid { background-image: linear-gradient(to right, #ffffff05 1px, transparent 1px), linear-gradient(to bottom, #ffffff05 1px, transparent 1px); background-size: 40px 40px; }
.backdrop-blur-24px { backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); }
@keyframes marquee {
  0% { transform: translateX(100vw); }
  100% { transform: translateX(-100vw); }
}
.animate-marquee {
  display: inline-block;
  white-space: nowrap;
  animation: marquee 20s linear infinite;
}
@keyframes spin-slow {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.animate-spin-slow {
  animation: spin-slow 10s linear infinite;
}
@keyframes fade-in-up {
  0% { opacity: 0; transform: translateY(15px); }
  100% { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
  animation: fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.cyber-popup .leaflet-popup-content-wrapper { background: transparent; padding: 0; box-shadow: none; border-radius: 0; }
.cyber-popup .leaflet-popup-tip { background: #020617; border: 1px solid rgba(59,130,246,0.5); }
.leaflet-container { background: transparent !important; }
.leaflet-tile { filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%) grayscale(20%); }
.custom-leaflet-icon { background: transparent; border: none; }
@keyframes radar-sweep {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.animate-radar {
  background: conic-gradient(from 0deg, transparent 70%, rgba(59, 130, 246, 0.4) 100%);
  border-radius: 50%;
  animation: radar-sweep 2s linear infinite;
}
@keyframes typing {
  from { width: 0 }
  to { width: 100% }
}
@keyframes blink-caret {
  from, to { border-color: transparent }
  50% { border-color: #3b82f6 }
}
.animate-typing {
  overflow: hidden;
  border-right: .15em solid #3b82f6;
  white-space: nowrap;
  animation: typing 2.5s steps(40, end), blink-caret .75s step-end infinite;
}
.scanlines {
  background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.1));
  background-size: 100% 4px;
  pointer-events: none;
}
.glitch-hover:hover {
  color: #60a5fa;
}
.leaflet-bar { box-shadow: none !important; border: 1px solid rgba(59,130,246,0.3) !important; border-radius: 0 !important; }
.leaflet-bar a { background-color: rgba(2,6,23,0.8) !important; color: #3b82f6 !important; border-bottom: 1px solid rgba(59,130,246,0.3) !important; font-family: 'JetBrains Mono', monospace !important; }
.leaflet-bar a:hover { background-color: rgba(59,130,246,0.2) !important; color: #60a5fa !important; }
.leaflet-bar a:last-child { border-bottom: none !important; }
.leaflet-control-zoom-in, .leaflet-control-zoom-out { background-color: rgba(2,6,23,0.8) !important; }
.leaflet-popup-content-wrapper { background: rgba(15, 23, 42, 0.95) !important; border: 1px solid rgba(59, 130, 246, 0.3) !important; color: #e2e8f0 !important; border-radius: 0 !important; backdrop-filter: blur(16px); box-shadow: none !important; }
.leaflet-popup-tip { background: rgba(15, 23, 42, 0.95) !important; border-top: 1px solid rgba(59, 130, 246, 0.3) !important; border-left: 1px solid rgba(59, 130, 246, 0.3) !important; box-shadow: none !important; }
.leaflet-popup-close-button { color: #3b82f6 !important; text-shadow: none !important; }
.leaflet-popup-close-button:hover { color: #60a5fa !important; background: transparent !important; }
`;

const createIcon = (color: string, isBlinking: boolean = false) => {
    return L.divIcon({
        className: 'custom-leaflet-icon',
        html: `<div style="position:relative; display:flex; align-items:center; justify-content:center; width:24px; height:24px;">
            <div style="position:absolute; inset:0; border-radius:50%; opacity:0.5; background-color: ${color};" class="${isBlinking ? 'animate-ping' : ''}"></div>
            <div style="width:12px; height:12px; border-radius:50%; position:relative; z-index:10; background-color: ${color}; box-shadow: 0 0 10px ${color};"></div>
        </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });
};

const Clock = () => {
    const [time, setTime] = useState('');
    useEffect(() => {
        const timer = setInterval(() => {
            const d = new Date();
            setTime(d.toLocaleTimeString('en-GB', { hour12: false }));
        }, 1000);
        return () => clearInterval(timer);
    }, []);
    return <span className="font-mono text-sm tracking-widest text-slate-200">{time || '00:00:00'}</span>;
};

const TelemetryTicker = () => (
    <div className="w-full bg-[#020617] border-b border-blue-500/20 py-1 overflow-hidden relative z-50">
        <div className="animate-marquee font-mono text-[9px] tracking-[0.2em] text-blue-400">
            [SYS] UPLINK SECURE &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; [SAT] ORBITAL POSITION ALIGNED &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; [BMKG] SEISMIC FEED ACTIVE &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; [BNPB] REGIONAL POLYGONS SYNCED &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; [USAR] AWAITING DEPLOYMENT DIRECTIVE &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; [SYS] UPLINK SECURE
        </div>
    </div>
);

const WelcomeScreen = ({ onEnter }: { onEnter: () => void }) => (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-[#020617] overflow-hidden">
        <div className="absolute inset-0 bg-subtle-grid z-0"></div>
        <div className="absolute inset-0 scanlines z-[1]"></div>
        <div className="relative z-10 max-w-md w-full text-center flex flex-col items-center px-4">
            <div className="relative mb-8">
                <div className="absolute inset-0 rounded-full border border-blue-500/20 animate-spin-slow scale-150"></div>
                <div className="absolute inset-0 rounded-full border border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent animate-[spin_3s_linear_infinite] scale-[1.75]"></div>
                <div className="w-20 h-20 bg-blue-900/30 rounded-full border border-blue-500 flex items-center justify-center backdrop-blur-md shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                    <Shield className="text-blue-500" size={32} />
                </div>
            </div>
            
            <div className="inline-block mb-2">
                <h2 className="font-mono text-[10px] tracking-[0.3em] text-blue-400 animate-typing">CONNECTING TO SAT-COM...</h2>
            </div>
            <h1 className="font-display text-5xl font-bold tracking-wider mb-2 text-blue-400">RESILIO</h1>
            <div className="bg-red-900/20 border border-red-500/30 text-red-400 font-mono text-[10px] tracking-widest px-3 py-1 mb-12">RESTRICTED ACCESS</div>
            
            <div className="w-full flex gap-4">
                <button onClick={onEnter} className="w-full bg-blue-900/20 border border-blue-500/50 hover:bg-blue-600/30 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] py-4 font-display font-medium tracking-wider transition-all cursor-crosshair relative overflow-hidden group active:translate-y-[1px]">
                    <div className="absolute inset-0 bg-blue-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                    <span className="relative z-10 glitch-hover block">ENTER TACTICAL DASHBOARD</span>
                </button>
            </div>
        </div>
    </div>
);

const LogsScreen = ({ missions, onLogClick }: { missions: SavedMission[], onLogClick: (log: any) => void }) => (
    <div className="absolute inset-0 pt-32 pb-32 px-4 md:px-8 overflow-y-auto no-scrollbar animate-fade-in-up">
        <div className="max-w-[1400px] mx-auto space-y-4">
            <div className="flex items-center gap-3 mb-6">
                <FileText className="text-blue-500" size={24} />
                <h2 className="font-display text-2xl font-bold tracking-widest animate-typing overflow-hidden whitespace-nowrap border-r-2 border-blue-500 w-max">MISSION LOGS</h2>
            </div>
            {missions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-blue-500/50 border border-dashed border-blue-500/20 rounded-xl bg-[#0F172A]/30">
                    <Aperture className="mb-4 animate-spin-slow opacity-50" size={48} />
                    <p className="font-mono text-sm tracking-widest">[ ARCHIVE EMPTY - NO UPLINKS EXECUTED ]</p>
                </div>
            ) : (
                missions.map((log) => (
                    <div key={log.id} onClick={() => onLogClick(log)} className="flex flex-col md:flex-row items-start md:items-center bg-[#0F172A]/50 backdrop-blur-3xl border border-blue-900/50 border-t-blue-400/40 shadow-[inset_0_1px_20px_rgba(59,130,246,0.15)] rounded-xl p-4 group hover:bg-[#0F172A]/60 hover:border-blue-400/50 transition-all duration-500 ease-out cursor-crosshair">
                        <div className="w-full md:w-48 h-32 md:h-24 rounded bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-500 mb-4 md:mb-0 md:mr-6 border border-blue-500/20" style={{ backgroundImage: `url(${log.bg})` }}></div>
                        <div className="flex-1 w-full">
                            <span className={`font-mono text-[10px] border px-2 py-0.5 ${log.badge === 'CRITICAL' ? 'text-red-400 border-red-500/30 bg-red-500/10 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : log.badge === 'HIGH RISK' ? 'text-amber-400 border-amber-500/30 bg-amber-500/10 shadow-[0_0_10px_rgba(245,158,11,0.2)]' : 'text-blue-400 border-blue-500/30 bg-blue-500/10 shadow-[0_0_10px_rgba(59,130,246,0.2)]'}`}>{log.badge}</span>
                            <h3 className="font-display text-xl font-bold mt-2 group-hover:text-blue-400 transition-colors glitch-hover">{log.name}</h3>
                            <p className="font-mono text-[10px] text-slate-400 mt-1">DATE LOGGED: {log.date}</p>
                        </div>
                        <div className="hidden md:flex flex-col items-end opacity-50 group-hover:opacity-100 transition-opacity">
                            <FileText className="text-blue-400 mb-2" />
                            <span className="font-mono text-[9px] text-blue-400 tracking-widest">ACCESS RECORD</span>
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
);

const AboutScreen = () => (
    <div className="absolute inset-0 pt-32 pb-32 px-4 md:px-8 overflow-y-auto no-scrollbar animate-fade-in-up">
        <div className="max-w-[1400px] mx-auto grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-8 space-y-6">
                <div className="flex items-center gap-3">
                    <Fingerprint className="text-blue-500" size={24} />
                    <h2 className="font-display text-2xl font-bold tracking-widest animate-typing overflow-hidden whitespace-nowrap border-r-2 border-blue-500 w-max">AGENCY DIRECTIVE</h2>
                </div>
                <div className="bg-[#0F172A]/50 backdrop-blur-3xl border border-blue-900/50 border-t-blue-400/40 shadow-[inset_0_1px_20px_rgba(59,130,246,0.15)] rounded-xl p-8 font-sans text-slate-300 leading-relaxed text-sm relative group hover:bg-[#0F172A]/60 transition-colors">
                    <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-blue-500/20 rounded-tr-xl m-2 opacity-50"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-blue-500/20 rounded-bl-xl m-2 opacity-50"></div>
                    
                    <p className="mb-4 text-base"><span className="text-blue-400 font-bold">RESILIO</span> is the primary logistical and telemetry pipeline for the National Security Council's Special Malaysia Disaster Assistance and Rescue Team (SMART).</p>
                    <p className="mb-4">Designed to ingest demographic casualty reports, geospatial terrain disruption data, and severity metrics to orchestrate predictive supply chains dynamically across multi-vector crisis environments.</p>
                    <div className="mt-8 p-4 bg-red-900/10 border-l-2 border-red-500 font-mono text-xs text-red-400/80">
                        WARNING: All operations conducted through this terminal are monitored. Unauthorized access or dissemination of predictive nodes will result in immediate prosecution under the Official Secrets Act 1972.
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="bg-[#0F172A]/40 backdrop-blur-md border border-blue-900/50 border-t-blue-400/30 p-6 text-center rounded-xl group hover:bg-[#0F172A]/60 transition-all hover:-translate-y-1">
                        <Building2 className="mx-auto mb-3 text-blue-500 group-hover:scale-110 transition-transform" size={28} />
                        <span className="font-mono text-[10px] uppercase text-blue-300 tracking-widest">Structural USAR</span>
                    </div>
                    <div className="bg-[#0F172A]/40 backdrop-blur-md border border-blue-900/50 border-t-blue-400/30 p-6 text-center rounded-xl group hover:bg-[#0F172A]/60 transition-all hover:-translate-y-1">
                        <Mountain className="mx-auto mb-3 text-emerald-500 group-hover:scale-110 transition-transform" size={28} />
                        <span className="font-mono text-[10px] uppercase text-emerald-300 tracking-widest">High Angle</span>
                    </div>
                    <div className="bg-[#0F172A]/40 backdrop-blur-md border border-blue-900/50 border-t-blue-400/30 p-6 text-center rounded-xl group hover:bg-[#0F172A]/60 transition-all hover:-translate-y-1">
                        <Waves className="mx-auto mb-3 text-cyan-500 group-hover:scale-110 transition-transform" size={28} />
                        <span className="font-mono text-[10px] uppercase text-cyan-300 tracking-widest">Maritime Ops</span>
                    </div>
                </div>
            </div>
            
            <div className="col-span-12 lg:col-span-4 space-y-4 pt-12 lg:pt-0">
                <div className="bg-[#0F172A]/50 backdrop-blur-3xl border border-blue-900/50 border-t-blue-400/40 shadow-[inset_0_1px_20px_rgba(59,130,246,0.15)] rounded-xl p-6 flex flex-col justify-center items-center text-center group hover:bg-[#0F172A]/60 transition-all h-[140px] relative overflow-hidden">
                    <ShieldCheck className="text-blue-500/10 absolute w-32 h-32 pointer-events-none group-hover:text-blue-500/20 transition-colors group-hover:scale-110 duration-500" />
                    <h3 className="font-mono text-[10px] text-slate-400 mb-1 z-10 tracking-widest">CLASSIFICATION</h3>
                    <p className="font-display font-bold text-xl text-blue-400 z-10 glitch-hover">HEAVY USAR</p>
                </div>
                <div className="bg-[#0F172A]/50 backdrop-blur-3xl border border-emerald-900/50 border-t-emerald-400/40 shadow-[inset_0_1px_20px_rgba(16,185,129,0.15)] rounded-xl p-6 flex flex-col justify-center items-center text-center group hover:bg-[#0F172A]/60 transition-all h-[140px] relative overflow-hidden">
                    <Activity className="text-emerald-500/10 absolute w-32 h-32 pointer-events-none group-hover:text-emerald-500/20 transition-colors group-hover:scale-110 duration-500" />
                    <h3 className="font-mono text-[10px] text-slate-400 mb-1 z-10 tracking-widest">MOBILIZATION TIME</h3>
                    <p className="font-display font-bold text-xl text-emerald-400 z-10 glitch-hover">&lt; 2 HOURS</p>
                </div>
                <div className="bg-[#0F172A]/50 backdrop-blur-3xl border border-red-900/50 border-t-red-400/40 shadow-[inset_0_1px_20px_rgba(239,68,68,0.15)] rounded-xl p-6 flex flex-col justify-center items-center text-center group hover:bg-[#0F172A]/60 transition-all h-[140px] relative overflow-hidden">
                    <Shield className="text-red-500/10 absolute w-32 h-32 pointer-events-none group-hover:text-red-500/20 transition-colors group-hover:scale-110 duration-500" />
                    <h3 className="font-mono text-[10px] text-slate-400 mb-1 z-10 tracking-widest">AUTHORIZATION</h3>
                    <p className="font-display font-bold text-xl text-red-400 z-10 glitch-hover">NSC LEVEL 5</p>
                </div>
            </div>
        </div>
    </div>
);

const KpiBox = ({ title, value, color, pct, loading }: { title: string, value?: string | number, color: string, pct?: number, loading?: boolean }) => {
    const [displayValue, setDisplayValue] = useState<number | string>('---');
    
    useEffect(() => {
        if (typeof value === 'number') {
            let start = 0;
            const duration = 800;
            const stepTime = 20;
            const steps = duration / stepTime;
            const increment = value / steps;
            
            const timer = setInterval(() => {
                start += increment;
                if (start >= value) {
                    setDisplayValue(value);
                    clearInterval(timer);
                } else {
                    setDisplayValue(Math.floor(start));
                }
            }, stepTime);
            return () => clearInterval(timer);
        } else {
            setDisplayValue(value ?? '---');
        }
    }, [value]);

    return (
        <div className="bg-[#020617]/50 border border-blue-500/10 p-3 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: (pct || 0) > 80 ? '#EF4444' : (pct || 0) > 50 ? '#F59E0B' : '#3B82F6' }}></div>
            <p className="font-mono text-[9px] text-slate-400 uppercase ml-2">{title}</p>
            <div className="ml-2">
                {loading ? (
                    <div className="mt-1 h-6 w-20 bg-blue-500/20 animate-pulse border border-blue-500/30"></div>
                ) : (
                    <>
                        <p className={`font-mono text-lg font-bold ${color}`}>{displayValue}</p>
                        {value !== undefined && (
                            <div className="w-full h-1 bg-slate-800 mt-2 overflow-hidden">
                                <div className="h-full transition-all duration-1000 ease-out" style={{ width: `${Math.min(100, Math.max(5, pct || 0))}%`, backgroundColor: (pct || 0) > 80 ? '#EF4444' : (pct || 0) > 50 ? '#F59E0B' : '#3B82F6' }}></div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

interface SystemLog { id: string; time: string; msg: string; type: 'info' | 'warn' | 'error' | 'critical' }

interface SavedMission {
    id: string;
    name: string;
    date: string;
    badge: 'CRITICAL' | 'HIGH RISK' | 'DOMESTIC';
    bg: string;
    details: {
        location: string;
        personnel: number;
        status: string;
        coordinates?: { lat: number; lng: number };
        population?: number;
        severity?: number;
    }
}

export default function App() {
    const [screen, setScreen] = useState('welcome');
    const [selectedMission, setSelectedMission] = useState<any>(null);
    const [savedMissions, setSavedMissions] = useState<SavedMission[]>(() => {
        try {
            const localData = localStorage.getItem('resilio_saved_missions');
            return localData ? JSON.parse(localData) : [];
        } catch (e) {
            return [];
        }
    });
    
    useEffect(() => {
        localStorage.setItem('resilio_saved_missions', JSON.stringify(savedMissions));
    }, [savedMissions]);

    const [logs, setLogs] = useState<SystemLog[]>([]);
    const [toast, setToast] = useState<SystemLog | null>(null);

    const addLog = (msg: string, type: SystemLog['type'] = 'info') => {
        const newLog: SystemLog = {
            id: Math.random().toString(36).substr(2, 9),
            time: new Date().toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + '.' + Math.floor(Math.random()*999).toString().padStart(3, '0'),
            msg,
            type
        };
        setLogs(prev => [newLog, ...prev]);
        if (type === 'critical' || type === 'warn') {
            setToast(newLog);
            setTimeout(() => setToast(null), 5000);
        }
    };
    
    // Add initial log
    useEffect(() => {
        addLog('SYSTEM BOOT SEQUENCE COMPLETED', 'info');
    }, []);

    // Multi-disaster automated data
    const [activeDisasters, setActiveDisasters] = useState<any[]>([]);
    const [bnpbPolygons, setBnpbPolygons] = useState<any[]>([]);
    const [showBnpb, setShowBnpb] = useState(false);
    const [threatFilter, setThreatFilter] = useState<'ALL' | 'CRITICAL' | 'TSUNAMI'>('ALL');
    const [selectedId, setSelectedId] = useState<string>('');
    
    const [data, setData] = useState({
        disaster_type: 'Menunggu Data...',
        affected_population: 0,
        severity_level: 1,
    });
    const [predictedData, setPredictedData] = useState<any>(null);
    const [processing, setProcessing] = useState(false);
    const [dispatching, setDispatching] = useState(false);

    const filteredDisasters = activeDisasters.filter(d => {
        if (threatFilter === 'CRITICAL') return d.scale >= 3 || d.color === '#EF4444';
        if (threatFilter === 'TSUNAMI') return d.isTsunami;
        return true;
    });
    
    useEffect(() => {
        const loadData = async () => {
            let compiled: any[] = [];
            try {
                const bmkgRes = await fetch('/api/bmkg-terkini');
                const bmkgData = await bmkgRes.json();
                const gempaList = bmkgData?.Infogempa?.gempa || [];
                gempaList.slice(0, 10).forEach((g: any, idx: number) => {
                    const [lat, lng] = g.Coordinates.split(',').map(Number);
                    const mag = parseFloat(g.Magnitude);
                    const isTsunami = g.Potensi.toLowerCase().includes('tsunami') && !g.Potensi.toLowerCase().includes('tidak');
                    compiled.push({
                        id: `bmkg-${idx}`,
                        type: isTsunami ? 'Tsunami' : 'Gempa Bumi',
                        name: `Gempa ${g.Magnitude}M - ${g.Wilayah.split(' ').slice(1).join(' ')}`,
                        desc: `Waktu: ${g.Tanggal} ${g.Jam}\nKedalaman: ${g.Kedalaman}\nPotensi: ${g.Potensi}`,
                        lat,
                        lng,
                        scale: Math.max(1, Math.min(5, Math.floor(mag - 2))),
                        population: 0,
                        color: isTsunami ? '#A855F7' : '#EF4444',
                        isTsunami
                    });
                });
            } catch (e) { console.error(e); }

            try {
                const pbRes = await fetch('/api/petabencana-reports');
                const pbData = await pbRes.json();
                const reports = pbData?.result?.objects?.output?.geometries || [];
                
                reports.slice(0, 30).forEach((r: any) => {
                    const props = r.properties;
                    const coords = r.coordinates;
                    if (!props || !coords) return;
                    
                    let typeName = 'Bencana';
                    let color = '#ffffff';
                    let scale = 2;

                    if (props.disaster_type === 'flood') {
                        typeName = 'Banjir Bandang'; color = '#3B82F6'; scale = 3;
                    } else if (props.disaster_type === 'fire') {
                        typeName = 'Kebakaran'; color = '#F97316'; scale = 4;
                    } else if (props.disaster_type === 'landslide' || props.disaster_type === 'earthquake') {
                        typeName = props.disaster_type === 'landslide' ? 'Tanah Longsor' : 'Gempa Bumi'; 
                        color = props.disaster_type === 'landslide' ? '#A16207' : '#EF4444';
                        scale = 4;
                    } else {
                        return; // Skip unknown types
                    }

                    compiled.push({
                        id: `pb-${props.pkey}`,
                        type: typeName,
                        name: `${typeName} - ${props.tags?.city || 'Area ID ' + props.pkey}`,
                        desc: props.text || '',
                        lat: coords[1],
                        lng: coords[0],
                        scale: scale,
                        population: 0,
                        color: color
                    });
                });
            } catch (e) { console.error(e); }

            setActiveDisasters(compiled);
            
            try {
                // Fetch BNPB InaRISK ArcGIS REST Polygons for Regional Events
                const bnpbRes = await fetch('/api/bnpb-disasters');
                const bnpbJson = await bnpbRes.json();
                if (bnpbJson.features) {
                    const polygons = bnpbJson.features.map((f: any) => {
                        const rings = f.geometry?.rings;
                        if (!rings) return null;
                        
                        // Convert Esri coordinates [lng, lat] to Leaflet coordinates [lat, lng]
                        const leafletPolygons = rings.map((ring: number[][]) => 
                            ring.map(coord => [coord[1], coord[0]])
                        );
                        
                        const attrs = f.attributes || {};
                        let color = '#F59E0B'; // default warning orange
                        const cat = (attrs.kategori_bencana || '').toLowerCase();
                        if (cat.includes('banjir')) color = '#3B82F6'; // blue
                        else if (cat.includes('kebakaran')) color = '#F97316'; // orange/red
                        else if (cat.includes('longsor')) color = '#A16207'; // brown
                        else if (cat.includes('angin')) color = '#06B6D4'; // cyan
                        
                        return {
                            id: `bnpb-${attrs.ESRI_OID}`,
                            type: attrs.kategori_bencana || 'Bencana Regional',
                            name: attrs.kabupaten || 'Unknown Regency',
                            date: new Date(attrs.dt).toLocaleDateString(),
                            color: color,
                            positions: leafletPolygons,
                            attributes: attrs
                        };
                    }).filter(Boolean);
                    setBnpbPolygons(polygons);
                }
            } catch (e) { console.error("BNPB Fetch Error", e); }
            
            // Auto select first if none selected
            setSelectedId(prev => {
                if (!prev && compiled.length > 0) {
                    setData({
                        disaster_type: compiled[0].type,
                        affected_population: compiled[0].population,
                        severity_level: compiled[0].scale,
                    });
                    return compiled[0].id;
                }
                return prev;
            });
        };
        
        loadData();
        const interval = setInterval(loadData, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleMarkerClick = (d: any) => {
        setSelectedId(d.id);
        setData({
            disaster_type: d.type,
            affected_population: d.population,
            severity_level: d.scale
        });
        setPredictedData(null); // Reset prediction when changing selection
    };

    const predict = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedId) return;
        
        setProcessing(true);
        try {
            const selectedDisaster = activeDisasters.find(d => d.id === selectedId);
            const baseLat = selectedDisaster ? selectedDisaster.lat : -6.8166;
            const baseLng = selectedDisaster ? selectedDisaster.lng : 107.1416;
            
            // Dynamic radius based on severity scale (in km)
            const radiusKm = data.severity_level * 2.5; 
            
            // Fetch real population from WorldPop
            const realPopulation = await fetchPopulation(baseLat, baseLng, radiusKm);
            
            // Update local state to reflect reality
            setData(prev => ({ ...prev, affected_population: realPopulation }));

            const multiplier = data.severity_level * 1.35;

            // Fetch Tactical SitRep from Gemini
            let sitrepText = "- Unable to generate tactical briefing.\n- Proceed with standard protocols.";
            try {
                const sitrepRes = await fetch("/api/sitrep", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        type: selectedDisaster?.type || 'Unknown',
                        name: selectedDisaster?.name || 'Unknown Location',
                        severity: data.severity_level,
                        population: realPopulation
                    })
                });
                const sitrepData = await sitrepRes.json();
                if (sitrepData.sitrep) sitrepText = sitrepData.sitrep;
            } catch (e) {
                console.error("SitRep fetch failed", e);
            }

            setPredictedData({
                sitrep: sitrepText,
                requirements: {
                    clean_water_liters: Math.floor(realPopulation * 4.5 * multiplier),
                    medical_kits: Math.floor((realPopulation * 0.08) * data.severity_level),
                    blankets: Math.floor(realPopulation * 0.85 * (multiplier / 2)),
                    food_rations_tons: Number(((realPopulation * 2.5 * multiplier) / 1000).toFixed(2))
                },
                critical_drop_zones: [
                    { id: "Z-01", name: "Titik Alpha (Episentrum)", lat: baseLat + 0.01, lng: baseLng + 0.01, status: "KRITIS", color: "#EF4444" },
                    { id: "Z-02", name: "Titik Bravo (Evakuasi)", lat: baseLat - 0.02, lng: baseLng + 0.03, status: "SIAGA", color: "#3B82F6" },
                    { id: "Z-03", name: "Titik Charlie (Posko Aman)", lat: baseLat - 0.05, lng: baseLng - 0.02, status: "AMAN", color: "#10B981" },
                ]
            });
            
            setSavedMissions(prev => {
                const newMission: SavedMission = {
                    id: Math.random().toString(36).substring(7),
                    name: `OP ${selectedDisaster?.name || 'UNKNOWN TACTICAL TARGET'}`,
                    date: new Date().toISOString().split('T')[0],
                    badge: data.severity_level > 4 ? 'CRITICAL' : data.severity_level > 3 ? 'HIGH RISK' : 'DOMESTIC',
                    bg: selectedDisaster?.type?.toLowerCase().includes('banjir') || selectedDisaster?.type?.toLowerCase().includes('water') ? 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1600' : 'https://images.unsplash.com/photo-1613539246066-78db6ec47330?auto=format&fit=crop&q=80&w=1600',
                    details: {
                        location: selectedDisaster?.desc || 'Unknown Coordinates',
                        personnel: Math.floor(realPopulation * 0.01 * data.severity_level) || 120,
                        status: 'Active Evacuation',
                        coordinates: { lat: baseLat, lng: baseLng },
                        population: realPopulation,
                        severity: data.severity_level
                    }
                };
                return [newMission, ...prev];
            });
            addLog(`PREDICTIVE UPLINK COMPLETED: ${selectedDisaster?.name}`, 'info');
        } catch (err) {
            console.error(err);
        } finally {
            setProcessing(false);
        }
    };

    const executeDispatch = () => {
        if (!predictedData) return;
        
        setDispatching(true);
        const report = `// SMART TACTICAL DISPATCH //
OP TARGET: ${predictedData?.critical_drop_zones?.[0]?.name || 'UNKNOWN'}
SEVERITY: ${data.severity_level}/5
AFFECTED POP: ${data.affected_population.toLocaleString()}

--- LOGISTICS ---
WATER: ${predictedData.requirements.clean_water_liters} LTR
MED KITS: ${predictedData.requirements.medical_kits}
BLANKETS: ${predictedData.requirements.blankets}
FOOD: ${predictedData.requirements.food_rations_tons} TONS

--- AI SITREP ---
${predictedData.sitrep || 'AWAITING UPLINK'}

// END OF TRANSMISSION //`;

        navigator.clipboard.writeText(report);
        addLog('TACTICAL DISPATCH COPIED TO CLIPBOARD', 'warn');
        setTimeout(() => setDispatching(false), 2000);
    };

    const NavBtn = ({ icon: Icon, label, id }: { icon: any, label: string, id: string }) => (
        <button onClick={() => setScreen(id)} className={`flex items-center gap-2 font-display text-xs tracking-widest transition-colors cursor-crosshair ${screen === id ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`}>
            <Icon size={14} />
            <span className="hidden md:inline">{label}</span>
        </button>
    );

    return (
        <div className="h-screen w-screen overflow-hidden text-white bg-[#020617] cursor-crosshair font-sans relative selection:bg-blue-500/30">
            <style dangerouslySetInnerHTML={{ __html: GLOBAL_STYLES }} />
            
            {/* Base Layer z-0 */}
            <div className="absolute inset-0 bg-subtle-grid z-0"></div>
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] z-0 pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] z-0 pointer-events-none"></div>
            
            {/* Dynamic Screens */}
            <div className="relative z-30 h-full w-full">
                {screen === 'welcome' ? (
                    <WelcomeScreen onEnter={() => setScreen('dashboard')} />
                ) : (
                    <>
                        {/* Top Bar z-50 */}
                        <div className="absolute top-0 left-0 w-full h-8 bg-[#0F172A] border-b border-blue-500/20 z-50 flex items-center overflow-hidden">
                            <div className="animate-marquee font-mono text-[10px] text-blue-400 tracking-widest">
                                RESILIO PREDICTIVE LOGISTICS SYSTEM // SYSTEM ONLINE // SECURE CONNECTION ESTABLISHED // ENCRYPTION LEVEL: MIL-SPEC // AUTHORIZED PERSONNEL ONLY // 
                                RESILIO PREDICTIVE LOGISTICS SYSTEM // SYSTEM ONLINE // SECURE CONNECTION ESTABLISHED // ENCRYPTION LEVEL: MIL-SPEC // AUTHORIZED PERSONNEL ONLY //
                            </div>
                        </div>

                        {/* Main Header z-40 */}
                        <div className="absolute top-12 left-0 w-full px-4 md:px-8 z-40 flex justify-between items-center pointer-events-none">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#0F172A]/80 backdrop-blur-md border border-blue-500/30 flex items-center justify-center pointer-events-auto">
                                    <Shield className="text-blue-500" size={20} />
                                </div>
                                <div className="pointer-events-auto">
                                    <h1 className="font-display font-bold text-xl tracking-wider">RESILIO</h1>
                                    <p className="font-mono text-[9px] text-blue-400 tracking-[0.2em] uppercase hidden md:block">Predictive Relief Logistics</p>
                                </div>
                            </div>
                            <div className="pointer-events-auto flex items-center gap-4 bg-[#0F172A]/80 backdrop-blur-md border border-blue-500/30 px-4 py-2">
                                <Clock />
                                <div className="w-px h-4 bg-blue-500/30"></div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <span className="font-mono text-[10px] text-emerald-500 uppercase tracking-widest hidden md:inline">Online</span>
                                </div>
                            </div>
                        </div>

                        {/* Main Content Area */}
                        {screen === 'dashboard' && (
                            <div className="absolute inset-0 pt-[80px] md:pt-32 pb-24 md:pb-32 overflow-y-auto overflow-x-hidden no-scrollbar animate-fade-in-up">
                                <div className="max-w-[1400px] mx-auto flex flex-col lg:grid lg:grid-cols-12 gap-4 h-full md:min-h-[600px] px-0 md:px-8">
                                    
                                    {/* Card 1: Active Deployments / Map */}
                                    <div className="lg:col-span-8 lg:row-span-4 bg-[#0F172A]/50 backdrop-blur-3xl border-b border-t-0 md:border border-blue-900/50 border-t-blue-400/40 shadow-[inset_0_1px_20px_rgba(59,130,246,0.15)] md:rounded-xl overflow-hidden relative group md:hover:bg-[#0F172A]/60 md:hover:border-blue-400/50 transition-all duration-500 ease-out h-[50vh] lg:h-auto lg:min-h-[400px]">
                                        
                                        {processing && (
                                            <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-[2px] pointer-events-none overflow-hidden">
                                                <div className="w-[1200px] h-[1200px] absolute animate-radar opacity-60 mix-blend-screen"></div>
                                                <div className="relative z-10 font-mono font-bold text-blue-400 bg-[#020617]/80 px-4 py-2 border border-blue-500/50 flex items-center gap-2">
                                                    <Loader2 className="animate-spin" size={16} /> GEO-DEMOGRAPHIC SCAN IN PROGRESS...
                                                </div>
                                            </div>
                                        )}

                                        <div className="absolute inset-0 z-0 opacity-80 mix-blend-screen pointer-events-auto">
                                            <MapContainer 
                                                center={[-2.5, 118.0]} 
                                                zoom={5} 
                                                style={{ height: '100%', width: '100%', backgroundColor: 'transparent' }}
                                                zoomControl={false}
                                                attributionControl={false}
                                            >
                                                <ZoomControl position="bottomright" />
                                                <TileLayer
                                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                />
                                                {filteredDisasters.map(d => (
                                                    <React.Fragment key={d.id}>
                                                        <Marker 
                                                            position={[d.lat, d.lng]} 
                                                            icon={createIcon(d.color, d.isTsunami)}
                                                            eventHandlers={{ click: () => handleMarkerClick(d) }}
                                                        >
                                                            <Popup className="cyber-popup" closeButton={false}>
                                                                <div className="bg-[#020617]/90 border border-blue-500/50 p-3 backdrop-blur-md cursor-crosshair max-w-[280px]">
                                                                    <div className="font-mono">
                                                                        <p className="text-xs font-bold" style={{ color: d.color }}>{d.name}</p>
                                                                        <p className="text-[10px] text-slate-300 mt-1">SKALA: {d.scale}</p>
                                                                        <p className="text-[10px] text-slate-300 border-b border-slate-700/50 pb-2 mb-2">EST. POPULASI: {d.population || 'UNSCANNED'}</p>
                                                                    </div>
                                                                    {d.desc && (
                                                                        <div className="font-sans text-[10px] leading-relaxed text-slate-300 max-h-[100px] overflow-y-auto no-scrollbar whitespace-pre-line">
                                                                            {d.desc}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </Popup>
                                                        </Marker>
                                                        {d.type === 'Gempa Bumi' && (
                                                            <CircleMarker 
                                                                center={[d.lat, d.lng]} 
                                                                radius={d.scale * 8}
                                                                pathOptions={{ color: d.color, fillColor: d.color, fillOpacity: 0.1, weight: 1 }}
                                                            />
                                                        )}
                                                    </React.Fragment>
                                                ))}
                                                {showBnpb && bnpbPolygons.map(p => (
                                                    <Polygon 
                                                        key={p.id}
                                                        positions={p.positions}
                                                        pathOptions={{ color: p.color, fillColor: p.color, fillOpacity: 0.2, weight: 1.5 }}
                                                    >
                                                        <Popup className="cyber-popup" closeButton={false}>
                                                            <div className="bg-[#020617]/90 border border-slate-500/50 p-3 backdrop-blur-md cursor-crosshair max-w-[280px]">
                                                                <div className="font-mono">
                                                                    <p className="text-xs font-bold" style={{ color: p.color }}>{p.type.toUpperCase()}</p>
                                                                    <p className="text-[10px] text-slate-300 mt-1">{p.name.toUpperCase()}</p>
                                                                    <p className="text-[9px] text-slate-400 mt-1 mb-2 border-b border-slate-700/50 pb-2">{p.date}</p>
                                                                </div>
                                                                {(p.attributes?.kronologis || p.attributes?.kondisi_mutakhir) && (
                                                                    <div className="font-sans text-[10px] leading-relaxed text-slate-300 max-h-[150px] overflow-y-auto no-scrollbar space-y-2">
                                                                        {p.attributes?.kronologis && <p><strong className="text-slate-400">Kronologis:</strong> {p.attributes.kronologis}</p>}
                                                                        {p.attributes?.kondisi_mutakhir && <p><strong className="text-slate-400">Kondisi Mutakhir:</strong> {p.attributes.kondisi_mutakhir}</p>}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </Popup>
                                                    </Polygon>
                                                ))}
                                                {predictedData && predictedData.critical_drop_zones.map((zone: any, idx: number) => (
                                                    <React.Fragment key={idx}>
                                                        <Marker position={[zone.lat, zone.lng]} icon={createIcon(zone.color, true)}>
                                                            <Popup className="cyber-popup" closeButton={false}>
                                                                <div className="bg-[#020617]/90 border p-2 backdrop-blur-md font-mono" style={{ borderColor: zone.color }}>
                                                                    <p className="text-xs font-bold" style={{ color: zone.color }}>{zone.name}</p>
                                                                    <p className="text-[9px] text-slate-300">{zone.status}</p>
                                                                </div>
                                                            </Popup>
                                                        </Marker>
                                                    </React.Fragment>
                                                ))}
                                            </MapContainer>
                                        </div>
                                        
                                        <div className="absolute inset-0 p-6 flex flex-col pointer-events-none">
                                            <div className="flex justify-between items-start">
                                                <div className="pointer-events-auto">
                                                    <h2 className="font-display text-lg font-semibold tracking-widest flex items-center gap-2 drop-shadow-md">
                                                        <MapPin className="text-blue-500" size={18} />
                                                        LIVE TACTICAL MAP (ID)
                                                    </h2>
                                                    <div className="flex gap-2 mt-2">
                                                        <button onClick={() => setThreatFilter('ALL')} className={`font-mono text-[9px] px-2 py-1 border transition-colors ${threatFilter === 'ALL' ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-[#020617]/50 border-slate-700 text-slate-400 hover:border-slate-500'}`}>ALL</button>
                                                        <button onClick={() => setThreatFilter('CRITICAL')} className={`font-mono text-[9px] px-2 py-1 border transition-colors ${threatFilter === 'CRITICAL' ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-[#020617]/50 border-slate-700 text-slate-400 hover:border-slate-500'}`}>CRITICAL ONLY</button>
                                                        <button onClick={() => setThreatFilter('TSUNAMI')} className={`font-mono text-[9px] px-2 py-1 border transition-colors ${threatFilter === 'TSUNAMI' ? 'bg-purple-500/20 border-purple-500 text-purple-400' : 'bg-[#020617]/50 border-slate-700 text-slate-400 hover:border-slate-500'}`}>TSUNAMI</button>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-2 pointer-events-auto">
                                                    {predictedData && <span className="font-mono text-[10px] bg-blue-500/80 text-white border border-blue-400 px-2 py-1 shadow-lg backdrop-blur-sm animate-pulse">UPLINK ACTIVE</span>}
                                                    <button 
                                                        onClick={() => setShowBnpb(!showBnpb)}
                                                        className={`font-mono text-[9px] px-2 py-1 border transition-colors ${showBnpb ? 'bg-orange-500/20 border-orange-500 text-orange-400' : 'bg-[#020617]/50 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                                                    >
                                                        BNPB REGIONAL RISK LAYER {showBnpb ? '[ON]' : '[OFF]'}
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            <div className="flex-1 relative">
                                                {!predictedData && (
                                                    <div className="absolute bottom-0 right-0">
                                                        <p className="font-mono text-[10px] bg-slate-900/80 text-slate-300 tracking-[0.1em] text-center px-4 py-2 border border-slate-700 backdrop-blur-md">AWAITING PREDICTION PARAMETERS</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Responsive Bottom Sheet Wrapper for Mobile */}
                                    <div className="flex flex-col lg:contents gap-4 px-4 md:px-0 z-10 pb-10">
                                        {/* Card 2: Form */}
                                        <div className="col-span-12 lg:col-span-4 row-span-2 bg-[#0F172A]/60 lg:bg-[#0F172A]/50 backdrop-blur-3xl border border-blue-900/50 border-t-blue-400/40 shadow-[inset_0_1px_20px_rgba(59,130,246,0.15)] rounded-xl p-6 relative group lg:hover:bg-[#0F172A]/60 lg:hover:border-blue-400/50 transition-all duration-500 ease-out">
                                        <Fingerprint className="absolute -right-10 -bottom-10 w-48 h-48 text-blue-500 opacity-5 pointer-events-none" />
                                        <h2 className="font-display text-sm font-semibold tracking-widest mb-4 flex items-center gap-2">
                                            <FileKey className="text-blue-500" size={16} />
                                            PREDICTION DIRECTIVE
                                        </h2>
                                        <form onSubmit={predict} className="space-y-4 relative z-10">
                                            <div>
                                                <label className="font-mono text-[9px] text-slate-400 uppercase tracking-widest mb-1 block">Titik Bencana Aktif</label>
                                                <div className="relative group/input">
                                                    <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-blue-500/50 pointer-events-none transition-colors group-focus-within/input:border-blue-400"></div>
                                                    <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-blue-500/50 pointer-events-none transition-colors group-focus-within/input:border-blue-400"></div>
                                                    <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-blue-500/50 pointer-events-none transition-colors group-focus-within/input:border-blue-400"></div>
                                                    <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-blue-500/50 pointer-events-none transition-colors group-focus-within/input:border-blue-400"></div>
                                                    <select value={selectedId} onChange={e => {
                                                        const d = activeDisasters.find(x => x.id === e.target.value);
                                                        if(d) handleMarkerClick(d);
                                                    }} className="w-full bg-transparent border-b border-blue-500/30 text-white text-xs font-mono p-2 outline-none focus:border-blue-400 focus:bg-blue-900/10 focus:shadow-[0_1px_10px_rgba(59,130,246,0.2)] transition-all cursor-crosshair appearance-none rounded-none">
                                                        {filteredDisasters.length === 0 && <option value="" className="bg-[#020617]">Mencari Satelit...</option>}
                                                        {filteredDisasters.map(d => (
                                                            <option key={d.id} value={d.id} className="bg-[#020617]">{d.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="font-mono text-[9px] text-slate-400 uppercase tracking-widest mb-1 block">Populasi</label>
                                                    <div className="relative group/input">
                                                        <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-blue-500/50 pointer-events-none transition-colors group-focus-within/input:border-blue-400"></div>
                                                        <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-blue-500/50 pointer-events-none transition-colors group-focus-within/input:border-blue-400"></div>
                                                        <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-blue-500/50 pointer-events-none transition-colors group-focus-within/input:border-blue-400"></div>
                                                        <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-blue-500/50 pointer-events-none transition-colors group-focus-within/input:border-blue-400"></div>
                                                        <input type="text" value={data.affected_population || ''} placeholder="UNSCANNED" onChange={e => setData({...data, affected_population: parseInt(e.target.value) || 0})} className="w-full bg-transparent border-b border-blue-500/30 text-white text-xs font-mono p-2 outline-none focus:border-blue-400 focus:bg-blue-900/10 focus:shadow-[0_1px_10px_rgba(59,130,246,0.2)] transition-all cursor-crosshair placeholder:text-slate-600 rounded-none" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="font-mono text-[9px] text-slate-400 uppercase tracking-widest mb-1 block">Skala (1-5)</label>
                                                    <div className="relative group/input">
                                                        <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-blue-500/50 pointer-events-none transition-colors group-focus-within/input:border-blue-400"></div>
                                                        <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-blue-500/50 pointer-events-none transition-colors group-focus-within/input:border-blue-400"></div>
                                                        <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-blue-500/50 pointer-events-none transition-colors group-focus-within/input:border-blue-400"></div>
                                                        <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-blue-500/50 pointer-events-none transition-colors group-focus-within/input:border-blue-400"></div>
                                                        <input type="number" min="1" max="5" value={data.severity_level} onChange={e => setData({...data, severity_level: parseInt(e.target.value) || 1})} className="w-full bg-transparent border-b border-blue-500/30 text-white text-xs font-mono p-2 outline-none focus:border-blue-400 focus:bg-blue-900/10 focus:shadow-[0_1px_10px_rgba(59,130,246,0.2)] transition-all cursor-crosshair rounded-none" />
                                                    </div>
                                                </div>
                                            </div>
                                            <button type="submit" disabled={processing} className="w-full bg-blue-900/20 hover:bg-blue-600/30 border border-blue-500/50 text-blue-400 hover:text-white hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] active:translate-y-[1px] active:shadow-none text-xs font-display font-bold py-3 uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-crosshair group relative overflow-hidden mt-2">
                                                {processing ? <Activity size={14} className="animate-spin" /> : <Aperture size={14} className="group-hover:rotate-90 transition-transform duration-500" />}
                                                <span className="relative z-10 glitch-hover block">{processing ? 'SCANNING DEMOGRAPHICS...' : 'EXECUTE UPLINK'}</span>
                                            </button>
                                        </form>
                                    </div>

                                    {/* Card 3: Status / KPIs */}
                                    <div className="col-span-12 lg:col-span-4 row-span-2 bg-[#0F172A]/60 lg:bg-[#0F172A]/50 backdrop-blur-3xl border border-blue-900/50 border-t-blue-400/40 shadow-[inset_0_1px_20px_rgba(59,130,246,0.15)] rounded-xl p-6 relative group lg:hover:bg-[#0F172A]/60 lg:hover:border-blue-400/50 transition-all duration-500 ease-out flex flex-col">
                                        <h2 className="font-display text-sm font-semibold tracking-widest mb-4 flex items-center gap-2">
                                            <Signal className="text-blue-500" size={16} />
                                            LOGISTICS OUTPUT
                                        </h2>
                                        <div className="flex-1 relative flex flex-col justify-center">
                                            {!predictedData && !processing ? (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center text-blue-500/30 border border-dashed border-blue-500/20 bg-blue-900/5 rounded p-4 text-center">
                                                    <Aperture className="mb-2 animate-spin-slow opacity-50" size={32} />
                                                    <p className="font-mono text-[9px] tracking-[0.2em]">[ AWAITING UPLINK ]</p>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col h-full gap-3 overflow-y-auto no-scrollbar">
                                                    <div className="grid grid-cols-2 gap-3 shrink-0">
                                                        <KpiBox title="WATER (LTR)" value={predictedData?.requirements?.clean_water_liters} color={predictedData && data.severity_level > 4 ? "text-red-400" : "text-blue-400"} pct={predictedData ? (data.severity_level / 5) * 100 : 0} loading={processing} />
                                                        <KpiBox title="MEDICAL (KIT)" value={predictedData?.requirements?.medical_kits} color={predictedData && data.severity_level > 3 ? "text-red-400" : "text-amber-400"} pct={predictedData ? Math.min(100, (data.severity_level / 5) * 100 + 15) : 0} loading={processing} />
                                                        <KpiBox title="BLANKETS (UNT)" value={predictedData?.requirements?.blankets} color={predictedData && data.severity_level > 4 ? "text-red-400" : "text-emerald-400"} pct={predictedData ? Math.max(10, (data.severity_level / 5) * 100 - 15) : 0} loading={processing} />
                                                        <KpiBox title="FOOD (TON)" value={predictedData?.requirements?.food_rations_tons} color={predictedData && data.severity_level > 4 ? "text-red-400" : "text-orange-400"} pct={predictedData ? (data.severity_level / 5) * 100 : 0} loading={processing} />
                                                    </div>
                                                    
                                                    {predictedData?.sitrep && (
                                                        <div className="bg-[#020617]/50 border border-blue-500/30 p-3 flex-1 overflow-y-auto no-scrollbar">
                                                            <h3 className="font-mono text-[9px] text-blue-400 mb-2 uppercase tracking-widest flex items-center gap-1"><Cpu size={10} /> TACTICAL SITREP</h3>
                                                            <div className="font-mono text-[10px] text-slate-300 whitespace-pre-line leading-relaxed">
                                                                {predictedData.sitrep}
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    <button
                                                        onClick={(e) => { e.preventDefault(); executeDispatch(); }}
                                                        className="w-full bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 text-blue-400 py-3 font-mono text-[10px] tracking-widest transition-all mt-auto shrink-0 flex justify-center items-center gap-2"
                                                    >
                                                        {dispatching ? <Check size={14} className="text-emerald-400" /> : <UploadCloud size={14} />}
                                                        {dispatching ? 'DISPATCHED TO PROTOCOL' : 'EXECUTE DISPATCH'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                        {/* Card 4: Archive (Terminal) */}
                                        <div className="col-span-12 lg:col-span-12 row-span-2 bg-[#0F172A]/80 lg:bg-[#0F172A]/50 backdrop-blur-3xl border border-blue-900/50 border-t-blue-400/40 shadow-[inset_0_1px_20px_rgba(59,130,246,0.15)] rounded-xl overflow-hidden relative group lg:hover:bg-[#0F172A]/60 lg:hover:border-blue-400/50 transition-all duration-500 ease-out h-[200px] flex flex-col">
                                            <div className="p-3 border-b border-blue-900/50 bg-[#0F172A]/80 flex items-center justify-between">
                                                <h2 className="font-display text-xs font-semibold tracking-widest flex items-center gap-2">
                                                    <Fingerprint className="text-blue-500" size={14} />
                                                    LIVE EVENT LOG
                                                </h2>
                                                <div className="flex gap-1">
                                                    <div className="w-2 h-2 rounded-full bg-red-500/50 animate-pulse"></div>
                                                    <div className="w-2 h-2 rounded-full bg-amber-500/50"></div>
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500/50"></div>
                                                </div>
                                            </div>
                                            <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-2 font-mono text-[10px]">
                                                {logs.map(log => (
                                                    <div key={log.id} className="flex gap-3">
                                                        <span className="text-slate-500">[{log.time}]</span>
                                                        <span className={log.type === 'critical' || log.type === 'error' ? 'text-red-400' : log.type === 'warn' ? 'text-amber-400' : 'text-blue-400'}>{log.msg}</span>
                                                    </div>
                                                ))}
                                                {logs.length === 0 && <div className="text-slate-600 italic">Awaiting telemetry...</div>}
                                            </div>
                                        </div>
                                    </div>
                                    
                                </div>
                            </div>
                        )}

                        {screen === 'logs' && <LogsScreen missions={savedMissions} onLogClick={(log) => setSelectedMission(log)} />}
                        {screen === 'about' && <AboutScreen />}

                        {/* Navigation Dock z-50 */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#0F172A]/80 backdrop-blur-md border border-blue-500/30 rounded-full px-6 py-3 flex items-center gap-4 md:gap-8 overflow-x-auto w-max max-w-[90vw] no-scrollbar">
                            <NavBtn id="dashboard" icon={LayoutDashboard} label="DASHBOARD" />
                            <NavBtn id="logs" icon={FileText} label="LOGS" />
                            <NavBtn id="about" icon={Fingerprint} label="ABOUT" />
                        </div>

                        {/* Tactical Threat Toast */}
                        {toast && (
                            <div className="fixed top-20 right-8 z-[100] animate-fade-in-up pointer-events-none">
                                <div className={`bg-[#020617]/90 backdrop-blur-md border p-4 shadow-[0_0_30px_rgba(239,68,68,0.3)] ${toast.type === 'critical' || toast.type === 'error' ? 'border-red-500' : 'border-amber-500'}`}>
                                    <h4 className={`font-display text-xs font-bold tracking-widest mb-1 ${toast.type === 'critical' || toast.type === 'error' ? 'text-red-500' : 'text-amber-500'}`}>
                                        {toast.type === 'critical' ? 'CRITICAL THREAT LEVEL DETECTED' : toast.type === 'error' ? 'SYSTEM ERROR' : 'HIGH RISK ALERT'}
                                    </h4>
                                    <p className="font-mono text-[10px] text-slate-300">{toast.msg}</p>
                                </div>
                            </div>
                        )}

                        {/* Mission Modal z-[100] */}
                        {selectedMission && (
                            <div className="absolute inset-0 z-[100] bg-black/80 flex flex-col items-center justify-center p-4">
                                <div className="bg-[#0F172A]/90 backdrop-blur-24px border border-blue-500/30 rounded-xl p-6 md:p-8 max-w-2xl w-full relative">
                                    <button onClick={() => setSelectedMission(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
                                        <X size={24} />
                                    </button>
                                    
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="w-full md:w-1/2 h-48 md:h-64 rounded bg-cover bg-center border border-blue-500/20" style={{ backgroundImage: `url(${selectedMission.bg})` }}></div>
                                        <div className="flex-1">
                                            <span className={`font-mono text-[10px] border px-2 py-0.5 ${selectedMission.badge === 'CRITICAL' ? 'text-red-400 border-red-500/30 bg-red-500/10' : selectedMission.badge === 'HIGH RISK' ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' : 'text-blue-400 border-blue-500/30 bg-blue-500/10'}`}>{selectedMission.badge}</span>
                                            <h2 className="font-display text-2xl font-bold mt-4 tracking-widest">{selectedMission.name}</h2>
                                            <p className="font-mono text-xs text-blue-400 mt-1 mb-6">DATE: {selectedMission.date}</p>
                                            
                                            <div className="space-y-4 font-mono text-xs text-slate-300">
                                                <div className="flex justify-between border-b border-blue-500/20 pb-2">
                                                    <span className="text-slate-500">LOCATION</span>
                                                    <span>{selectedMission.details?.location}</span>
                                                </div>
                                                <div className="flex justify-between border-b border-blue-500/20 pb-2">
                                                    <span className="text-slate-500">PERSONNEL</span>
                                                    <span>{selectedMission.details?.personnel} ACTIVE UNITS</span>
                                                </div>
                                                <div className="flex justify-between border-b border-blue-500/20 pb-2">
                                                    <span className="text-slate-500">STATUS</span>
                                                    <span className={selectedMission.badge === 'CRITICAL' ? 'text-red-400' : 'text-emerald-400'}>{selectedMission.details?.status}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
