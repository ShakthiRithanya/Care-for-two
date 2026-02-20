import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { CheckCircle2, XCircle, Clock, MapPin, Search, Filter, ShieldCheck, ArrowRight, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const AuthorizerApprovals = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('SUBMITTED');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`http://localhost:8000/api/authorizer/applications?status=${filterStatus === 'ALL' ? '' : filterStatus}`);
            setApplications(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filterStatus]);

    const handleAction = async (id, status) => {
        try {
            await axios.post(`http://localhost:8000/api/authorizer/applications/${id}/update-status`, { status });
            fetchData();
        } catch (err) {
            console.error(err);
            alert("Action failed.");
        }
    };

    const filtered = applications.filter(a =>
        a.beneficiary_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.scheme_type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout
            roleTitle="Scheme Approval Registry"
            roleIcon={<ShieldCheck className="w-6 h-6 text-emerald-600" />}
            roleColor="bg-emerald-50"
        >
            <div className="flex flex-col md:flex-row justify-between items-center mb-12 py-6 border-b border-slate-100">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Maternal Benefit Approvals</h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">Verify and authorize government scheme payouts for registered beneficiaries.</p>
                </div>
                <div className="flex items-center gap-4 mt-6 md:mt-0">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search beneficiary or scheme..."
                            className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-full text-xs font-bold outline-none ring-emerald-900/5 focus:ring-4 transition-all w-64 shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-4 mb-12 overflow-x-auto pb-2">
                {[
                    { id: 'SUBMITTED', label: 'Pending Review', color: 'text-amber-600', bg: 'bg-amber-50' },
                    { id: 'UNDER_REVIEW', label: 'Under Review', color: 'text-blue-600', bg: 'bg-blue-50' },
                    { id: 'APPROVED', label: 'Authorized', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { id: 'ALL', label: 'All Records', color: 'text-slate-600', bg: 'bg-slate-50' }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setFilterStatus(tab.id)}
                        className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${filterStatus === tab.id
                                ? 'bg-slate-900 text-white border-slate-900 shadow-xl scale-105'
                                : `bg-white text-slate-400 border-slate-100 hover:border-slate-300`
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="p-20 text-center font-bold text-slate-400 italic">Accessing Central Approval Database...</div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    <AnimatePresence mode='popLayout'>
                        {filtered.map((app, idx) => (
                            <motion.div
                                key={app.id}
                                layout
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col md:flex-row items-center justify-between gap-8"
                            >
                                <div className="flex items-center gap-6 flex-1">
                                    <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shrink-0 border-4 border-white shadow-lg ${app.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' :
                                            app.status === 'REJECTED' ? 'bg-rose-50 text-rose-600' :
                                                'bg-amber-50 text-amber-600'
                                        }`}>
                                        <FileText className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-xl font-bold text-slate-900">{app.beneficiary_name}</h3>
                                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${app.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-600' :
                                                    app.status === 'SUBMITTED' ? 'bg-amber-100 text-amber-600' :
                                                        'bg-blue-100 text-blue-600'
                                                }`}>
                                                {app.status}
                                            </span>
                                        </div>
                                        <p className="text-sm font-bold text-slate-500 mb-2">{app.scheme_type}</p>
                                        <div className="flex items-center gap-4 text-slate-400">
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide">
                                                <MapPin className="w-3.5 h-3.5" /> {app.block}, {app.district}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide">
                                                <Clock className="w-3.5 h-3.5" /> {new Date(app.applied_date).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
                                    {app.status === 'SUBMITTED' && (
                                        <button
                                            onClick={() => handleAction(app.id, 'UNDER_REVIEW')}
                                            className="px-6 py-4 bg-slate-50 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-all"
                                        >
                                            Mark Review
                                        </button>
                                    )}
                                    {(app.status === 'SUBMITTED' || app.status === 'UNDER_REVIEW') && (
                                        <>
                                            <button
                                                onClick={() => handleAction(app.id, 'REJECTED')}
                                                className="w-12 h-12 flex items-center justify-center bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                                title="Reject Application"
                                            >
                                                <XCircle className="w-6 h-6" />
                                            </button>
                                            <button
                                                onClick={() => handleAction(app.id, 'APPROVED')}
                                                className="flex items-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg active:scale-95 group/btn"
                                            >
                                                Authorize Payout <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                            </button>
                                        </>
                                    )}
                                    {app.status === 'APPROVED' && (
                                        <div className="flex items-center gap-2 text-emerald-600 font-black uppercase tracking-widest text-[10px]">
                                            <CheckCircle2 className="w-5 h-5" /> Authorized
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {filtered.length === 0 && (
                        <div className="bg-slate-50 p-20 rounded-[3rem] border-2 border-dashed border-slate-200 text-center">
                            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-slate-400">No applications found in this queue</h3>
                        </div>
                    )}
                </div>
            )}
        </DashboardLayout>
    );
};

export default AuthorizerApprovals;
