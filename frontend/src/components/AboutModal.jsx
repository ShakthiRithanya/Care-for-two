import React, { useState } from 'react';
import { X, Info, ShieldCheck, BrainCircuit, AlertTriangle, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AboutModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                                <BrainCircuit className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">About MaatriNet</h2>
                                <p className="text-xs text-slate-400">AI-First Maternal Health Intelligence</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <X className="w-6 h-6 text-white" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                        <section>
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Info className="w-4 h-4 text-primary-500" /> Executive Summary
                            </h3>
                            <p className="text-slate-600 leading-relaxed italic border-l-4 border-primary-200 pl-4">
                                "MaatriNet is a concept demo of an AI-powered maternal and child health platform for India.
                                It uses synthetic data to simulate pregnancies, deliveries, newborn care, and scheme benefits,
                                demonstrating how machine learning can prioritize care for those who need it most."
                            </p>
                        </section>

                        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                                    <Cpu className="w-5 h-5" />
                                </div>
                                <h4 className="font-bold text-slate-900 mb-2">AI-Driven Logic</h4>
                                <p className="text-xs text-slate-500 mb-2">
                                    Uses **Gradient Boosting classifiers** (Scikit-Learn) to estimate:
                                </p>
                                <ul className="text-xs text-slate-600 space-y-1 ml-4 list-disc">
                                    <li>Pre-birth risk (Pregnancy)</li>
                                    <li>Post-birth risk (Mother-Baby pair)</li>
                                    <li>Off-track coverage risk (Child)</li>
                                </ul>
                            </div>

                            <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
                                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <h4 className="font-bold text-slate-900 mb-2">Demo Coverage</h4>
                                <p className="text-xs text-slate-500 mb-2">
                                    Simulates full ecosystem tracking:
                                </p>
                                <ul className="text-xs text-slate-600 space-y-1 ml-4 list-disc">
                                    <li>ANC/PNC service adherence</li>
                                    <li>Incentive scheme applications</li>
                                    <li>Immunization cycle progress</li>
                                </ul>
                            </div>
                        </section>

                        <section className="p-5 bg-rose-50 rounded-2xl border border-rose-100 flex gap-4">
                            <AlertTriangle className="w-8 h-8 text-rose-500 shrink-0" />
                            <div>
                                <h4 className="font-bold text-rose-900 mb-1">Standard Disclaimer</h4>
                                <p className="text-xs text-rose-700 leading-relaxed">
                                    This is a prototype using **synthetic data only**. It is not a medical device and
                                    is intended for demonstration purposes. It must not be used for real-world clinical
                                    decisions or diagnostics.
                                </p>
                            </div>
                        </section>
                    </div>

                    {/* Footer */}
                    <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-slate-900 text-white font-bold rounded-xl text-sm shadow-lg hover:shadow-xl transition-all"
                        >
                            Understood
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AboutModal;
