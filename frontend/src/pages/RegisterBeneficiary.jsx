import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    UserPlus, Phone, MapPin, ArrowLeft, Heart, ShieldCheck,
    ChevronRight, ChevronLeft, GraduationCap, Briefcase, CreditCard,
    Home, FileText, Fingerprint, ArrowRight
} from 'lucide-react';
import axios from 'axios';

const STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const EDUCATION_OPTIONS = [
    "Illiterate", "Primary (1-5)", "Middle (6-8)", "Secondary (9-10)",
    "Higher Secondary (11-12)", "Graduate", "Post Graduate", "Professional"
];

const CASTE_OPTIONS = ["General", "OBC", "SC", "ST"];

const RegisterBeneficiary = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        // Step 1: Basic Info
        name: '', phone: '', age: '', rch_id: '',
        // Step 2: Address
        state: '', district: '', block: '', village: '', address: '',
        // Step 3: Socio-economic
        education: '', occupation: '', caste_category: '',
        bpl_card: false, pmjay_id: '', aadhaar_linked: false,
    });

    const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('http://localhost:8000/api/auth/register-beneficiary', {
                ...form,
                age: parseInt(form.age),
            });
            alert("Registration Successful! You can now login with your phone number.");
            navigate('/login');
        } catch (err) {
            alert(err.response?.data?.detail || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const canProceedStep1 = form.name && form.phone && form.age;
    const canProceedStep2 = form.state && form.district && form.block;

    const inputClass = "w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none ring-1 ring-slate-100 focus:ring-rose-500 transition-all font-medium text-slate-800 placeholder:text-slate-400";
    const selectClass = "w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none ring-1 ring-slate-100 focus:ring-rose-500 transition-all font-medium text-slate-800 appearance-none cursor-pointer";
    const labelClass = "text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1.5 block px-1";
    const checkboxLabelClass = "flex items-center gap-3 p-4 bg-slate-50 rounded-2xl ring-1 ring-slate-100 cursor-pointer hover:ring-rose-300 transition-all";

    const stepVariant = {
        enter: { opacity: 0, x: 40 },
        center: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -40 },
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-blue-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background accents */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-20 left-10 w-80 h-80 bg-rose-400 rounded-full blur-[120px]" />
                <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-400 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-lg w-full bg-white rounded-[2rem] shadow-2xl shadow-rose-100/40 p-10 relative z-10 border border-rose-100/50"
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <Link to="/" className="p-2 hover:bg-slate-50 rounded-full transition-all">
                        <ArrowLeft className="w-5 h-5 text-slate-400" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
                        <span className="font-bold text-slate-900 tracking-tight">MaatriNet</span>
                    </div>
                </div>

                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Mother Registration</h2>
                    <p className="text-sm text-slate-500 font-medium">Join the digital maternal care network</p>
                </div>

                {/* Step Indicator */}
                <div className="flex items-center justify-center gap-2 mb-10">
                    {[1, 2, 3].map(s => (
                        <div key={s} className="flex items-center gap-2">
                            <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black transition-all duration-300 ${s === step
                                        ? 'bg-rose-600 text-white shadow-lg shadow-rose-200 scale-110'
                                        : s < step
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-slate-100 text-slate-400'
                                    }`}
                            >
                                {s < step ? '✓' : s}
                            </div>
                            {s < 3 && <div className={`w-10 h-0.5 rounded-full transition-all ${s < step ? 'bg-emerald-400' : 'bg-slate-100'}`} />}
                        </div>
                    ))}
                </div>

                <div className="text-center mb-6">
                    <div className="text-[10px] font-black text-rose-600 uppercase tracking-widest">
                        {step === 1 ? 'Personal Information' : step === 2 ? 'Address Details' : 'Socio-Economic Profile'}
                    </div>
                </div>

                <form onSubmit={handleRegister}>
                    <AnimatePresence mode="wait">
                        {/* Step 1: Personal Info */}
                        {step === 1 && (
                            <motion.div key="step1" variants={stepVariant} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="space-y-5">
                                <div>
                                    <label className={labelClass}>Full Name *</label>
                                    <div className="relative group">
                                        <UserPlus className="absolute left-4 top-4 w-5 h-5 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
                                        <input type="text" placeholder="Enter mother's full name" required className={inputClass} value={form.name} onChange={e => update('name', e.target.value)} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Age *</label>
                                        <div className="relative group">
                                            <Heart className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                                            <input type="number" placeholder="Age" required min="14" max="55" className={inputClass} value={form.age} onChange={e => update('age', e.target.value)} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Phone *</label>
                                        <div className="relative group">
                                            <Phone className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                                            <input type="text" placeholder="Mobile No." required className={inputClass} value={form.phone} onChange={e => update('phone', e.target.value)} />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className={labelClass}>RCH ID (Optional)</label>
                                    <div className="relative group">
                                        <FileText className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                                        <input type="text" placeholder="Reproductive Child Health ID" className={inputClass} value={form.rch_id} onChange={e => update('rch_id', e.target.value)} />
                                    </div>
                                </div>

                                <button type="button" disabled={!canProceedStep1} onClick={() => setStep(2)}
                                    className="w-full py-5 bg-rose-600 text-white rounded-2xl font-extrabold text-sm shadow-xl shadow-rose-200 hover:bg-rose-700 transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-40 disabled:hover:scale-100 flex items-center justify-center gap-2">
                                    Next: Address Details <ChevronRight className="w-5 h-5" />
                                </button>
                            </motion.div>
                        )}

                        {/* Step 2: Address */}
                        {step === 2 && (
                            <motion.div key="step2" variants={stepVariant} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="space-y-5">
                                <div>
                                    <label className={labelClass}>State *</label>
                                    <div className="relative group">
                                        <MapPin className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                                        <select required className={selectClass} value={form.state} onChange={e => update('state', e.target.value)}>
                                            <option value="">Select State</option>
                                            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>District *</label>
                                        <div className="relative group">
                                            <MapPin className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                                            <input type="text" placeholder="District" required className={inputClass} value={form.district} onChange={e => update('district', e.target.value)} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Block *</label>
                                        <div className="relative group">
                                            <ShieldCheck className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                                            <input type="text" placeholder="Block" required className={inputClass} value={form.block} onChange={e => update('block', e.target.value)} />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className={labelClass}>Village (Optional)</label>
                                    <div className="relative group">
                                        <Home className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                                        <input type="text" placeholder="Village / Ward name" className={inputClass} value={form.village} onChange={e => update('village', e.target.value)} />
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button type="button" onClick={() => setStep(1)} className="flex-1 py-5 bg-slate-100 text-slate-700 rounded-2xl font-extrabold text-sm transition-all hover:bg-slate-200 flex items-center justify-center gap-2">
                                        <ChevronLeft className="w-5 h-5" /> Back
                                    </button>
                                    <button type="button" disabled={!canProceedStep2} onClick={() => setStep(3)}
                                        className="flex-[2] py-5 bg-rose-600 text-white rounded-2xl font-extrabold text-sm shadow-xl shadow-rose-200 hover:bg-rose-700 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
                                        Next: Profile <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Socio-Economic */}
                        {step === 3 && (
                            <motion.div key="step3" variants={stepVariant} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Education</label>
                                        <div className="relative group">
                                            <GraduationCap className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                                            <select className={selectClass} value={form.education} onChange={e => update('education', e.target.value)}>
                                                <option value="">Select</option>
                                                {EDUCATION_OPTIONS.map(e => <option key={e} value={e}>{e}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Occupation</label>
                                        <div className="relative group">
                                            <Briefcase className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                                            <input type="text" placeholder="e.g. Homemaker" className={inputClass} value={form.occupation} onChange={e => update('occupation', e.target.value)} />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className={labelClass}>Caste Category</label>
                                    <div className="relative group">
                                        <FileText className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                                        <select className={selectClass} value={form.caste_category} onChange={e => update('caste_category', e.target.value)}>
                                            <option value="">Select Category</option>
                                            {CASTE_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <label className={checkboxLabelClass}>
                                        <input type="checkbox" className="w-5 h-5 rounded-lg accent-rose-600" checked={form.bpl_card} onChange={e => update('bpl_card', e.target.checked)} />
                                        <div>
                                            <div className="text-sm font-bold text-slate-900">BPL Card</div>
                                            <div className="text-[10px] text-slate-400 font-medium">Below Poverty Line</div>
                                        </div>
                                    </label>
                                    <label className={checkboxLabelClass}>
                                        <input type="checkbox" className="w-5 h-5 rounded-lg accent-rose-600" checked={form.aadhaar_linked} onChange={e => update('aadhaar_linked', e.target.checked)} />
                                        <div>
                                            <div className="text-sm font-bold text-slate-900">Aadhaar</div>
                                            <div className="text-[10px] text-slate-400 font-medium">Aadhaar Linked</div>
                                        </div>
                                    </label>
                                </div>

                                <div>
                                    <label className={labelClass}>PMJAY ID (Optional)</label>
                                    <div className="relative group">
                                        <CreditCard className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                                        <input type="text" placeholder="Ayushman Bharat ID" className={inputClass} value={form.pmjay_id} onChange={e => update('pmjay_id', e.target.value)} />
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button type="button" onClick={() => setStep(2)} className="flex-1 py-5 bg-slate-100 text-slate-700 rounded-2xl font-extrabold text-sm transition-all hover:bg-slate-200 flex items-center justify-center gap-2">
                                        <ChevronLeft className="w-5 h-5" /> Back
                                    </button>
                                    <button type="submit" disabled={loading}
                                        className="flex-[2] py-5 bg-gradient-to-r from-rose-600 to-rose-700 text-white rounded-2xl font-extrabold text-sm shadow-xl shadow-rose-200 hover:shadow-rose-300 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                        {loading ? 'Creating Profile...' : 'Complete Registration'} <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </form>

                <p className="text-center mt-8 text-xs text-slate-400 font-bold">
                    Already have an account? <Link to="/login" className="text-rose-600 hover:underline">Sign In</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default RegisterBeneficiary;
