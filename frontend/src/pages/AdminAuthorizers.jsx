import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Shield, Mail, Phone, MapPin, UserCheck, ShieldCheck, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

const AdminAuthorizers = () => {
    const [authorizers, setAuthorizers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await axios.get('http://localhost:8000/api/admin/overview');
            setAuthorizers(res.data.authorizers);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filtered = authorizers.filter(a =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.phone_or_email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-20 text-center font-bold text-slate-400 italic">Connecting to Regional Directors...</div>;

    return (
        <DashboardLayout
            roleTitle="Authorization Control"
            roleIcon={<ShieldCheck className="w-6 h-6 text-blue-600" />}
            roleColor="bg-blue-50"
        >
            <div className="flex flex-col md:flex-row justify-between items-center mb-12 py-6 border-b border-slate-100">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Regional Authorizers</h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">Manage high-level officials responsible for regional population risk monitoring.</p>
                </div>
                <div className="flex items-center gap-4 mt-4 md:mt-0">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Find by name or email..."
                            className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-full text-xs font-bold outline-none ring-blue-900/5 focus:ring-4 transition-all w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filtered.map((auth, idx) => (
                    <motion.div
                        key={auth.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center text-center"
                    >
                        <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-6 border-4 border-white shadow-lg">
                            <span className="text-2xl font-black text-blue-600">{auth.name.split(' ').map(n => n[0]).join('')}</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">{auth.name}</h3>
                        <div className="px-3 py-1 bg-blue-600 text-white rounded-full text-[8px] font-black uppercase tracking-widest mb-6">
                            Regional Director
                        </div>

                        <div className="w-full space-y-4 text-slate-500 mb-8">
                            <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                                <Mail className="w-4 h-4 text-slate-400" />
                                <span className="text-[11px] font-semibold truncate">{auth.phone_or_email}</span>
                            </div>
                            <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                                <UserCheck className="w-4 h-4 text-slate-400" />
                                <span className="text-[11px] font-semibold truncate">Active Protocol Access</span>
                            </div>
                        </div>

                        <button className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95">
                            Modify Clearances
                        </button>
                    </motion.div>
                ))}
            </div>
        </DashboardLayout>
    );
};

export default AdminAuthorizers;
