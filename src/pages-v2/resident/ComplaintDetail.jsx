import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Home, MessageSquare, AlertCircle, Package, Bell, Settings,
    Menu, X, LogOut, ChevronRight, Loader, ArrowLeft, Calendar, User
} from 'lucide-react';

const ComplaintDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [theme, setTheme] = useState('light');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [complaint, setComplaint] = useState(null);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
    }, []);

    useEffect(() => {
        const fetchComplaint = async () => {
            const token = localStorage.getItem('token');
            if (!token) { navigate('/login'); return; }
            try {
                setLoading(true);
                const res = await fetch(`http://localhost:4000/api/complaints/${encodeURIComponent(id)}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) setComplaint(data.data);
                else setError('Complaint not found');
            } catch (err) {
                setError('Unable to load complaint');
            } finally {
                setLoading(false);
            }
        };
        fetchComplaint();
    }, [id, navigate]);

    const isDark = theme === 'dark';

    const sidebarItems = [
        { icon: Home, label: 'Dashboard', path: '/resident/dashboard' },
        { icon: MessageSquare, label: 'My Complaints', path: '/resident/complaints', active: true },
        { icon: AlertCircle, label: 'Raise Complaint', path: '/resident/complaints/new' },
        { icon: Package, label: 'Visitors', path: '/resident/visitors' },
        { icon: Bell, label: 'Notices', path: '/resident/notices' },
        { icon: Settings, label: 'Settings', path: '/resident/settings' }
    ];

    const getStatusStyle = (status) => {
        const s = status?.toUpperCase();
        if (s === 'RESOLVED') return 'bg-green-100 text-green-700';
        if (s === 'IN_PROGRESS') return 'bg-blue-100 text-blue-700';
        return 'bg-orange-100 text-orange-700';
    };

    const handleLogout = () => { localStorage.clear(); navigate('/login'); };

    return (
        <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-gray-50'} transition-colors duration-300`}>
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 ${isDark ? 'bg-[#1a1a1a] border-gray-800' : 'bg-white border-gray-200'} border-r transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 ${isDark ? 'bg-gray-800' : 'bg-gray-900'} rounded-lg flex items-center justify-center`}>
                            <span className="text-white font-bold text-sm">N</span>
                        </div>
                        <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>NammaVeedu</span>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
                        <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                    </button>
                </div>
                <nav className="p-4 space-y-1">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button key={item.path} onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${item.active
                                    ? isDark ? 'bg-gray-700 text-white' : 'bg-blue-600 text-white'
                                    : isDark ? 'text-gray-400 hover:bg-gray-800 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`}>
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>
                <div className={`absolute bottom-0 left-0 right-0 p-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                    <button onClick={handleLogout} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'}`}>
                        <LogOut className="w-5 h-5" /><span className="font-medium">Logout</span>
                    </button>
                </div>
            </div>

            {/* Main */}
            <div className="lg:ml-64">
                <div className={`${isDark ? 'bg-[#1a1a1a] border-gray-800' : 'bg-white border-gray-200'} border-b sticky top-0 z-40`}>
                    <div className="px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
                                <Menu className={`w-6 h-6 ${isDark ? 'text-white' : 'text-gray-900'}`} />
                            </button>
                            <div className="flex items-center gap-2">
                                <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Complaints</span>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>#{id}</span>
                            </div>
                            <div />
                        </div>
                    </div>
                </div>

                <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
                    <button onClick={() => navigate('/resident/complaints')}
                        className={`flex items-center gap-2 text-sm mb-6 ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>
                        <ArrowLeft className="w-4 h-4" /> Back to Complaints
                    </button>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
                        </div>
                    ) : error ? (
                        <div className={`text-center py-20 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{error}</div>
                    ) : complaint ? (
                        <div className="space-y-6">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                                <div>
                                    <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Complaint #{complaint.id}</h1>
                                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Flat {complaint.flatNumber}</p>
                                </div>
                                <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusStyle(complaint.status)}`}>
                                    {complaint.status}
                                </span>
                            </div>

                            {/* Details Card */}
                            <div className={`${isDark ? 'bg-[#252525] border-gray-800' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
                                <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Issue Description</h2>
                                <p className={`leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{complaint.description}</p>

                                <div className="grid sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <Calendar className={`w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                                        <div>
                                            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Created</p>
                                            <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{new Date(complaint.createdAt).toLocaleDateString('en-IN')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <User className={`w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                                        <div>
                                            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Assigned To</p>
                                            <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{complaint.assignedTo || 'Not assigned'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Comments */}
                            {complaint.comments && complaint.comments.length > 0 && (
                                <div className={`${isDark ? 'bg-[#252525] border-gray-800' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
                                    <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Comments</h2>
                                    <div className="space-y-3">
                                        {complaint.comments.map((c) => (
                                            <div key={c.id} className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{c.author?.name || 'User'}</span>
                                                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{new Date(c.createdAt).toLocaleString('en-IN')}</span>
                                                </div>
                                                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{c.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>
            </div>

            {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
        </div>
    );
};

export default ComplaintDetail;
