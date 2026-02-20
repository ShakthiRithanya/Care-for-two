import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Shield, BarChart2, TrendingUp, AlertTriangle, Activity, Calculator, CheckCircle2, LayoutGrid, MapPin, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
    LineChart, Line, Legend
} from 'recharts';

const AuthorizerAnalytics = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const sumRes = await axios.get('http://localhost:8000/api/authorizer/summary');
            setSummary(sumRes.data);
        } catch (error) {
            console.error("Error fetching analytics", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) return <div className="p-20 text-center font-bold text-slate-400 italic">Processing Population Risk Data...</div>;

    const chartData = summary?.districts?.map(d => ({
        name: d.district,
        HighRisk: d.high_risk_pre
    })) || [];

    const trendData = summary?.monthly_trend || [];

    return (
        <DashboardLayout
            roleTitle="Population Analytics"
            roleIcon={<BarChart2 className="w-6 h-6 text-blue-600" />}
            roleColor="bg-blue-50"
        >
            <div className="flex flex-col md:flex-row justify-between items-center mb-12 py-6 border-b border-slate-100">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Intelligence</h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">Cross-district risk distribution and coverage trends.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {/* District Risk Distribution */}
                <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-slate-800">High-Risk Distribution</h3>
                        <p className="text-xs text-slate-400 font-medium mt-1">Total identified high-risk pregnancies by district.</p>
                    </div>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                                <YAxis fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none' }} />
                                <Bar dataKey="HighRisk" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Monthly Coverage Trend */}
                <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-slate-800">Monthly Coverage & Risk</h3>
                        <p className="text-xs text-slate-400 font-medium mt-1">Correlating high-risk spikes with service completion rates.</p>
                    </div>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                                <YAxis fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                                <Line type="monotone" dataKey="coverage" name="Coverage %" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                                <Line type="monotone" dataKey="high_risk" name="Risk Spikes" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Block Hotspots Heatmap */}
                <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm col-span-1 lg:col-span-2">
                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-slate-800">Block Heatmap</h3>
                        <p className="text-xs text-slate-400 font-medium mt-1">Risk density across all identified health blocks.</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {summary?.blocks?.sort((a, b) => b.high_risk - a.high_risk).map((block, i) => (
                            <div key={i} className={`p-6 rounded-3xl border text-center transition-all ${block.high_risk > 15 ? 'bg-rose-50 border-rose-100 shadow-rose-100/50 shadow-lg' : 'bg-slate-50 border-slate-100'}`}>
                                <div className="text-[10px] font-black text-slate-400 uppercase truncate mb-2">{block.block.split('_')[1]}</div>
                                <div className={`text-3xl font-black ${block.high_risk > 15 ? 'text-rose-600' : 'text-slate-900'}`}>{block.high_risk}</div>
                                <div className="text-[8px] font-bold text-slate-400 uppercase mt-1">Critical Cases</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AuthorizerAnalytics;
