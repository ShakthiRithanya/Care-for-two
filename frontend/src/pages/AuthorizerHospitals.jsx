import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Hospital, MapPin, Plus, Search, Building2, Phone, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const AuthorizerHospitals = () => {
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    // Get user state from local storage
    const user = JSON.parse(localStorage.getItem('maatri_user') || '{}');
    const userState = user.state || null;

    const [newHospital, setNewHospital] = useState({
        name: '',
        district: '',
        block: '',
        type: 'Government',
        has_nicu: false,
        state: userState // Auto-fill state
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const params = userState ? { state: userState } : {};
            const res = await axios.get('http://localhost:8000/api/authorizer/hospitals', { params });
            setHospitals(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddHospital = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8000/api/admin/hospitals', {
                ...newHospital,
                state: userState // Ensure state is forced for authorizers
            });
            alert('Hospital added successfully!');
            setShowAddModal(false);
            setNewHospital({ name: '', district: '', block: '', type: 'Government', has_nicu: false, state: userState });
            fetchData();
        } catch (err) {
            alert('Failed to add hospital.');
            console.error(err);
        }
    };

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
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                        {userState ? `${userState} Hospitals` : 'Global Hospital Registry'}
                    </h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">Manage and monitor health facilities within your jurisdiction.</p>
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
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-full text-xs font-bold hover:bg-emerald-700 transition-all shadow-xl hover:shadow-2xl active:scale-95"
                    >
                        <Plus className="w-4 h-4" /> Register New Facility
                    </button>
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
                            {/* Display State explicitly if global view, otherwise hidden implies context */}
                            {!userState && h.state && (
                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                    {h.state}
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Add Hospital Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-[2rem] p-8 w-full max-w-lg shadow-2xl relative"
                        >
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="absolute top-6 right-6 p-2 bg-slate-50 rounded-full hover:bg-rose-50 hover:text-rose-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <h2 className="text-2xl font-black text-slate-900 mb-2">Register New Facility</h2>
                            <p className="text-slate-500 text-sm mb-8">Add a new hospital or health center to the {userState || 'Global'} network.</p>

                            <form onSubmit={handleAddHospital} className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Hospital Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="e.g. District Hospital, Agra"
                                        value={newHospital.name}
                                        onChange={e => setNewHospital({ ...newHospital, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">District</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-3 bg-slate-50 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                                            placeholder="District"
                                            value={newHospital.district}
                                            onChange={e => setNewHospital({ ...newHospital, district: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Block</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-3 bg-slate-50 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                                            placeholder="Block"
                                            value={newHospital.block}
                                            onChange={e => setNewHospital({ ...newHospital, block: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Type</label>
                                        <select
                                            className="w-full px-4 py-3 bg-slate-50 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
                                            value={newHospital.type}
                                            onChange={e => setNewHospital({ ...newHospital, type: e.target.value })}
                                        >
                                            <option value="Government">Government</option>
                                            <option value="Private">Private</option>
                                            <option value="NGO">NGO / Charity</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center pt-6">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                                                checked={newHospital.has_nicu}
                                                onChange={e => setNewHospital({ ...newHospital, has_nicu: e.target.checked })}
                                            />
                                            <span className="text-xs font-bold text-slate-600">Has NICU Facility?</span>
                                        </label>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg mt-4 transition-all active:scale-95"
                                >
                                    Register Facility
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
};

export default AuthorizerHospitals;
