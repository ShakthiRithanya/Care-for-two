import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { User, Calendar, FileText, Gift, MapPin, Phone, CheckCircle2, Clock, Plus, Send, X, ChevronRight, ChevronLeft, Stethoscope, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

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

const ApplicationForm = ({ hospitals, initialData, onSubmit }) => {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        // Scheme & Hospital
        scheme_type: 'JSY-like', hospital_id: '',
        // Personal
        name: initialData?.profile?.name || '',
        age: initialData?.profile?.age !== '--' ? initialData.profile.age : '',
        phone: initialData?.profile?.phone || '',
        rch_id: '',
        // Address
        state: '', district: initialData?.profile?.district !== '--' ? initialData.profile.district : '', block: initialData?.profile?.block !== '--' ? initialData.profile.block : '', village: '',
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

    // Auto-fill some data if available in initialData logic could handle more detailed props if backend sent them

    const inputClass = "w-full px-4 py-3 bg-slate-50 rounded-xl ring-1 ring-slate-100 focus:ring-rose-500 outline-none font-medium text-slate-800 text-sm transition-all placeholder:text-slate-400";
    const selectClass = "w-full px-4 py-3 bg-slate-50 rounded-xl ring-1 ring-slate-100 focus:ring-rose-500 outline-none font-medium text-slate-800 text-sm appearance-none cursor-pointer transition-all";
    const labelClass = "text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em] mb-1 block";
    const checkClass = "flex items-center gap-3 p-3 bg-slate-50 rounded-xl ring-1 ring-slate-100 cursor-pointer hover:ring-rose-300 transition-all text-sm";

    const canStep1 = form.name && form.age && form.phone;
    const canStep2 = form.district && form.block;

    return (
        <div className="flex flex-col">
            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-2 mb-8 text-center">
                {[{ n: 1, l: 'Scheme & Personal' }, { n: 2, l: 'Location & Profile' }, { n: 3, l: 'Pregnancy Status' }, { n: 4, l: 'Health Vitals' }].map((s, i) => (
                    <div key={s.n} className="flex items-center gap-1.5">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${s.n === step ? 'bg-rose-600 text-white shadow-md' : s.n < step ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                            {s.n < step ? '✓' : s.n}
                        </div>
                        <span className={`text-[9px] font-bold uppercase tracking-wider hidden sm:inline ${s.n === step ? 'text-rose-700' : 'text-slate-400'}`}>{s.l}</span>
                        {i < 3 && <div className={`w-4 h-0.5 rounded-full ${s.n < step ? 'bg-rose-300' : 'bg-slate-100'}`} />}
                    </div>
                ))}
            </div>

            <div className="min-h-[300px]">
                {/* Step 1: Scheme & Personal */}
                {step === 1 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="grid grid-cols-2 gap-4">

                            <div><label className={labelClass}>Hospital *</label>
                                <select className={selectClass} value={form.hospital_id} onChange={e => update('hospital_id', e.target.value)}>
                                    <option value="">Select Hospital</option>
                                    {hospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                                </select>
                            </div>
                            <div className="col-span-2 border-t border-slate-100 my-2"></div>
                            <div className="col-span-2"><label className={labelClass}>Full Name *</label><input type="text" placeholder="Mother's full name" required className={inputClass} value={form.name} onChange={e => update('name', e.target.value)} /></div>
                            <div><label className={labelClass}>Age *</label><input type="number" placeholder="Age" min="14" max="55" required className={inputClass} value={form.age} onChange={e => update('age', e.target.value)} /></div>
                            <div><label className={labelClass}>Phone *</label><input type="text" placeholder="Mobile Number" required className={inputClass} value={form.phone} onChange={e => update('phone', e.target.value)} /></div>
                            <div className="col-span-2"><label className={labelClass}>RCH ID (Optional)</label><input type="text" placeholder="Reproductive Child Health ID" className={inputClass} value={form.rch_id} onChange={e => update('rch_id', e.target.value)} /></div>
                        </div>
                    </div>
                )}

                {/* Step 2: Address & Socio */}
                {step === 2 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
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
                                <label className={checkClass}><input type="checkbox" className="w-4 h-4 accent-rose-600" checked={form.bpl_card} onChange={e => update('bpl_card', e.target.checked)} />
                                    <span className="font-bold text-slate-700">BPL Card Holder</span></label>
                                <label className={checkClass}><input type="checkbox" className="w-4 h-4 accent-rose-600" checked={form.aadhaar_linked} onChange={e => update('aadhaar_linked', e.target.checked)} />
                                    <span className="font-bold text-slate-700">Aadhaar Linked</span></label>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Pregnancy History */}
                {step === 3 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
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
                                <label className={checkClass + " w-full"}><input type="checkbox" className="w-4 h-4 accent-rose-600" checked={form.usg_done} onChange={e => update('usg_done', e.target.checked)} />
                                    <span className="font-bold text-slate-700">USG Done</span></label>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            <label className={checkClass}><input type="checkbox" className="w-4 h-4 accent-rose-600" checked={form.rh_negative} onChange={e => update('rh_negative', e.target.checked)} />
                                <span className="font-bold text-slate-700">Rh Negative</span></label>
                            <label className={checkClass}><input type="checkbox" className="w-4 h-4 accent-rose-600" checked={form.institutional_delivery_planned} onChange={e => update('institutional_delivery_planned', e.target.checked)} />
                                <span className="font-bold text-slate-700">Institutional Delivery Planned</span></label>
                        </div>
                    </div>
                )}

                {/* Step 4: Clinical Vitals & Conditions */}
                {step === 4 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
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
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="pt-6 border-t border-slate-100 flex gap-3 shrink-0 bg-white mt-4">
                {step > 1 && (
                    <button type="button" onClick={() => setStep(step - 1)} className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm transition-all hover:bg-slate-200 flex items-center gap-1">
                        <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                )}
                <div className="flex-1" />
                {step < 4 ? (
                    <button type="button" disabled={step === 1 ? !canStep1 : step === 2 ? !canStep2 : false} onClick={() => setStep(step + 1)}
                        className="px-8 py-3 bg-rose-600 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-rose-700 transition-all disabled:opacity-40 flex items-center gap-2">
                        Next <ChevronRight className="w-4 h-4" />
                    </button>
                ) : (
                    <button type="button" onClick={() => onSubmit(form)}
                        className="px-8 py-3 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center gap-2">
                        Submit Application <Send className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
};

const BeneficiaryDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hospitals, setHospitals] = useState([]);

    // Scheme Form State
    const [showForm, setShowForm] = useState(false);
    const [schemeForm, setSchemeForm] = useState({ scheme_type: 'JSY-like', hospital_id: '' });

    const [recommendations, setRecommendations] = useState(null);
    const [trackingApp, setTrackingApp] = useState(null);

    const fetchBeneficiaryData = async () => {
        try {
            const userStr = localStorage.getItem('maatri_user');
            if (!userStr) return;
            const user = JSON.parse(userStr);

            const [dashRes, adminRes] = await Promise.all([
                axios.get('http://localhost:8000/api/beneficiary/dashboard', { params: { user_id: user.user_id } }),
                axios.get('http://localhost:8000/api/admin/overview') // To get hospitals list
            ]);
            setData(dashRes.data);
            setHospitals(adminRes.data.hospitals);
        } catch (error) {
            console.error("Error fetching beneficiary data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBeneficiaryData();
    }, []);

    const handleApply = async (formData) => {
        try {
            const user = JSON.parse(localStorage.getItem('maatri_user'));

            const res = await axios.post('http://localhost:8000/api/beneficiary/complete-profile-and-apply', {
                ...formData,
                user_id: user.user_id,
            });
            setShowForm(false);
            fetchBeneficiaryData();

            if (res.data.recommended_schemes && res.data.recommended_schemes.length > 0) {
                setRecommendations(res.data.recommended_schemes);
            } else {
                alert("Profile Updated & Application Submitted Successfully!");
            }

        } catch (err) { alert("Submission failed. Please check your data."); console.error(err); }
    };

    const getTrackingSteps = (status) => {
        const steps = [
            { title: "Application Submitted", date: "Feb 15, 2026", status: "completed" },
            { title: "Hospital Verification", date: "Feb 16, 2026", status: "completed" },
            { title: "State Authorizer Review", date: "In Progress", status: status === 'APPROVED' ? 'completed' : status === 'REJECTED' ? 'rejected' : 'current' },
            { title: "Funds Disbursement", date: "Pending", status: status === 'APPROVED' ? 'current' : 'upcoming' },
        ];
        return steps;
    };

    // Tracking Modal
    if (trackingApp) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
                >
                    <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold">Application Tracker</h2>
                            <p className="text-slate-400 text-sm">{trackingApp.type}</p>
                        </div>
                        <button onClick={() => setTrackingApp(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-8">
                        <div className="relative pl-4 space-y-8">
                            <div className="absolute left-[19px] top-2 bottom-4 w-0.5 bg-slate-100" />
                            {getTrackingSteps(trackingApp.status).map((step, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    key={idx}
                                    className="flex gap-4 relative"
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 border-4 border-white shadow-md ${step.status === 'completed' ? 'bg-emerald-500 text-white' :
                                        step.status === 'current' ? 'bg-blue-600 text-white ring-4 ring-blue-50' :
                                            step.status === 'rejected' ? 'bg-rose-500 text-white' :
                                                'bg-slate-100 text-slate-300'
                                        }`}>
                                        {step.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> :
                                            step.status === 'rejected' ? <X className="w-5 h-5" /> :
                                                step.status === 'current' ? <div className="w-3 h-3 bg-white rounded-full animate-pulse" /> :
                                                    <div className="w-2 h-2 bg-slate-400 rounded-full" />
                                        }
                                    </div>
                                    <div>
                                        <h4 className={`font-bold ${step.status === 'completed' ? 'text-emerald-700' :
                                            step.status === 'current' ? 'text-blue-700' :
                                                step.status === 'rejected' ? 'text-rose-700' :
                                                    'text-slate-400'
                                            }`}>{step.title}</h4>
                                        <p className="text-xs text-slate-400 font-medium">{step.date}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-400 font-medium">
                        Tracking ID: #{Math.random().toString(36).substr(2, 9).toUpperCase()}
                    </div>
                </motion.div>
            </div>
        );
    }

    // Scheme Recommendation Modal (existing code...)
    if (recommendations) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
                >
                    <div className="bg-gradient-to-r from-rose-500 to-pink-600 p-8 text-white text-center">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
                            <Gift className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Profile Completed Successfully!</h2>
                        <p className="text-rose-100">Based on your details, you are eligible for the following schemes:</p>
                    </div>

                    <div className="p-8 max-h-[60vh] overflow-y-auto">
                        <div className="grid gap-4">
                            {recommendations.map((rec, idx) => (
                                <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-rose-200 transition-colors">
                                    <div className="mt-1">
                                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-lg">{rec.scheme}</h3>
                                        <p className="text-slate-600 text-sm mb-2">{rec.reason}</p>
                                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 w-fit">
                                            <FileText className="w-3 h-3" />
                                            Required: {rec.docs}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-center">
                        <button onClick={() => setRecommendations(null)} className="px-8 py-3 bg-rose-600 text-white rounded-xl font-bold shadow-lg hover:bg-rose-700 transition-all">
                            Continue to Dashboard
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (loading) return <div className="p-20 text-center font-bold text-rose-600 italic">Accessing Your Journey Data...</div>;

    const profile = data?.profile || { name: 'User', age: '--', district: '--' };
    const latestPregnancy = data?.pregnancies?.[0] || null;
    const children = latestPregnancy?.children || [];

    const timeline = [
        { title: 'ANC Visit 1', status: 'completed', date: 'Done' },
        { title: 'ANC Visit 2', status: (latestPregnancy?.anc_status.split('/')[0] >= 2) ? 'completed' : 'upcoming', date: 'Checkup Complete' },
        { title: 'ANC Visit 3', status: 'upcoming', date: latestPregnancy?.edd ? 'Predicted Mid-Term' : 'TBD' },
        { title: 'Institutional Delivery', status: 'pending', date: latestPregnancy?.edd || 'TBD' },
    ];

    return (
        <DashboardLayout
            roleTitle="Your Mother & Baby Care Journey"
            roleIcon={<User className="w-6 h-6 text-rose-600" />}
            roleColor="bg-rose-50"
        >
            <div className="mb-8 flex justify-between items-center">
                <p className="text-slate-500 font-medium">Track your care, scheme applications, and upcoming visits in one place.</p>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="btn-primary bg-rose-600 hover:bg-rose-700 shadow-rose-100"
                >
                    <Plus className="w-4 h-4" /> Apply for Scheme
                </button>
            </div>

            {showForm && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mb-10 bg-white p-8 rounded-3xl border border-rose-100 shadow-sm overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold flex items-center gap-2 text-rose-600"><Gift className="w-5 h-5" /> Profile Update & Scheme Application</h3>
                        <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                    </div>

                    <ApplicationForm
                        hospitals={hospitals}
                        initialData={data}
                        onSubmit={handleApply}
                        schemeForm={schemeForm}
                        setSchemeForm={setSchemeForm}
                    />
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Profile & Quick Info */}
                <div className="lg:col-span-1 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center relative overflow-hidden"
                    >
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 border-b pb-2">My Details & Family</h3>
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-100 to-rose-50 mx-auto flex items-center justify-center text-rose-600 text-3xl font-extrabold mb-6 border-4 border-white shadow-lg">
                            {profile.name.charAt(0)}
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 leading-tight">{profile.name}</h2>
                        <div className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-wider">{profile.block} District</div>

                        <div className="mt-8 p-4 bg-rose-50/50 rounded-2xl border border-rose-100 flex flex-col items-center">
                            <div className="text-[9px] text-rose-500 font-bold uppercase mb-1 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> AI Risk Status (Demo)
                            </div>
                            <div className={`text-lg font-extrabold ${latestPregnancy?.risk_level === 'HIGH' ? 'text-rose-600' : 'text-emerald-600'}`}>
                                {latestPregnancy?.risk_level || 'LOW'}
                            </div>
                            <p className="text-[9px] text-slate-400 mt-2 italic px-4 leading-tight">This score is an indicator for demonstration, not for clinical diagnostic use.</p>
                        </div>

                        <div className="mt-8 grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Pregnancy</div>
                                <div className="text-sm font-bold text-slate-900">
                                    {latestPregnancy?.week ? `Week ${latestPregnancy.week}` : 'Week --'}
                                </div>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Hb Level</div>
                                <div className="text-sm font-bold text-slate-900">
                                    {latestPregnancy?.hb_level ? `${latestPregnancy.hb_level} g/dL` : '--'}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => alert("Connecting to Maternal Health Helpdesk (1800-XXX-XXXX)...")}
                            className="w-full mt-8 py-4 bg-rose-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-rose-200 hover:bg-rose-700 transition-all flex items-center justify-center gap-2"
                        >
                            <Phone className="w-4 h-4" /> 24x7 Helpdesk
                        </button>
                    </motion.div>

                    {/* Scheme Status */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            My Scheme Applications
                        </h3>
                        <div className="space-y-4">
                            {data?.applications.map((scheme, i) => (
                                <div key={i} className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 flex flex-col gap-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="text-xs font-bold text-slate-900 mb-1">{scheme.type}</div>
                                            <div className="text-[10px] text-slate-400">Application #{1000 + i}</div>
                                        </div>
                                        <div className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${scheme.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                                            scheme.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                                            }`}>{scheme.status}</div>
                                    </div>

                                    <button
                                        onClick={() => setTrackingApp(scheme)}
                                        className="w-full py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-600 uppercase tracking-wider hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        Track Status <ChevronRight className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                            {data?.applications.length === 0 && <div className="text-center text-xs text-slate-400 py-4 italic border-2 border-dashed border-slate-50 rounded-2xl">No active benefit applications.</div>}
                        </div>
                    </div>
                </div>

                {/* Right: Timeline & Upcoming */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                            Pregnancy & Delivery Timeline
                        </h3>

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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Upcoming Visits */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Upcoming Visits & Immunizations</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary-600 font-bold shadow-sm">24</div>
                                    <div>
                                        <div className="text-xs font-bold text-slate-800 tracking-tight">ANC Follow-up</div>
                                        <div className="text-[10px] text-slate-400 italic">Expected next month</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Hospital Info */}
                        {data?.hospital && (
                            <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl overflow-hidden relative border border-slate-800">
                                <div className="relative z-10">
                                    <h3 className="text-xs font-bold mb-6 flex items-center gap-2 text-primary-400 uppercase tracking-widest">
                                        Linked Health Facility
                                    </h3>
                                    <div className="text-2xl font-extrabold mb-1 tracking-tight">{data.hospital.name}</div>
                                    <div className="flex items-center gap-2 text-slate-400 text-[10px] mb-8 font-medium">
                                        <MapPin className="w-3.5 h-3.5" /> {data.hospital.location}
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => alert(`Calling ${data.hospital.name} Emergency Line...`)}
                                            className="flex-1 py-3 bg-white text-slate-900 rounded-xl font-bold text-[10px] uppercase shadow-lg hover:bg-slate-100 transition-all"
                                        >
                                            Emergency Contact
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default BeneficiaryDashboard;
