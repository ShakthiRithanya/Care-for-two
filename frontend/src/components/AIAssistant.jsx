import React from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const AIAssistant = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Don't show FAB on the AI agent page itself
    if (location.pathname === '/ai-agent') return null;

    return (
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="fixed bottom-8 right-8 z-50 group"
        >
            <button
                onClick={() => navigate('/ai-agent')}
                className="w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-110 hover:rotate-12 group-hover:shadow-blue-500/50"
            >
                <Bot className="w-8 h-8 text-white fill-white/20" />

                {/* Ping animation to show activity */}
                <span className="absolute top-0 right-0 -mr-1 -mt-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white animate-pulse"></span>
            </button>
            <div className="absolute bottom-20 right-0 bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Ask Sentinel AI
            </div>
        </motion.div>
    );
};

export default AIAssistant;

