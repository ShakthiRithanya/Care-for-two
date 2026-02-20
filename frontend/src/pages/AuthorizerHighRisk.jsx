import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { AlertTriangle, MapPin, Search, Phone, ArrowRight, User, ShieldAlert, Baby, Heart, Calendar, Syringe, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// ── Colour palettes ──────────────────────────────────────────────────────────
// PREGNANT  → violet / purple
// POST-DELIVERY (mother) → teal / emerald
// CHILD connection → amber / orange

const PREGNANT_THEME = {
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    ring: 'ring-violet-100',
    icon: 'bg-violet-100 text-violet-600',
    badge: 'bg-violet-100 text-violet-700 border-violet-200',
    bar: 'from-violet-400 to-violet-600',
    accent: 'text-violet-600',
    label: 'Pregnant',
    dot: 'bg-violet-500',
};

const DELIVERY_THEME = {
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    ring: 'ring-teal-100',
    icon: 'bg-teal-100 text-teal-600',
    badge: 'bg-teal-100 text-teal-700 border-teal-200',
    bar: 'from-teal-400 to-teal-600',
    accent: 'text-teal-600',
    label: 'Post-Delivery',
    dot: 'bg-teal-500',
};

const AuthorizerHighRisk = () => {
    const [highRisk, setHighRisk] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all'); // 'all' | 'Pregnancy' | 'Delivery'
    const [selectedCase, setSelectedCase] = useState(null);

    const userState = JSON.parse(localStorage.getItem('maatri_user') || '{}').state || null;

    const fetchData = async () => {
        try {
            setLoading(true);
            const params = userState ? { state: userState } : {};
            const res = await axios.get('http://localhost:8000/api/authorizer/highrisk', { params });
            setHighRisk(res.data);
        } catch (error) {
            console.error("Error fetching high risk data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const filtered = highRisk
        .filter(hr => {
            const matchSearch =
                hr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                hr.district.toLowerCase().includes(searchTerm.toLowerCase());
            const matchType = filterType === 'all' || hr.type === filterType;
            return matchSearch && matchType;
        })
        .sort((a, b) => (b.score || 0) - (a.score || 0));

    const pregnantCount = highRisk.filter(h => h.type === 'Pregnancy').length;
    const deliveryCount = highRisk.filter(h => h.type === 'Delivery').length;

    if (loading) return (
        <div className="p-20 text-center">
            <div className="inline-flex items-center gap-3 font-bold text-slate-400 italic animate-pulse">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                Curating Critical Patient List...
            </div>
        </div>
    );

    return (
        <DashboardLayout
            roleTitle="Critical Priority Registry"
            roleIcon={<AlertTriangle className="w-6 h-6 text-rose-600" />}
            roleColor="bg-rose-50"
        >
            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 py-6 border-b border-slate-100 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">High-Risk Beneficiaries</h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">
                        Priority list sorted by AI risk score — colour-coded by maternal status.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {/* Legend */}
                    <div className="flex items-center gap-2 px-3 py-2 bg-violet-50 border border-violet-100 rounded-full text-[10px] font-black text-violet-600 uppercase tracking-widest">
                        <div className="w-2 h-2 rounded-full bg-violet-500" /> Pregnant · {pregnantCount}
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-teal-50 border border-teal-100 rounded-full text-[10px] font-black text-teal-600 uppercase tracking-widest">
                        <div className="w-2 h-2 rounded-full bg-teal-500" /> Post-Delivery · {deliveryCount}
                    </div>
                </div>
            </div>

            {/* ── Filter bar ──────────────────────────────────────────────── */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
                {[
                    { id: 'all', label: `All (${highRisk.length})` },
                    { id: 'Pregnancy', label: `Pregnant (${pregnantCount})` },
                    { id: 'Delivery', label: `Post-Delivery (${deliveryCount})` },
                ].map(f => (
                    <button
                        key={f.id}
                        onClick={() => setFilterType(f.id)}
                        className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all
                            ${filterType === f.id
                                ? f.id === 'Pregnancy' ? 'bg-violet-600 text-white border-violet-600 shadow-lg shadow-violet-100'
                                    : f.id === 'Delivery' ? 'bg-teal-600 text-white border-teal-600 shadow-lg shadow-teal-100'
                                        : 'bg-slate-900 text-white border-slate-900'
                                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                            }`}
                    >{f.label}</button>
                ))}
                <div className="relative ml-auto">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search name or district..."
                        className="pl-11 pr-5 py-2.5 bg-white border border-slate-200 rounded-full text-xs font-bold outline-none focus:ring-2 focus:ring-slate-200 transition-all w-56"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="px-4 py-2 bg-rose-50 text-rose-600 rounded-full text-[10px] font-black border border-rose-100 uppercase tracking-widest">
                    {filtered.length} Critical Cases
                </div>
            </div>

            {/* ── Cards grid ──────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((hr, idx) => {
                    const isPregnant = hr.type === 'Pregnancy';
                    const theme = isPregnant ? PREGNANT_THEME : DELIVERY_THEME;
                    const hasChildren = hr.children && hr.children.length > 0;

                    return (
                        <motion.div
                            key={`${hr.type}-${hr.id}`}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            className={`rounded-[2rem] border-2 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden
                                ${theme.border} ${idx === 0 ? `ring-4 ${theme.ring}` : ''}
                                bg-white`}
                        >
                            {/* Top colour strip */}
                            <div className={`h-1.5 w-full ${isPregnant ? 'bg-gradient-to-r from-violet-400 to-purple-500' : 'bg-gradient-to-r from-teal-400 to-emerald-500'}`} />

                            <div className="p-6">
                                {/* Rank + type badge row */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black
                                        ${idx === 0 ? 'bg-rose-600 text-white' : idx === 1 ? 'bg-rose-400 text-white' : idx === 2 ? 'bg-rose-200 text-rose-700' : 'bg-slate-100 text-slate-500'}`}>
                                        #{idx + 1}
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5 ${theme.badge}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${theme.dot}`} />
                                        {isPregnant ? '🤰 Pregnant' : '👩 Post-Delivery'}
                                    </span>
                                </div>

                                {/* Icon + name */}
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${theme.icon}`}>
                                        {isPregnant ? <Heart className="w-5 h-5" /> : <User className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-slate-900 leading-tight">{hr.name}</h3>
                                        <div className="flex items-center gap-1 text-slate-400 mt-0.5">
                                            <MapPin className="w-3 h-3" />
                                            <span className="text-[10px] font-bold uppercase tracking-wide">{hr.block}, {hr.district}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Date info */}
                                <div className="flex items-center gap-2 mb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    <Calendar className="w-3 h-3" />
                                    {isPregnant
                                        ? hr.edd ? `EDD: ${hr.edd}` : 'EDD: Not set'
                                        : hr.delivery_date ? `Delivered: ${hr.delivery_date}` : 'Delivery date unknown'
                                    }
                                    {!isPregnant && hr.delivery_type && (
                                        <span className="ml-1 px-2 py-0.5 bg-slate-100 rounded-full text-slate-500">{hr.delivery_type}</span>
                                    )}
                                </div>

                                {/* Risk score bar */}
                                <div className={`p-4 rounded-2xl mb-4 border ${isPregnant ? 'bg-violet-50 border-violet-100' : 'bg-teal-50 border-teal-100'}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">AI Risk Score</div>
                                        <div className={`text-xl font-black ${theme.accent}`}>{(hr.score * 100).toFixed(0)}%</div>
                                    </div>
                                    <div className="w-full h-2 bg-white rounded-full overflow-hidden shadow-inner">
                                        <div
                                            className={`h-full rounded-full bg-gradient-to-r ${theme.bar} transition-all`}
                                            style={{ width: `${(hr.score * 100).toFixed(0)}%` }}
                                        />
                                    </div>
                                </div>

                                {/* ── Child connection panel (POST-DELIVERY only) ── */}
                                {!isPregnant && hasChildren && (
                                    <div className="mb-4 rounded-2xl border-2 border-amber-200 bg-amber-50 overflow-hidden">
                                        {/* Connector header */}
                                        <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 border-b border-amber-200">
                                            <div className="w-px h-4 bg-amber-400 mx-1" />
                                            <Baby className="w-3.5 h-3.5 text-amber-600" />
                                            <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest">
                                                {hr.children.length} Child{hr.children.length > 1 ? 'ren' : ''} Linked
                                            </span>
                                        </div>
                                        <div className="px-4 py-3 space-y-2">
                                            {hr.children.map((child, ci) => (
                                                <div key={ci} className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-lg bg-amber-200 flex items-center justify-center text-[9px] font-black text-amber-700">
                                                            {child.sex === 'Male' ? '♂' : child.sex === 'Female' ? '♀' : '?'}
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-700">{child.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex items-center gap-1">
                                                            <Syringe className="w-3 h-3 text-amber-500" />
                                                            <span className="text-[9px] font-bold text-slate-500">
                                                                {child.immunizations_completed}/{child.immunizations_expected}
                                                            </span>
                                                        </div>
                                                        {child.offtrack ? (
                                                            <span className="px-2 py-0.5 bg-rose-100 text-rose-600 rounded-full text-[8px] font-black uppercase">Off-Track</span>
                                                        ) : (
                                                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded-full text-[8px] font-black uppercase">On-Track</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Pregnant — no child yet, show placeholder */}
                                {isPregnant && (
                                    <div className="mb-4 rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50/50 px-4 py-3 flex items-center gap-2">
                                        <Baby className="w-4 h-4 text-violet-300" />
                                        <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Child not yet born</span>
                                    </div>
                                )}

                                {/* Action button */}
                                <button
                                    onClick={() => setSelectedCase(hr)}
                                    className={`w-full py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95
                                        ${isPregnant
                                            ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-100'
                                            : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-100'
                                        }`}
                                >
                                    Initiate Contact Protocol <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* ── Contact modal ────────────────────────────────────────────── */}
            <AnimatePresence>
                {selectedCase && (
                    <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full relative"
                        >
                            <button
                                onClick={() => setSelectedCase(null)}
                                className="absolute top-4 right-4 p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors"
                            >
                                <X className="w-4 h-4 text-slate-400" />
                            </button>

                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto
                                ${selectedCase.type === 'Pregnancy' ? 'bg-violet-100' : 'bg-teal-100'}`}>
                                <Phone className={`w-8 h-8 animate-pulse ${selectedCase.type === 'Pregnancy' ? 'text-violet-600' : 'text-teal-600'}`} />
                            </div>

                            <h2 className="text-2xl font-black text-slate-900 text-center mb-1">Contact Protocol Initiated</h2>
                            <p className="text-slate-500 text-center text-sm mb-6">Connecting secure line to beneficiary...</p>

                            <div className="bg-slate-50 p-5 rounded-2xl mb-6 text-center border border-slate-100">
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Beneficiary</div>
                                <div className="text-xl font-black text-slate-900 mb-1">{selectedCase.name}</div>
                                <div className={`text-[10px] font-black uppercase tracking-widest mb-4 ${selectedCase.type === 'Pregnancy' ? 'text-violet-500' : 'text-teal-500'}`}>
                                    {selectedCase.type === 'Pregnancy' ? '🤰 Pregnant' : '👩 Post-Delivery'}
                                </div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Secure Contact</div>
                                <div className="text-2xl font-mono font-bold text-emerald-600 tracking-wider select-all cursor-pointer hover:bg-emerald-50 rounded px-2 transition-colors">
                                    {selectedCase.phone || '+91 98765 43210'}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <a
                                    href={`tel:${selectedCase.phone}`}
                                    className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors shadow-lg active:scale-95"
                                >
                                    <Phone className="w-4 h-4" /> Call Now
                                </a>
                                <button
                                    onClick={() => alert("Dispatching local ASHA worker notification...")}
                                    className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-lg active:scale-95"
                                >
                                    <User className="w-4 h-4" /> Notify ASHA
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
};

export default AuthorizerHighRisk;
