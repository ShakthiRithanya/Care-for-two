import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Mail, ShieldCheck, ArrowLeft, LayoutGrid } from 'lucide-react';
import axios from 'axios';

const RegisterAdmin = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '' });
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('http://localhost:8000/api/auth/register-admin', form);
            alert("Admin Account Created!");
            navigate('/login');
        } catch (err) {
            alert("Registration failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 border border-slate-100"
            >
                <div className="flex justify-between items-center mb-10">
                    <Link to="/login" className="p-2 hover:bg-slate-50 rounded-full transition-all">
                        <ArrowLeft className="w-5 h-5 text-slate-400" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <LayoutGrid className="w-6 h-6 text-slate-900" />
                        <span className="font-bold text-slate-900">Admin Setup</span>
                    </div>
                </div>

                <div className="mb-10">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Initialize Master Control</h2>
                    <p className="text-sm text-slate-500">Create a new system administrator account.</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-6">
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="Full Name"
                            required
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none ring-1 ring-slate-100 focus:ring-slate-900 transition-all font-medium"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                        />
                        <UserPlus className="absolute left-4 top-4 w-5 h-5 text-slate-400 group-focus-within:text-slate-900" />
                    </div>

                    <div className="relative group">
                        <input
                            type="email"
                            placeholder="Work Email"
                            required
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none ring-1 ring-slate-100 focus:ring-slate-900 transition-all font-medium"
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                        />
                        <Mail className="absolute left-4 top-4 w-5 h-5 text-slate-400 group-focus-within:text-slate-900" />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : 'Generate Admin Account'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default RegisterAdmin;
