import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { UserPlus, Hospital, Shield, Users, Mail, Phone, MapPin, Building2, Plus, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

const AdminAddUser = () => {
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('hospital'); // 'hospital', 'authorizer', 'facility'

    useEffect(() => {
        const fetchHospitals = async () => {
            const res = await axios.get('http://localhost:8000/api/admin/overview');
            setHospitals(res.data.hospitals);
        };
        fetchHospitals();
    }, []);

    // Individual Forms
    const [hospUser, setHospUser] = useState({ name: '', email: '', hospital_id: '' });
    const [authUser, setAuthUser] = useState({ name: '', email: '' });
    const [facility, setFacility] = useState({ name: '', district: '', block: '', type: 'Government', has_nicu: false });

    const handleHospUserSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('http://localhost:8000/api/admin/users/hospital', hospUser);
            alert("Hospital User Registered!");
            setHospUser({ name: '', email: '', hospital_id: '' });
        } catch (err) { alert("Failed to register."); } finally { setLoading(false); }
    };

    const handleAuthUserSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('http://localhost:8000/api/admin/users/authorizer', authUser);
            alert("Authorizer Registered!");
            setAuthUser({ name: '', email: '' });
        } catch (err) { alert("Failed to register."); } finally { setLoading(false); }
    };

    const handleFacilitySubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('http://localhost:8000/api/admin/hospitals', facility);
            alert("Hospital Facility Registered!");
            setFacility({ name: '', district: '', block: '', type: 'Government', has_nicu: false });
        } catch (err) { alert("Failed to register."); } finally { setLoading(false); }
    };

    return (
        <DashboardLayout
            roleTitle="Infrastructure Scale-up"
            roleIcon={<Plus className="w-6 h-6 text-rose-600" />}
            roleColor="bg-rose-50"
        >
            <div className="flex flex-col md:flex-row justify-between items-center mb-12 py-6 border-b border-slate-100">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Onboard Network</h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">Scale the MaatriNet infrastructure by adding new facilities and staff.</p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-4 mb-12 bg-white p-2 rounded-2xl w-fit shadow-sm border border-slate-100">
                <button
                    onClick={() => setActiveTab('hospital')}
                    className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'hospital' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-900'}`}
                >
                    Hospital Staff
                </button>
                <button
                    onClick={() => setActiveTab('authorizer')}
                    className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'authorizer' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-900'}`}
                >
                    Regional Authorizer
                </button>
                <button
                    onClick={() => setActiveTab('facility')}
                    className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'facility' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-900'}`}
                >
                    Health Facility
                </button>
            </div>

            <div className="max-w-3xl">
                {activeTab === 'hospital' && (
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                                <Hospital className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Hospital Medical User</h2>
                                <p className="text-xs text-slate-400 font-medium">Link a medical officer to a specific health facility.</p>
                            </div>
                        </div>
                        <form onSubmit={handleHospUserSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Official Name</label>
                                    <input required type="text" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-sm" placeholder="Dr. Jane Doe" value={hospUser.name} onChange={e => setHospUser({ ...hospUser, name: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Work Email</label>
                                    <input required type="email" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-sm" placeholder="jane.doe@maatrinet.in" value={hospUser.email} onChange={e => setHospUser({ ...hospUser, email: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Assign Facility</label>
                                <select required className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-sm appearance-none" value={hospUser.hospital_id} onChange={e => setHospUser({ ...hospUser, hospital_id: e.target.value })}>
                                    <option value="">Select a registered hospital...</option>
                                    {hospitals.map(h => <option key={h.id} value={h.id}>{h.name} ({h.district})</option>)}
                                </select>
                            </div>
                            <button type="submit" disabled={loading} className="w-full py-5 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-50">Confirm Onboarding</button>
                        </form>
                    </motion.div>
                )}

                {activeTab === 'authorizer' && (
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                                <Shield className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Regional Authorizer</h2>
                                <p className="text-xs text-slate-400 font-medium">Create credentials for a district health director.</p>
                            </div>
                        </div>
                        <form onSubmit={handleAuthUserSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Official Name</label>
                                    <input required type="text" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-blue-500 transition-all font-medium text-sm" placeholder="Mr. Admin Chief" value={authUser.name} onChange={e => setAuthUser({ ...authUser, name: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Work Email</label>
                                    <input required type="email" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-blue-500 transition-all font-medium text-sm" placeholder="chief@maatrinet.in" value={authUser.email} onChange={e => setAuthUser({ ...authUser, email: e.target.value })} />
                                </div>
                            </div>
                            <button type="submit" disabled={loading} className="w-full py-5 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-50">Authorize Credentials</button>
                        </form>
                    </motion.div>
                )}

                {activeTab === 'facility' && (
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Health Facility</h2>
                                <p className="text-xs text-slate-400 font-medium">Register a new government or private hospital.</p>
                            </div>
                        </div>
                        <form onSubmit={handleFacilitySubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Hospital Name</label>
                                <input required type="text" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-sm" placeholder="City General Hospital" value={facility.name} onChange={e => setFacility({ ...facility, name: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">District</label>
                                    <input required type="text" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-sm" placeholder="e.g. Bhopal" value={facility.district} onChange={e => setFacility({ ...facility, district: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Block</label>
                                    <input required type="text" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-sm" placeholder="e.g. Block A" value={facility.block} onChange={e => setFacility({ ...facility, block: e.target.value })} />
                                </div>
                            </div>
                            <div className="flex gap-10 py-4">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" checked={facility.has_nicu} onChange={e => setFacility({ ...facility, has_nicu: e.target.checked })} />
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-900 transition-colors">Has NICU Support</span>
                                </label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="type" className="w-4 h-4 text-indigo-600" checked={facility.type === 'Government'} onChange={() => setFacility({ ...facility, type: 'Government' })} />
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Government</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="type" className="w-4 h-4 text-indigo-600" checked={facility.type === 'Private'} onChange={() => setFacility({ ...facility, type: 'Private' })} />
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Private</span>
                                    </label>
                                </div>
                            </div>
                            <button type="submit" disabled={loading} className="w-full py-5 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-50">Register Facility</button>
                        </form>
                    </motion.div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default AdminAddUser;
