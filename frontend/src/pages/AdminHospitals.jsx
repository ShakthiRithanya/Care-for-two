import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Hospital, MapPin, Plus, Search, Building2, Phone, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

const AdminHospitals = () => {
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await axios.get('http://localhost:8000/api/admin/overview');
            setHospitals(res.data.hospitals);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredHospitals = hospitals.filter(h =>
        h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.district.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-20 text-center font-bold text-slate-400 italic">Accessing Facility Registry...</div>;

    return (
        <DashboardLayout
            roleTitle="Facility Management"
            roleIcon={<Hospital className="w-6 h-6 text-emerald-600" />}
            roleColor="bg-emerald-50"
        >
            <div className="flex flex-col md:flex-row justify-between items-center mb-12 py-6 border-b border-slate-100">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Registered Hospitals</h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">Manage and monitor health facilities within the network.</p>
                </div>
                <div className="flex items-center gap-4 mt-4 md:mt-0">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Filter by name or district..."
                            className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-full text-xs font-bold outline-none ring-slate-900/5 focus:ring-4 transition-all w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredHospitals.map((h, idx) => (
                    <motion.div
                        key={h.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
                    >
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 transition-colors">
                            <Building2 className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2 truncate">{h.name}</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-slate-500">
                                <MapPin className="w-4 h-4" />
                                <span className="text-xs font-semibold">{h.block}, {h.district}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest ${h.type === 'Government' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                                    }`}>
                                    {h.type} Facility
                                </span>
                                {h.has_nicu && (
                                    <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded text-[8px] font-black uppercase tracking-widest">
                                        NICU Equipped
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center">
                            <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">View Staff</button>
                            <button className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">Analytics <ArrowRight className="w-3 h-3" /></button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </DashboardLayout>
    );
};

export default AdminHospitals;
