import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Mic, Send, X, MessageCircle, ChevronDown, Activity, Shield, ArrowLeft, BarChart2 } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const AIAgentPage = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([
        { type: 'bot', text: 'Health Sentinel online. Monitoring district vitals. How can I assist?' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);
    const handleSendRef = useRef(null);

    const handleSend = useCallback(async (text = inputValue) => {
        if (!text.trim() || isSending) return;

        // User Message
        setMessages(prev => [...prev, { type: 'user', text }]);
        setInputValue('');
        setIsSending(true);

        try {
            // Simulated delay for realism
            setMessages(prev => [...prev, { type: 'loading' }]);

            const response = await axios.post('http://localhost:8000/api/assistant/query', { query: text });

            // Remove loading and add Bot Message
            setMessages(prev => {
                const filtered = prev.filter(m => m.type !== 'loading');
                return [...filtered, {
                    type: 'bot',
                    text: response.data.response,
                    action: response.data.action,
                    plot_data: response.data.plot_data
                }];
            });

        } catch (error) {
            console.error("Assistant Error:", error);
            setMessages(prev => {
                const filtered = prev.filter(m => m.type !== 'loading');
                return [...filtered, { type: 'bot', text: "Connection to Sentinel Core interrupted. Please try again." }];
            });
        } finally {
            setIsSending(false);
        }
    }, [inputValue, isSending]);

    // Keep ref in sync so speech recognition always calls the latest version
    useEffect(() => {
        handleSendRef.current = handleSend;
    }, [handleSend]);

    // Initialize Speech Recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window) {
            const recognition = new window.webkitSpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => setIsListening(false);
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInputValue(transcript);
                // Use ref to always call the latest handleSend
                handleSendRef.current(transcript);
            };

            recognitionRef.current = recognition;
        }
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const toggleMic = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            recognitionRef.current?.start();
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col relative overflow-hidden text-slate-200">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-blue-950 to-slate-950 -z-10 rounded-b-[4rem]" />

            {/* Header */}
            <div className="container mx-auto px-6 pt-8 pb-4">
                <div className="flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Back</span>
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center relative backdrop-blur-md border border-white/10 shadow-xl">
                            <Bot className="w-7 h-7 text-cyan-400" />
                            <div className="absolute top-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full animate-pulse" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">Sentinel <span className="text-cyan-400">AI</span></h1>
                            <div className="flex items-center gap-2">
                                <Activity className="w-3 h-3 text-emerald-500" />
                                <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">System Online</span>
                            </div>
                        </div>
                    </div>
                    <div className="w-20" /> {/* Spacer */}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 container mx-auto px-4 sm:px-6 pb-24 max-w-4xl relative z-10">
                <div className="bg-slate-900 rounded-3xl shadow-2xl border border-white/10 h-full min-h-[500px] flex flex-col overflow-hidden ring-1 ring-black/50">

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 bg-slate-900">
                        {messages.map((msg, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex gap-4 max-w-[85%] ${msg.type === 'user' ? 'flex-row-reverse' : 'w-full'}`}>
                                    {/* Avatar */}
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${msg.type === 'user' ? 'bg-blue-600' : 'bg-slate-800 border border-white/5'}`}>
                                        {msg.type === 'user' ? (
                                            <div className="text-white font-bold text-xs">YOU</div>
                                        ) : (
                                            <Bot className="w-5 h-5 text-cyan-400" />
                                        )}
                                    </div>

                                    {/* Bubble */}
                                    <div
                                        className={`p-6 rounded-3xl text-[15px] leading-relaxed shadow-lg ${msg.type === 'user'
                                            ? 'bg-blue-600 text-white rounded-tr-none'
                                            : msg.type === 'loading'
                                                ? 'bg-slate-800 text-slate-400 border border-white/5 rounded-tl-none italic'
                                                : 'bg-slate-800 text-slate-200 border border-white/5 rounded-tl-none w-full'
                                            }`}
                                    >
                                        {msg.type === 'loading' ? (
                                            <div className="flex gap-2 h-6 items-center px-2">
                                                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <p className="whitespace-pre-wrap">{msg.text}</p>

                                                {/* Chart Rendering */}
                                                {msg.plot_data && (
                                                    <div className="mt-4 p-4 bg-slate-950/50 rounded-2xl border border-white/5 h-80 w-full min-w-[300px]">
                                                        <h4 className="text-sm font-bold text-cyan-400 mb-4 flex items-center gap-2">
                                                            <BarChart2 className="w-4 h-4" />
                                                            {msg.plot_data.title}
                                                        </h4>
                                                        <ResponsiveContainer width="100%" height="90%">
                                                            {msg.plot_data.chart_type === 'bar' && (
                                                                <BarChart data={msg.plot_data.data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                                                    <XAxis dataKey={msg.plot_data.x_key} stroke="#94a3b8" fontSize={12} tickLine={false} />
                                                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                                                                    <RechartsTooltip
                                                                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '12px' }}
                                                                        cursor={{ fill: '#ffffff05' }}
                                                                    />
                                                                    <Bar dataKey={msg.plot_data.y_key} fill="#06b6d4" radius={[4, 4, 0, 0]} />
                                                                </BarChart>
                                                            )}
                                                            {msg.plot_data.chart_type === 'line' && (
                                                                <LineChart data={msg.plot_data.data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                                                    <XAxis dataKey={msg.plot_data.x_key} stroke="#94a3b8" fontSize={12} tickLine={false} />
                                                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                                                                    <RechartsTooltip
                                                                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '12px' }}
                                                                    />
                                                                    <Line type="monotone" dataKey={msg.plot_data.y_key} stroke="#06b6d4" strokeWidth={3} dot={{ fill: '#06b6d4' }} />
                                                                </LineChart>
                                                            )}
                                                            {msg.plot_data.chart_type === 'pie' && (
                                                                <PieChart>
                                                                    <Pie
                                                                        data={msg.plot_data.data}
                                                                        cx="50%"
                                                                        cy="50%"
                                                                        innerRadius={60}
                                                                        outerRadius={80}
                                                                        paddingAngle={5}
                                                                        dataKey="value"
                                                                    >
                                                                        {msg.plot_data.data.map((entry, index) => (
                                                                            <Cell key={`cell-${index}`} fill={['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'][index % 4]} />
                                                                        ))}
                                                                    </Pie>
                                                                    <RechartsTooltip
                                                                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '12px' }}
                                                                    />
                                                                </PieChart>
                                                            )}
                                                        </ResponsiveContainer>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Optional Quote/Data Decoration for Bot */}
                                        {msg.type === 'bot' && msg.action !== 'none' && msg.action && (
                                            <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2 text-xs text-cyan-400/80 uppercase font-bold tracking-wider">
                                                <Shield className="w-3 h-3" />
                                                <span>Verified Metric from Live Database</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-6 bg-slate-900 border-t border-white/10">
                        <div className="flex items-center gap-3 bg-black/20 p-3 rounded-2xl border border-white/5 focus-within:border-cyan-500/50 focus-within:ring-4 focus-within:ring-cyan-500/10 transition-all shadow-inner">
                            <button
                                onClick={toggleMic}
                                className={`p-4 rounded-xl transition-all duration-300 ${isListening
                                    ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/30'
                                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border border-white/5'
                                    }`}
                            >
                                <Mic className="w-6 h-6" />
                            </button>
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder={isSending ? "Sentinel AI is thinking..." : "Ask Sentinel AI a question about health data..."}
                                className="flex-1 bg-transparent border-none outline-none text-slate-200 font-medium placeholder:text-slate-500 text-base h-12"
                                autoFocus
                                disabled={isSending}
                            />
                            <button
                                onClick={() => handleSend()}
                                disabled={isSending}
                                className={`p-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl transition-all shadow-lg shadow-cyan-500/20 ${isSending ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIAgentPage;
