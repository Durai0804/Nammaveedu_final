import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Home, MessageSquare, AlertCircle, Package, Bell, Settings,
    Menu, X, LogOut, ChevronRight, Loader, Users, UserPlus, Trash2, Clock
} from 'lucide-react';

const Visitors = () => {
    const navigate = useNavigate();
    const [theme, setTheme] = useState('light');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [visitors, setVisitors] = useState([]);
    const [preApproved, setPreApproved] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [preForm, setPreForm] = useState({ name: '', purpose: 'Guest', expectedTime: '' });

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            if (!token) { navigate('/login'); return; }
            try {
                setLoading(true);
                const [visRes, preRes] = await Promise.all([
                    fetch('http://localhost:4000/api/resident/visitors', { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch('http://localhost:4000/api/resident/pre-approvals', { headers: { 'Authorization': `Bearer ${token}` } })
                ]);
                const visData = await visRes.json();
                const preData = await preRes.json();
                if (visData.success) setVisitors(visData.data || []);
                if (preData.success) setPreApproved(preData.data || []);
            } catch (err) {
                setError('Unable to load visitors');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [navigate]);

    const isDark = theme === 'dark';
    const todayStr = new Date().toLocaleDateString('en-CA');
    const todaysVisitors = useMemo(() => visitors.filter(v => new Date(v.date).toLocaleDateString('en-CA') === todayStr), [visitors, todayStr]);

    const addPreApproval = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('http://localhost:4000/api/resident/pre-approvals', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(preForm)
            });
            const data = await res.json();
            if (data.success) {
                setPreApproved(prev => [data.data, ...prev]);
                setPreForm({ name: '', purpose: 'Guest', expectedTime: '' });
                setShowModal(false);
            }
        } catch (err) {
            alert('Unable to save pre-approval');
        }
    };

    const removePreApproval = async (id) => {
        const token = localStorage.getItem('token');
        try {
            await fetch(`http://localhost:4000/api/resident/pre-approvals/${encodeURIComponent(id)}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setPreApproved(prev => prev.filter(p => String(p.id) !== String(id)));
        } catch (err) {
            alert('Unable to delete pre-approval');
        }
    };

    const sidebarItems = [
        { icon: Home, label: 'Dashboard', path: '/resident/dashboard' },
        { icon: MessageSquare, label: 'My Complaints', path: '/resident/complaints' },
        { icon: AlertCircle, label: 'Raise Complaint', path: '/resident/complaints/new' },
        { icon: Package, label: 'Visitors', path: '/resident/visitors', active: true },
        { icon: Bell, label: 'Notices', path: '/resident/notices' },
        { icon: Settings, label: 'Settings', path: '/resident/settings' }
    ];

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
                                <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Resident</span>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Visitors</span>
                            </div>
                            <div />
                        </div>
                    </div>
                </div>

                <div className="p-4 sm:p-6 lg:p-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Visitors & Deliveries</h1>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>View today's visitors and manage pre-approvals</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                                <Users className="w-3 h-3 inline mr-1" />{todaysVisitors.length} Today
                            </span>
                            <button onClick={() => setShowModal(true)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors">
                                <UserPlus className="w-4 h-4" /> Pre-approve
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Today's Visitors */}
                            <div className={`${isDark ? 'bg-[#252525] border-gray-800' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
                                <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Today's Visitors</h2>
                                <div className="space-y-3">
                                    {todaysVisitors.length > 0 ? todaysVisitors.map(v => (
                                        <div key={v.id} className={`flex items-center justify-between p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center`}>
                                                    <Users className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                                                </div>
                                                <div>
                                                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{v.name}</p>
                                                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{v.purpose} • {v.inTime}</p>
                                                </div>
                                            </div>
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${v.status === 'in' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                {v.status === 'in' ? 'Inside' : 'Left'}
                                            </span>
                                        </div>
                                    )) : (
                                        <div className="text-center py-8">
                                            <Package className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                                            <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No visitors today</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Pre-approved */}
                            <div className={`${isDark ? 'bg-[#252525] border-gray-800' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
                                <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Pre-approved Visitors</h2>
                                <div className="space-y-3">
                                    {preApproved.length > 0 ? preApproved.map(p => (
                                        <div key={p.id} className={`flex items-center justify-between p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                                            <div>
                                                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{p.name}</p>
                                                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                                    {p.purpose} • {p.expectedTime || 'Anytime'}
                                                </p>
                                            </div>
                                            <button onClick={() => removePreApproval(p.id)}
                                                className={`p-2 rounded-lg ${isDark ? 'hover:bg-red-500/10 text-gray-500 hover:text-red-400' : 'hover:bg-red-50 text-gray-400 hover:text-red-600'} transition-colors`}>
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )) : (
                                        <div className="text-center py-8">
                                            <UserPlus className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                                            <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No pre-approved visitors</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Pre-approve Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
                    <div className={`relative w-full max-w-md ${isDark ? 'bg-[#252525] border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl shadow-2xl p-6`}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Pre-approve Visitor</h3>
                            <button onClick={() => setShowModal(false)}>
                                <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                            </button>
                        </div>
                        <form onSubmit={addPreApproval} className="space-y-4">
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Visitor Name</label>
                                <input type="text" value={preForm.name} onChange={(e) => setPreForm({ ...preForm, name: e.target.value })}
                                    className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} outline-none focus:ring-2 focus:ring-blue-500`}
                                    required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Purpose</label>
                                    <select value={preForm.purpose} onChange={(e) => setPreForm({ ...preForm, purpose: e.target.value })}
                                        className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} outline-none`}>
                                        <option>Guest</option>
                                        <option>Delivery</option>
                                        <option>Service</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Expected Time</label>
                                    <input type="text" placeholder="e.g. 06:30 PM" value={preForm.expectedTime}
                                        onChange={(e) => setPreForm({ ...preForm, expectedTime: e.target.value })}
                                        className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'} outline-none`} />
                                </div>
                            </div>
                            <div className="flex items-center gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)}
                                    className={`flex-1 px-4 py-3 rounded-lg font-medium text-sm ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transition-colors`}>
                                    Cancel
                                </button>
                                <button type="submit"
                                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors">
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
        </div>
    );
};

export default Visitors;
