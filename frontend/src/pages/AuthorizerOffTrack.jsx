import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Activity, MapPin, Search, User, AlertCircle, ArrowRight, Calendar, UserX } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

const AuthorizerOffTrack = () => {
    const [offtrack, setOfftrack] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const userState = JSON.parse(localStorage.getItem('maatri_user') || '{}').state || null;

    const fetchData = async () => {
        try {
            setLoading(true);
            const params = userState ? { state: userState } : {};
            const res = await axios.get('http://localhost:8000/api/authorizer/offtrack', { params });
            setOfftrack(res.data);
        } catch (error) {
            console.error("Error fetching offtrack data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filtered = offtrack.filter(o =>
        o.child_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.beneficiary.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-20 text-center font-bold text-slate-400 italic">Scanning Service Completion Rates...</div>;

    return (
        <DashboardLayout
            roleTitle="Service Compliance Monitor"
            roleIcon={<Activity className="w-6 h-6 text-amber-600" />}
            roleColor="bg-amber-50"
        >
            <div className="flex flex-col md:flex-row justify-between items-center mb-12 py-6 border-b border-slate-100">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Off-Track Beneficiaries</h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">Cases where scheduled immunizations or ANC visits have been missed.</p>
                </div>
                <div className="flex items-center gap-4 mt-4 md:mt-0">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Find by child or mother..."
                            className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-full text-xs font-bold outline-none ring-amber-900/5 focus:ring-4 transition-all w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filtered.map((o, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
                                <UserX className="w-6 h-6 text-amber-600" />
                            </div>
                            <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[8px] font-black uppercase tracking-widest">
                                Missed Milestone
                            </span>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-slate-900 mb-1">{o.child_name}</h3>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <User className="w-3 h-3" /> Legacy: {o.beneficiary}
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-center gap-3 text-slate-500">
                                <MapPin className="w-4 h-4 text-slate-400" />
                                <span className="text-xs font-semibold">{o.block}, {o.district}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-500">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                <span className="text-xs font-semibold italic">Last seen: 45 days ago</span>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-50">
                            <button className="w-full py-4 bg-slate-50 text-slate-900 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-amber-600 hover:text-white hover:border-amber-600 transition-all active:scale-95">
                                Generate Reminder Alert <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </DashboardLayout>
    );
};

export default AuthorizerOffTrack;
