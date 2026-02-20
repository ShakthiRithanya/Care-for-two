import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock, Mail, ArrowLeft, Heart, LayoutGrid, CheckCircle } from 'lucide-react';
import axios from 'axios';

const LoginPage = () => {
    const [searchParams] = useSearchParams();
    const isAdmin = searchParams.get('admin') === 'true';
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e, forcedCreds = null) => {
        if (e) e.preventDefault();
        setLoading(true);

        const loginEmail = forcedCreds ? forcedCreds.email : email;
        const loginPass = forcedCreds ? forcedCreds.password : password;

        try {
            const response = await axios.post('http://localhost:8000/api/login', {
                phone_or_email: loginEmail,
                password: loginPass,
                admin_only: forcedCreds ? forcedCreds.isAdmin : isAdmin
            });
            const { user_id, hospital_id, role, name, state } = response.data;
            localStorage.setItem('maatri_user', JSON.stringify({ user_id, hospital_id, role, name, state }));

            // RBAC Redirection
            if (role === 'ADMIN') navigate('/dashboard/admin');
            else if (role === 'AUTHORIZER') navigate('/dashboard/authorizer');
            else if (role === 'HOSPITAL') navigate('/dashboard/hospital');
            else if (role === 'BENEFICIARY') navigate('/dashboard/beneficiary');
            else navigate('/');

        } catch (error) {
            console.error("Login failed", error);
            alert(error.response?.data?.detail || "Login failed. Please check credentials.");
        } finally {
            setLoading(false);
        }
    };

    const quickLogins = [
        { label: 'Admin', email: 'superadmin@maatrinet.in', pass: 'demo', icon: <LayoutGrid className="w-5 h-5" />, color: 'bg-slate-900', isAdmin: true },
        { label: 'Authorizer', email: 'authorizer@maatrinet.in', pass: 'demo', icon: <Shield className="w-5 h-5" />, color: 'bg-indigo-600', isAdmin: false },
        { label: 'Hospital', email: 'hospital@maatrinet.in', pass: 'demo', icon: <Heart className="w-5 h-5" />, color: 'bg-emerald-600', isAdmin: false },
        { label: 'Mother', email: 'mother@maatrinet.in', pass: 'demo', icon: <CheckCircle className="w-5 h-5" />, color: 'bg-rose-600', isAdmin: false },
    ];


    const [isRegistering, setIsRegistering] = useState(false);
    const [regForm, setRegForm] = useState({ name: '', phone: '', password: '', confirmPass: '' });

    const handleRegister = async (e) => {
        e.preventDefault();
        if (regForm.password !== regForm.confirmPass) return alert("Passwords do not match!");

        setLoading(true);
        try {
            await axios.post('http://localhost:8000/api/auth/register-beneficiary', {
                name: regForm.name,
                phone: regForm.phone,
                password: regForm.password
            });
            alert("Registration Successful! Please Login.");
            setIsRegistering(false);
        } catch (error) {
            console.error(error);
            alert("Registration Failed. Try a different phone number.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-white">
            <div className="hidden lg:flex flex-col justify-between w-1/2 p-20 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-20 opacity-10">
                    <Heart className="w-96 h-96" />
                </div>
                <div className="relative z-10">
                    <div
                        onClick={() => navigate('/')}
                        className="flex items-center gap-3 mb-20 cursor-pointer group w-fit"
                    >
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-all">
                            <ArrowLeft className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold">CARE FOR TWO Home</span>
                    </div>

                    <h1 className="text-6xl font-extrabold leading-tight mb-8">
                        The Future of <br />
                        <span className="text-blue-400 font-black italic">Digital Trust</span> <br />
                        in Healthcare.
                    </h1>
                    <p className="text-slate-400 text-xl max-w-sm leading-relaxed font-medium">
                        Securing the health of India's mothers and children with AI-driven infrastructure.
                    </p>
                </div>

                <div className="relative z-10 bg-white/5 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-xl max-w-sm mt-12">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-white font-bold">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="font-bold text-white">HIPAA Complaint</div>
                            <div className="text-slate-400 text-sm font-medium">Enterprise Grade Security</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50/50">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md"
                >
                    <div className="text-center mb-10">
                        <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">
                            {isRegistering ? 'Mother Registration' : 'Identity Access'}
                        </h2>
                        <p className="text-slate-500 font-medium">
                            {isRegistering ? 'Create your secure profile to get started.' : 'Verify your credentials to enter CARE FOR TWO.'}
                        </p>
                    </div>

                    {!isRegistering ? (
                        <form onSubmit={(e) => handleLogin(e)} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">Access Identity</label>
                                <div className="relative group">
                                    <Mail className="absolute left-5 top-5 w-5 h-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Phone or Email"
                                        className="w-full pl-14 pr-4 py-5 bg-white border-2 border-slate-100 rounded-3xl outline-none focus:border-blue-500 transition-all font-bold placeholder:text-slate-300 shadow-sm"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Secure Phrase</label>
                                    <a className="text-[9px] font-black text-blue-600 uppercase hover:underline cursor-pointer">Recover Access</a>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-5 top-5 w-5 h-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        className="w-full pl-14 pr-4 py-5 bg-white border-2 border-slate-100 rounded-3xl outline-none focus:border-blue-500 transition-all font-bold placeholder:text-slate-300 shadow-sm"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest text-white shadow-2xl transition-all active:scale-[0.98] disabled:opacity-50 ${isAdmin ? 'bg-slate-900 shadow-slate-200' : 'bg-blue-600 shadow-blue-100 hover:bg-blue-700'}`}
                            >
                                {loading ? 'Validating Token...' : 'Enter Secure Console'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">Full Name</label>
                                <input type="text" placeholder="Your Name" className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-rose-500 transition-all font-bold"
                                    value={regForm.name} onChange={e => setRegForm({ ...regForm, name: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">Mobile Number</label>
                                <input type="tel" placeholder="10-digit Mobile" className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-rose-500 transition-all font-bold"
                                    value={regForm.phone} onChange={e => setRegForm({ ...regForm, phone: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">Set Password</label>
                                <input type="password" placeholder="••••••••" className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-rose-500 transition-all font-bold"
                                    value={regForm.password} onChange={e => setRegForm({ ...regForm, password: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">Confirm Password</label>
                                <input type="password" placeholder="••••••••" className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-rose-500 transition-all font-bold"
                                    value={regForm.confirmPass} onChange={e => setRegForm({ ...regForm, confirmPass: e.target.value })} required />
                            </div>
                            <button type="submit" disabled={loading} className="w-full py-5 rounded-[1.5rem] bg-rose-600 text-white font-black text-xs uppercase tracking-widest shadow-xl hover:bg-rose-700 transition-all">
                                {loading ? 'Creating Profile...' : 'Create Mother Profile'}
                            </button>
                        </form>
                    )}

                    <div className="mt-8 text-center">
                        <p className="text-slate-400 text-sm font-bold">
                            {isRegistering ? 'Already have an account?' : 'New Mother on CARE FOR TWO?'}
                            <span
                                onClick={() => setIsRegistering(!isRegistering)}
                                className={`ml-2 cursor-pointer underline hover:no-underline ${isRegistering ? 'text-blue-600' : 'text-rose-600'}`}
                            >
                                {isRegistering ? 'Login securely' : 'Create Account'}
                            </span>
                        </p>
                    </div>

                    {!isRegistering && (
                        <div className="mt-12 text-center">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 py-2 border-y border-slate-100">
                                Quick Access (One-Click Demo)
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {quickLogins.map((q, idx) => (
                                    <motion.div
                                        key={idx}
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleLogin(null, { email: q.email, password: q.pass, isAdmin: q.isAdmin })}
                                        className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                                    >
                                        <div className={`w-10 h-10 ${q.color} text-white rounded-xl flex items-center justify-center group-hover:rotate-12 transition-all`}>
                                            {q.icon}
                                        </div>
                                        <div className="text-left">
                                            <div className="text-[10px] font-black text-slate-900 uppercase leading-none">{q.label}</div>
                                            <div className="text-[8px] text-slate-400 font-bold mt-1 uppercase">Instant Login</div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default LoginPage;
