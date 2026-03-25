import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Home, MessageSquare, AlertCircle, Package, Bell, Settings,
    Menu, X, LogOut, ChevronRight, Loader, ArrowLeft
} from 'lucide-react';

const RaiseComplaint = () => {
    const navigate = useNavigate();
    const [theme, setTheme] = useState('light');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        category: 'Maintenance',
        description: '',
    });

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
    }, []);

    const isDark = theme === 'dark';

    const sidebarItems = [
        { icon: Home, label: 'Dashboard', path: '/resident/dashboard' },
        { icon: MessageSquare, label: 'My Complaints', path: '/resident/complaints' },
        { icon: AlertCircle, label: 'Raise Complaint', path: '/resident/complaints/new', active: true },
        { icon: Package, label: 'Visitors', path: '/resident/visitors' },
        { icon: Bell, label: 'Notices', path: '/resident/notices' },
        { icon: Settings, label: 'Settings', path: '/resident/settings' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.description.trim()) { setError('Please describe the issue'); return; }

        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }

        try {
            setIsSubmitting(true);
            setError('');
            const flatNumber = localStorage.getItem('userFlatNumber') || '';
            const description = `${form.category}: ${form.description}`;

            const res = await fetch('http://localhost:4000/api/complaints', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ flatNumber, description })
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error || 'Unable to submit complaint');
            navigate('/resident/complaints');
        } catch (err) {
            setError(err.message || 'Unable to submit complaint');
        } finally {
            setIsSubmitting(false);
        }
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

            {/* Main Content */}
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
                                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Raise Complaint</span>
                            </div>
                            <div />
                        </div>
                    </div>
                </div>

                <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
                    <button onClick={() => navigate('/resident/complaints')}
                        className={`flex items-center gap-2 text-sm mb-6 ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>
                        <ArrowLeft className="w-4 h-4" /> Back to Complaints
                    </button>

                    <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Raise a Complaint</h1>
                    <p className={`text-sm mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Submit an issue related to your flat or community</p>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <p className="text-red-500 text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={`${isDark ? 'bg-[#252525] border-gray-800' : 'bg-white border-gray-200'} rounded-xl border p-6 space-y-6`}>
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Category</label>
                            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                                className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} focus:ring-2 focus:ring-blue-500 outline-none`}>
                                <option>Maintenance</option>
                                <option>Security</option>
                                <option>Housekeeping</option>
                                <option>Parking</option>
                                <option>Plumbing</option>
                                <option>Electrical</option>
                                <option>Other</option>
                            </select>
                        </div>

                        <div>
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Issue Description</label>
                            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="Describe the issue in detail..."
                                rows={5}
                                className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'} focus:ring-2 focus:ring-blue-500 outline-none resize-none`}
                                required />
                        </div>

                        <div className="flex items-center gap-3 pt-4">
                            <button type="button" onClick={() => navigate('/resident/complaints')}
                                className={`px-6 py-3 rounded-lg font-medium text-sm transition-colors ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                                Cancel
                            </button>
                            <button type="submit" disabled={isSubmitting}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                                {isSubmitting ? <Loader className="w-4 h-4 animate-spin" /> : null}
                                {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
        </div>
    );
};

export default RaiseComplaint;
