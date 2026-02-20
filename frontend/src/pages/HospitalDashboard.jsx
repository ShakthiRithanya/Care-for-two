import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    Hospital as HospitalIcon, Download, Plus, AlertCircle, Users, Activity,
    CheckCircle, ArrowLeft, Phone, MapPin, User, CheckCircle2, Clock,
    Send, Gift, FileText, Baby, Syringe, Heart, X, ChevronRight,
    ChevronLeft, Stethoscope, Droplets, Thermometer, Scale,
    GraduationCap, Briefcase, CreditCard, Home, Fingerprint, ShieldCheck,
    AlertTriangle
} from 'lucide-react';

const STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal"
];
const EDUCATION_OPTIONS = ["Illiterate", "Primary (1-5)", "Middle (6-8)", "Secondary (9-10)", "Higher Secondary (11-12)", "Graduate", "Post Graduate", "Professional"];
const CASTE_OPTIONS = ["General", "OBC", "SC", "ST"];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

// ──────────────────────── Add Mother Modal ────────────────────────
const AddMotherModal = ({ isOpen, onClose, hospitalId, onSuccess }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [form, setForm] = useState({
        // Personal
        name: '', age: '', phone: '', rch_id: '',
        // Address
        state: '', district: '', block: '', village: '',
        // Socio-economic
        education: '', occupation: '', caste_category: '', bpl_card: false, pmjay_id: '', aadhaar_linked: false,
        // Pregnancy history
        lmp_date: '', gravida: '1', para: '0',
        // Vitals
        blood_group: '', height_cm: '', weight_kg: '', hb_level: '', bp_systolic: '', bp_diastolic: '',
        // Conditions
        anemia: false, high_bp: false, diabetes: false, thyroid: false,
        hiv_positive: false, syphilis_positive: false, previous_csection: false,
        multiple_pregnancy: false, danger_signs: false, rh_negative: false,
        // Care
        anc_visits_completed: '0', tt_doses: '0', ifa_tablets: '0', usg_done: false,
        institutional_delivery_planned: true,
    });

    const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:8000/api/hospital/register-mother', {
                ...form,
                hospital_id: hospitalId,
                age: parseInt(form.age) || 25,
                gravida: parseInt(form.gravida) || 1,
                para: parseInt(form.para) || 0,
                anc_visits_completed: parseInt(form.anc_visits_completed) || 0,
                tt_doses: parseInt(form.tt_doses) || 0,
                ifa_tablets: parseInt(form.ifa_tablets) || 0,
                height_cm: parseFloat(form.height_cm) || 0,
                weight_kg: parseFloat(form.weight_kg) || 0,
                hb_level: parseFloat(form.hb_level) || 0,
                bp_systolic: parseInt(form.bp_systolic) || 0,
                bp_diastolic: parseInt(form.bp_diastolic) || 0,
            });
            setResult(res.data);
        } catch (err) {
            alert(err.response?.data?.detail || "Registration failed.");
        } finally {
            setLoading(false);
        }
    };

    const resetAndClose = () => {
        setStep(1);
        setResult(null);
        setForm({
            name: '', age: '', phone: '', rch_id: '', state: '', district: '', block: '', village: '',
            education: '', occupation: '', caste_category: '', bpl_card: false, pmjay_id: '', aadhaar_linked: false,
            lmp_date: '', gravida: '1', para: '0', blood_group: '', height_cm: '', weight_kg: '',
            hb_level: '', bp_systolic: '', bp_diastolic: '', anemia: false, high_bp: false, diabetes: false,
            thyroid: false, hiv_positive: false, syphilis_positive: false, previous_csection: false,
            multiple_pregnancy: false, danger_signs: false, rh_negative: false, anc_visits_completed: '0',
            tt_doses: '0', ifa_tablets: '0', usg_done: false, institutional_delivery_planned: true,
        });
        onClose();
        if (result) onSuccess();
    };

    if (!isOpen) return null;

    const inputClass = "w-full px-4 py-3 bg-slate-50 rounded-xl ring-1 ring-slate-100 focus:ring-emerald-500 outline-none font-medium text-slate-800 text-sm transition-all placeholder:text-slate-400";
    const selectClass = "w-full px-4 py-3 bg-slate-50 rounded-xl ring-1 ring-slate-100 focus:ring-emerald-500 outline-none font-medium text-slate-800 text-sm appearance-none cursor-pointer transition-all";
    const labelClass = "text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em] mb-1 block";
    const checkClass = "flex items-center gap-3 p-3 bg-slate-50 rounded-xl ring-1 ring-slate-100 cursor-pointer hover:ring-emerald-300 transition-all text-sm";

    const canStep1 = form.name && form.age && form.phone;
    const canStep2 = form.district && form.block;

    // ──────── Success Screen ────────
    if (result) {
        return (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={resetAndClose}>
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={e => e.stopPropagation()}
                    className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 text-center max-h-[90vh] overflow-y-auto">

                    <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 ${result.risk_level === 'HIGH' ? 'bg-rose-100' : result.risk_level === 'MEDIUM' ? 'bg-amber-100' : 'bg-emerald-100'}`}>
                        {result.risk_level === 'HIGH' ? <AlertTriangle className="w-8 h-8 text-rose-600" /> : <CheckCircle2 className="w-8 h-8 text-emerald-600" />}
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Mother Registered Successfully</h2>
                    <p className="text-slate-500 font-medium text-sm mb-6">Patient ID: <span className="font-bold text-slate-900">#{result.beneficiary_id}</span> | Added to registry.</p>

                    <div className="grid md:grid-cols-2 gap-6 text-left mb-6">
                        {/* Risk Info */}
                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-200 pb-2">Clinical Risk Profile</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-500">AI Risk Level</span>
                                    <span className={`text-xs font-black px-2 py-0.5 rounded-md uppercase ${result.risk_level === 'HIGH' ? 'bg-rose-100 text-rose-600' : result.risk_level === 'MEDIUM' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                        {result.risk_level}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-xs font-bold text-slate-500">Risk Score</span>
                                    <span className="text-xs font-bold text-slate-900">{(result.risk_score * 100).toFixed(1)}%</span>
                                </div>
                                {result.edd && (
                                    <div className="flex justify-between">
                                        <span className="text-xs font-bold text-slate-500">Expected Delivery</span>
                                        <span className="text-xs font-bold text-slate-900">{result.edd}</span>
                                    </div>
                                )}
                                {result.risk_factors && result.risk_factors.length > 0 && (
                                    <div className="pt-2 border-t border-slate-200 mt-2">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Key Risk Factors</span>
                                        {result.risk_factors.map((f, i) => (
                                            <div key={i} className="text-[10px] text-rose-600 font-bold flex items-center gap-1">
                                                <AlertTriangle className="w-3 h-3" /> {f}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Scheme Info */}
                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-200 pb-2">Eligible Schemes (Auto-Predicted)</h4>
                            <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
                                {result.recommended_schemes && result.recommended_schemes.length > 0 ? (
                                    result.recommended_schemes.map((rec, idx) => (
                                        <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Gift className="w-3.5 h-3.5 text-rose-500" />
                                                <span className="text-xs font-bold text-slate-900">{rec.scheme}</span>
                                            </div>
                                            <p className="text-[10px] text-slate-500 leading-tight mb-1.5">{rec.reason}</p>
                                            <div className="flex items-center gap-1 text-[9px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 w-fit">
                                                <FileText className="w-3 h-3" /> {rec.docs}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-xs text-slate-400 py-4 italic">No specific schemes found.</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <button onClick={resetAndClose} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100">
                        Confirm & Return to Dashboard
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={resetAndClose}>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
                onClick={e => e.stopPropagation()} className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                    <div>
                        <h2 className="text-xl font-black text-slate-900">Register New Mother</h2>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">Fill clinical & demographic data</p>
                    </div>
                    <button onClick={resetAndClose} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><X className="w-5 h-5 text-slate-400" /></button>
                </div>

                {/* Step Indicator */}
                <div className="px-6 py-4 flex items-center justify-center gap-2 border-b border-slate-50 bg-slate-50/50 shrink-0">
                    {[{ n: 1, l: 'Personal' }, { n: 2, l: 'Address & Profile' }, { n: 3, l: 'Pregnancy' }, { n: 4, l: 'Clinical Vitals' }].map((s, i) => (
                        <div key={s.n} className="flex items-center gap-1.5">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black transition-all ${s.n === step ? 'bg-emerald-600 text-white shadow-md' : s.n < step ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                {s.n < step ? '✓' : s.n}
                            </div>
                            <span className={`text-[9px] font-bold uppercase tracking-wider hidden sm:inline ${s.n === step ? 'text-emerald-700' : 'text-slate-400'}`}>{s.l}</span>
                            {i < 3 && <div className={`w-6 h-0.5 rounded-full ${s.n < step ? 'bg-emerald-400' : 'bg-slate-100'}`} />}
                        </div>
                    ))}
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <AnimatePresence mode="wait">
                        {/* Step 1: Personal */}
                        {step === 1 && (
                            <motion.div key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2"><label className={labelClass}>Full Name *</label><input type="text" placeholder="Mother's full name" required className={inputClass} value={form.name} onChange={e => update('name', e.target.value)} /></div>
                                    <div><label className={labelClass}>Age *</label><input type="number" placeholder="Age" min="14" max="55" required className={inputClass} value={form.age} onChange={e => update('age', e.target.value)} /></div>
                                    <div><label className={labelClass}>Phone *</label><input type="text" placeholder="Mobile Number" required className={inputClass} value={form.phone} onChange={e => update('phone', e.target.value)} /></div>
                                    <div className="col-span-2"><label className={labelClass}>RCH ID (Optional)</label><input type="text" placeholder="Reproductive Child Health ID" className={inputClass} value={form.rch_id} onChange={e => update('rch_id', e.target.value)} /></div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Address + Socio-economic */}
                        {step === 2 && (
                            <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className={labelClass}>State</label>
                                        <select className={selectClass} value={form.state} onChange={e => update('state', e.target.value)}>
                                            <option value="">Select State</option>{STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div><label className={labelClass}>District *</label><input type="text" placeholder="District" required className={inputClass} value={form.district} onChange={e => update('district', e.target.value)} /></div>
                                    <div><label className={labelClass}>Block *</label><input type="text" placeholder="Block" required className={inputClass} value={form.block} onChange={e => update('block', e.target.value)} /></div>
                                    <div><label className={labelClass}>Village</label><input type="text" placeholder="Village / Ward" className={inputClass} value={form.village} onChange={e => update('village', e.target.value)} /></div>
                                </div>
                                <div className="border-t border-slate-100 pt-4 mt-2">
                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Socio-economic Profile</div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className={labelClass}>Education</label>
                                            <select className={selectClass} value={form.education} onChange={e => update('education', e.target.value)}>
                                                <option value="">Select</option>{EDUCATION_OPTIONS.map(e => <option key={e} value={e}>{e}</option>)}
                                            </select>
                                        </div>
                                        <div><label className={labelClass}>Occupation</label><input type="text" placeholder="e.g. Homemaker" className={inputClass} value={form.occupation} onChange={e => update('occupation', e.target.value)} /></div>
                                        <div><label className={labelClass}>Caste Category</label>
                                            <select className={selectClass} value={form.caste_category} onChange={e => update('caste_category', e.target.value)}>
                                                <option value="">Select</option>{CASTE_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div><label className={labelClass}>PMJAY ID</label><input type="text" placeholder="Ayushman Bharat ID" className={inputClass} value={form.pmjay_id} onChange={e => update('pmjay_id', e.target.value)} /></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <label className={checkClass}><input type="checkbox" className="w-4 h-4 accent-emerald-600" checked={form.bpl_card} onChange={e => update('bpl_card', e.target.checked)} />
                                            <span className="font-bold text-slate-700">BPL Card Holder</span></label>
                                        <label className={checkClass}><input type="checkbox" className="w-4 h-4 accent-emerald-600" checked={form.aadhaar_linked} onChange={e => update('aadhaar_linked', e.target.checked)} />
                                            <span className="font-bold text-slate-700">Aadhaar Linked</span></label>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Pregnancy History */}
                        {step === 3 && (
                            <motion.div key="s3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className={labelClass}>LMP Date (Last Menstrual Period)</label><input type="date" className={inputClass} value={form.lmp_date} onChange={e => update('lmp_date', e.target.value)} /></div>
                                    <div><label className={labelClass}>Blood Group</label>
                                        <select className={selectClass} value={form.blood_group} onChange={e => update('blood_group', e.target.value)}>
                                            <option value="">Select</option>{BLOOD_GROUPS.map(b => <option key={b} value={b}>{b}</option>)}
                                        </select>
                                    </div>
                                    <div><label className={labelClass}>Gravida (Total Pregnancies)</label><input type="number" min="1" max="15" className={inputClass} value={form.gravida} onChange={e => update('gravida', e.target.value)} /></div>
                                    <div><label className={labelClass}>Para (Previous Deliveries)</label><input type="number" min="0" max="15" className={inputClass} value={form.para} onChange={e => update('para', e.target.value)} /></div>
                                    <div><label className={labelClass}>ANC Visits Completed</label><input type="number" min="0" max="10" className={inputClass} value={form.anc_visits_completed} onChange={e => update('anc_visits_completed', e.target.value)} /></div>
                                    <div><label className={labelClass}>TT Doses</label><input type="number" min="0" max="5" className={inputClass} value={form.tt_doses} onChange={e => update('tt_doses', e.target.value)} /></div>
                                    <div><label className={labelClass}>IFA Tablets Given</label><input type="number" min="0" max="200" className={inputClass} value={form.ifa_tablets} onChange={e => update('ifa_tablets', e.target.value)} /></div>
                                    <div className="flex items-end">
                                        <label className={checkClass + " w-full"}><input type="checkbox" className="w-4 h-4 accent-emerald-600" checked={form.usg_done} onChange={e => update('usg_done', e.target.checked)} />
                                            <span className="font-bold text-slate-700">USG Done</span></label>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-2">
                                    <label className={checkClass}><input type="checkbox" className="w-4 h-4 accent-emerald-600" checked={form.rh_negative} onChange={e => update('rh_negative', e.target.checked)} />
                                        <span className="font-bold text-slate-700">Rh Negative</span></label>
                                    <label className={checkClass}><input type="checkbox" className="w-4 h-4 accent-emerald-600" checked={form.institutional_delivery_planned} onChange={e => update('institutional_delivery_planned', e.target.checked)} />
                                        <span className="font-bold text-slate-700">Institutional Delivery Planned</span></label>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 4: Clinical Vitals & Conditions */}
                        {step === 4 && (
                            <motion.div key="s4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-4">
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Vitals</div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div><label className={labelClass}>Height (cm)</label><input type="number" step="0.1" min="100" max="200" placeholder="e.g. 155" className={inputClass} value={form.height_cm} onChange={e => update('height_cm', e.target.value)} /></div>
                                    <div><label className={labelClass}>Weight (kg)</label><input type="number" step="0.1" min="30" max="150" placeholder="e.g. 55" className={inputClass} value={form.weight_kg} onChange={e => update('weight_kg', e.target.value)} /></div>
                                    <div><label className={labelClass}>Hb Level (g/dL)</label><input type="number" step="0.1" min="3" max="18" placeholder="e.g. 11.5" className={inputClass} value={form.hb_level} onChange={e => update('hb_level', e.target.value)} /></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className={labelClass}>BP Systolic (mmHg)</label><input type="number" min="60" max="250" placeholder="e.g. 120" className={inputClass} value={form.bp_systolic} onChange={e => update('bp_systolic', e.target.value)} /></div>
                                    <div><label className={labelClass}>BP Diastolic (mmHg)</label><input type="number" min="40" max="160" placeholder="e.g. 80" className={inputClass} value={form.bp_diastolic} onChange={e => update('bp_diastolic', e.target.value)} /></div>
                                </div>

                                <div className="border-t border-slate-100 pt-4 mt-2">
                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Medical Conditions</div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {[
                                            { key: 'anemia', label: 'Anemia', color: 'text-rose-600' },
                                            { key: 'high_bp', label: 'High BP', color: 'text-rose-600' },
                                            { key: 'diabetes', label: 'Diabetes', color: 'text-amber-600' },
                                            { key: 'thyroid', label: 'Thyroid', color: 'text-amber-600' },
                                            { key: 'hiv_positive', label: 'HIV Positive', color: 'text-rose-600' },
                                            { key: 'syphilis_positive', label: 'Syphilis +', color: 'text-rose-600' },
                                            { key: 'previous_csection', label: 'Previous C-Section', color: 'text-blue-600' },
                                            { key: 'multiple_pregnancy', label: 'Multiple Pregnancy', color: 'text-violet-600' },
                                            { key: 'danger_signs', label: 'Danger Signs', color: 'text-rose-600' },
                                        ].map(cond => (
                                            <label key={cond.key} className={`flex items-center gap-2.5 p-3 rounded-xl cursor-pointer transition-all ${form[cond.key] ? 'bg-rose-50 ring-1 ring-rose-200' : 'bg-slate-50 ring-1 ring-slate-100 hover:ring-slate-200'
                                                }`}>
                                                <input type="checkbox" className="w-4 h-4 accent-rose-600" checked={form[cond.key]} onChange={e => update(cond.key, e.target.checked)} />
                                                <span className={`text-xs font-bold ${form[cond.key] ? cond.color : 'text-slate-600'}`}>{cond.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-100 flex gap-3 shrink-0 bg-white">
                    {step > 1 && (
                        <button type="button" onClick={() => setStep(step - 1)} className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm transition-all hover:bg-slate-200 flex items-center gap-1">
                            <ChevronLeft className="w-4 h-4" /> Back
                        </button>
                    )}
                    <div className="flex-1" />
                    {step < 4 ? (
                        <button type="button" disabled={step === 1 ? !canStep1 : step === 2 ? !canStep2 : false} onClick={() => setStep(step + 1)}
                            className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-emerald-700 transition-all disabled:opacity-40 flex items-center gap-2">
                            Next <ChevronRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button type="button" disabled={loading} onClick={handleSubmit}
                            className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center gap-2">
                            {loading ? 'Registering...' : 'Register & Predict Risk'} <Stethoscope className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

// ──────────────────────── Main Hospital Dashboard ────────────────────────
const HospitalDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('all');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedPatientId, setSelectedPatientId] = useState(null);
    const [patientDetail, setPatientDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    const user = JSON.parse(localStorage.getItem('maatri_user') || '{}');
    const hospitalId = user.hospital_id || 1;

    const fetchHospitalData = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:8000/api/hospital/dashboard', {
                params: { hospital_id: hospitalId }
            });
            setData(response.data);
        } catch (error) {
            console.error("Error fetching hospital data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHospitalData();
    }, []);

    const fetchPatientDetail = async (pregId) => {
        try {
            setDetailLoading(true);
            const response = await axios.get(`http://localhost:8000/api/hospital/patient/${pregId}`);
            setPatientDetail(response.data);
            setSelectedPatientId(pregId);
        } catch (error) {
            console.error("Error fetching patient detail", error);
        } finally {
            setDetailLoading(false);
        }
    };

    const RISK_ORDER = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    const beneficiaries = (data?.patient_list || []).sort((a, b) => {
        const levelDiff = (RISK_ORDER[a.risk] ?? 2) - (RISK_ORDER[b.risk] ?? 2);
        if (levelDiff !== 0) return levelDiff;
        return (b.risk_score || 0) - (a.risk_score || 0);
    });

    if (loading) return (
        <DashboardLayout roleTitle="Facility Console" roleIcon={<HospitalIcon className="text-emerald-600" />} roleColor="bg-emerald-50">
            <div className="p-20 text-center font-bold text-emerald-600 italic animate-pulse">Accessing Secure Facility Console...</div>
        </DashboardLayout>
    );

    // Detailed Profile View
    if (selectedPatientId && patientDetail) {
        const profile = patientDetail.profile;
        const curPregData = patientDetail.pregnancies?.[0];

        const timeline = [
            { title: 'ANC Visit 1', status: 'completed', date: 'Done' },
            { title: 'ANC Visit 2', status: (curPregData?.anc_status && curPregData.anc_status.split('/')[0] >= 2) ? 'completed' : 'upcoming', date: 'Checkup Complete' },
            { title: 'ANC Visit 3', status: 'upcoming', date: 'Predicted Mid-Term' },
            { title: 'Institutional Delivery', status: 'pending', date: curPregData?.edd || 'TBD' },
        ];

        return (
            <DashboardLayout roleTitle={`Medical Profile: ${profile.name}`} roleIcon={<User className="w-6 h-6 text-rose-600" />} roleColor="bg-rose-50">
                <div className="mb-8">
                    <button onClick={() => { setSelectedPatientId(null); setPatientDetail(null); }}
                        className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-xs uppercase transition-all mb-6">
                        <ArrowLeft className="w-4 h-4" /> Back to Facility Registry
                    </button>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Beneficiary Comprehensive Record</h1>
                    <p className="text-slate-500 text-sm font-medium mt-1 uppercase tracking-wider">Health Identifier: M-{selectedPatientId.toString().padStart(4, '0')}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-8">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                            className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center relative overflow-hidden">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-100 to-rose-50 mx-auto flex items-center justify-center text-rose-600 text-3xl font-extrabold mb-6 border-4 border-white shadow-lg">
                                {profile.name.charAt(0)}
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 leading-tight">{profile.name}</h2>
                            <div className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-wider">{profile.block}, {profile.district}</div>
                            <div className="mt-8 p-4 bg-rose-50/50 rounded-2xl border border-rose-100 flex flex-col items-center">
                                <div className="text-[9px] text-rose-500 font-bold uppercase mb-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> AI Risk Indicator</div>
                                <div className={`text-lg font-extrabold ${curPregData?.risk_level === 'HIGH' ? 'text-rose-600' : 'text-emerald-600'}`}>{curPregData?.risk_level || 'LOW'}</div>
                            </div>
                            <div className="mt-8 space-y-3">
                                <div className="flex justify-between p-3 bg-slate-50 rounded-xl"><span className="text-[10px] font-bold text-slate-400 uppercase">Age</span><span className="text-sm font-bold text-slate-900">{profile.age} Years</span></div>
                                <div className="flex justify-between p-3 bg-slate-50 rounded-xl"><span className="text-[10px] font-bold text-slate-400 uppercase">Phone</span><span className="text-sm font-bold text-slate-900">{profile.phone}</span></div>
                            </div>
                        </motion.div>
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Benefit History</h3>
                            <div className="space-y-4">
                                {patientDetail.applications.map((app, i) => (
                                    <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                        <div className="flex justify-between items-center mb-1">
                                            <div className="text-xs font-bold text-slate-900">{app.type}</div>
                                            <div className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${app.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>{app.status}</div>
                                        </div>
                                    </div>
                                ))}
                                {patientDetail.applications.length === 0 && <div className="text-center text-xs text-slate-400 py-4 italic">No application records found.</div>}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">Clinical Pathway Timeline</h3>
                            <div className="relative pl-4">
                                <div className="absolute left-10 top-0 bottom-0 w-0.5 bg-slate-100" />
                                <div className="space-y-12 relative pb-4">
                                    {timeline.map((item, idx) => (
                                        <div key={idx} className="flex gap-10 items-start">
                                            <div className={`w-12 h-12 rounded-2xl border-2 border-white shadow-md flex items-center justify-center relative z-10 transition-all ${item.status === 'completed' ? 'bg-emerald-500 text-white' :
                                                item.status === 'upcoming' ? 'bg-rose-600 text-white scale-110 ring-4 ring-rose-50 shadow-rose-100' : 'bg-slate-100 text-slate-300'
                                                }`}>
                                                {item.status === 'completed' ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                                            </div>
                                            <div className="pt-1">
                                                <h4 className={`text-lg font-bold ${item.status === 'upcoming' ? 'text-rose-600' : 'text-slate-900'}`}>{item.title}</h4>
                                                <p className="text-xs text-slate-500 font-medium">{item.date}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Linked Children & Immunization</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {curPregData?.children.map((child, i) => (
                                    <div key={i} className={`p-4 rounded-2xl border ${child.offtrack ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
                                        <div className="font-bold text-slate-900">{child.name}</div>
                                        <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">Status: {child.offtrack ? 'Immunization Gap' : 'On Track'}</div>
                                        <div className="mt-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Coverage: {child.immunizations}</div>
                                    </div>
                                ))}
                                {curPregData?.children.length === 0 && <div className="col-span-2 text-center text-xs text-slate-400 py-6 italic border-2 border-dashed border-slate-50 rounded-2xl">No children records linked.</div>}
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // ──────── Main Dashboard View ────────
    return (
        <DashboardLayout roleTitle="Facility Risk & Follow‑up Console" roleIcon={<HospitalIcon className="w-6 h-6 text-emerald-600" />} roleColor="bg-emerald-50">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
                <div className="max-w-xl">
                    <p className="text-slate-500 font-bold leading-relaxed">
                        Facility Registry · <span className="text-slate-900 underline underline-offset-4 decoration-emerald-200 decoration-4">Showing patients linked to this unit.</span>
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => alert("Downloading Facility Registry (XLSX)...")}
                        className="px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-2">
                        <Download className="w-4 h-4" /> Export Registry
                    </button>
                    <button onClick={() => setShowAddModal(true)}
                        className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-lg hover:shadow-xl hover:bg-emerald-700 transition-all flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Register New Mother
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center"><Users className="w-6 h-6" /></div>
                    <div><div className="text-2xl font-extrabold text-slate-900">{data?.total_managed || 0}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Total Catchment</div></div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center"><AlertCircle className="w-6 h-6" /></div>
                    <div><div className="text-2xl font-extrabold text-slate-900">{beneficiaries.filter(p => p.risk === 'HIGH').length}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">High-Risk Alerts</div></div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center"><Activity className="w-6 h-6" /></div>
                    <div><div className="text-2xl font-extrabold text-slate-900">{beneficiaries.filter(p => p.offtrack_history).length}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Coverage Off-Track</div></div>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="flex border-b border-slate-100 px-6 overflow-x-auto bg-slate-50/50">
                    {[
                        { id: 'all', label: 'All Registered' },
                        { id: 'high-risk', label: 'Urgent High-Risk' },
                        { id: 'off-track', label: 'Follow-up Needed' }
                    ].map((tab) => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-4 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${activeTab === tab.id ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                                }`}>{tab.label}</button>
                    ))}
                </div>

                <div className="p-8">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b border-slate-50">
                                    <th className="pb-4">Mother / Beneficiary</th>
                                    <th className="pb-4">Risk Level</th>
                                    <th className="pb-4">Status & Gaps</th>
                                    <th className="pb-4">EDD / Next Care</th>
                                    <th className="pb-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {beneficiaries
                                    .filter(p => {
                                        if (activeTab === 'high-risk') return p.risk === 'HIGH';
                                        if (activeTab === 'off-track') return p.offtrack_history;
                                        return true;
                                    })
                                    .map((person, idx) => {
                                        const isPregnant = person.status === 'PREGNANT';
                                        const hasChildren = person.children && person.children.length > 0;
                                        return (
                                            <motion.tr key={person.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.02 }}
                                                className={`group hover:bg-slate-50/50 transition-all cursor-pointer border-l-4 ${isPregnant ? 'border-l-violet-400' : 'border-l-teal-400'}`}
                                                onClick={() => fetchPatientDetail(person.id)}>
                                                <td className="py-4 pl-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shadow-sm ring-1 transition-all ${isPregnant ? 'bg-violet-50 text-violet-700 ring-violet-100/50 group-hover:bg-violet-600 group-hover:text-white'
                                                            : 'bg-teal-50 text-teal-700 ring-teal-100/50 group-hover:bg-teal-600 group-hover:text-white'
                                                            }`}>
                                                            {isPregnant ? <Heart className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-900 text-sm leading-tight">{person.name}</div>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${isPregnant ? 'bg-violet-100 text-violet-600' : 'bg-teal-100 text-teal-600'}`}>
                                                                    {isPregnant ? '🤰 Pregnant' : '👩 Post-Delivery'}
                                                                </span>
                                                                <span className="text-[10px] text-slate-400 font-bold">ID: M-{person.id.toString().padStart(4, '0')}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    <div className="flex flex-col gap-1">
                                                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[9px] font-black tracking-widest uppercase border w-fit ${person.risk === 'HIGH' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                            person.risk === 'MEDIUM' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                            }`}>
                                                            <div className={`w-1.5 h-1.5 rounded-full ${person.risk === 'HIGH' ? 'bg-rose-500 animate-pulse' : person.risk === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                                            {person.risk}
                                                        </span>
                                                        {person.risk_score > 0 && <span className="text-[9px] font-bold text-slate-400 pl-1">Score: {(person.risk_score * 100).toFixed(0)}%</span>}
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    <div className="flex flex-col gap-2">
                                                        <div className={`flex items-center gap-2 text-xs font-bold leading-none ${person.offtrack_history ? 'text-rose-600' : 'text-slate-600'}`}>
                                                            {person.offtrack_history ? <><AlertCircle className="w-3.5 h-3.5" /> Follow-up Gap</> : <><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> On-Track</>}
                                                        </div>
                                                        {!isPregnant && hasChildren && person.children.map((child, ci) => (
                                                            <div key={ci} className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 border border-amber-200 rounded-lg w-fit">
                                                                <Baby className="w-3 h-3 text-amber-500" />
                                                                <span className="text-[9px] font-black text-amber-700">{child.name}</span>
                                                                <span className="text-[8px] text-amber-500 font-bold">{child.immunizations_completed}/{child.immunizations_expected} imm.</span>
                                                                {child.offtrack ? <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" /> : <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                                                            </div>
                                                        ))}
                                                        {isPregnant && (
                                                            <div className="flex items-center gap-1.5 px-2 py-1 bg-violet-50 border border-dashed border-violet-200 rounded-lg w-fit">
                                                                <Baby className="w-3 h-3 text-violet-300" /><span className="text-[9px] font-bold text-violet-400">Not yet born</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    <div className="text-xs font-bold text-slate-900">{isPregnant ? (person.edd || 'TBD') : (person.delivery_date || '—')}</div>
                                                    <div className="text-[9px] text-slate-400 uppercase font-bold mt-0.5">{isPregnant ? 'Expected Delivery' : 'Delivered'}</div>
                                                </td>
                                                <td className="py-4 text-right">
                                                    <div className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                        Personal Profile <FileText className="w-3.5 h-3.5" />
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {detailLoading && (
                <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-2xl shadow-xl flex items-center gap-4 border border-slate-100 italic font-bold text-emerald-600 animate-bounce">
                        <Activity className="w-6 h-6 animate-pulse" /> Opening Patient File...
                    </div>
                </div>
            )}

            <div className="mt-12 text-center">
                <span className="text-[10px] text-slate-400 border px-3 py-1 rounded-full uppercase tracking-widest font-black bg-white shadow-sm border-slate-100 italic">
                    Restricted Access · Hospital Catchment Records Only
                </span>
            </div>

            {/* Add Mother Modal */}
            <AddMotherModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                hospitalId={hospitalId}
                onSuccess={fetchHospitalData}
            />
        </DashboardLayout>
    );
};

export default HospitalDashboard;
