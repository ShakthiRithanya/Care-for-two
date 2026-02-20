import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, Bell, User, LogOut, Menu, Search, Info, Terminal } from 'lucide-react';
import AboutModal from './AboutModal';

const DashboardLayout = ({ children, roleTitle, roleIcon, roleColor }) => {
    const navigate = useNavigate();
    const [isAboutOpen, setIsAboutOpen] = useState(false);

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Sidebar */}
            <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-white">
                <div className="p-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                        <Heart className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold">CARE FOR TWO</span>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">Main Menu</div>
                    <button
                        onClick={() => {
                            const user = JSON.parse(localStorage.getItem('maatri_user'));
                            if (user?.role === 'ADMIN') navigate('/dashboard/admin');
                            else if (user?.role === 'AUTHORIZER') navigate('/dashboard/authorizer');
                            else if (user?.role === 'HOSPITAL') navigate('/dashboard/hospital');
                            else if (user?.role === 'BENEFICIARY') navigate('/dashboard/beneficiary');
                            else navigate('/');
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 bg-slate-800 rounded-lg text-white font-medium"
                    >
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-500" /> Dashboard
                    </button>
                    <Link to="/architecture" className="flex items-center gap-3 px-3 py-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                        <Terminal className="w-4 h-4" /> System Architecture
                    </Link>
                    <button
                        onClick={() => setIsAboutOpen(true)}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                    >
                        <Info className="w-4 h-4" /> About CARE FOR TWO
                    </button>
                </nav>

                <div className="p-4 mt-auto">
                    <div className="bg-slate-800 rounded-xl p-4">
                        <div className="text-xs text-slate-500 mb-1">Demo Environment</div>
                        <div className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-center uppercase">Synthetic Data Only</div>
                        <button
                            onClick={() => {
                                localStorage.removeItem('maatri_user');
                                navigate('/');
                            }}
                            className="mt-4 flex items-center gap-2 text-xs text-rose-400 hover:text-rose-300 transition-colors uppercase font-bold w-full text-left"
                        >
                            <LogOut className="w-3 h-3" /> Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${roleColor} hidden sm:block shadow-inner`}>
                            {roleIcon}
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 leading-tight">{roleTitle}</h1>
                            <div className="text-xs text-slate-500 font-medium">CARE FOR TWO Intelligence Engine 2.0</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden sm:flex items-center bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 min-w-[300px]">
                            <Search className="w-4 h-4 text-slate-400 mr-2" />
                            <input type="text" placeholder="Search records, schemes..." className="bg-transparent border-none outline-none text-sm w-full" />
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsAboutOpen(true)}
                                className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all"
                                title="About"
                            >
                                <Info className="w-5 h-5" />
                            </button>
                            <button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-lg">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
                            </button>
                            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold border-2 border-primary-50">
                                C2
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dynamic Content Area */}
                <main className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>

            <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
        </div>
    );
};

export default DashboardLayout;
