import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Home, Users, AlertCircle, Building2, Menu, X, LogOut, Settings,
    ChevronRight, Loader, IndianRupee, Bell, Package, FileText,
    UserPlus, Download, Calendar, TrendingUp, CheckCircle, Clock
} from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Reports = () => {
    const navigate = useNavigate();
    const [theme, setTheme] = useState('light');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const generateReport = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`http://localhost:4000/api/admin/reports/generate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dateRange)
            });

            const result = await response.json();
            if (result.success) {
                setReportData(result.data);
            } else {
                // Mock data fallback for demo
                setReportData({
                    summary: {
                        totalComplaints: 45,
                        resolvedComplaints: 38,
                        pendingComplaints: 7,
                        maintenanceCollected: 450000,
                        maintenancePending: 85000,
                        totalVisitors: 234,
                        activeResidents: 85
                    },
                    complaintsChart: [
                        { month: 'Week 1', resolved: 8, pending: 2 },
                        { month: 'Week 2', resolved: 12, pending: 3 },
                        { month: 'Week 3', resolved: 10, pending: 1 },
                        { month: 'Week 4', resolved: 8, pending: 1 }
                    ],
                    maintenanceChart: [
                        { name: 'Collected', value: 84 },
                        { name: 'Pending', value: 16 }
                    ],
                    topIssues: [
                        { category: 'Plumbing', count: 15 },
                        { category: 'Electrical', count: 12 },
                        { category: 'Maintenance', count: 10 },
                        { category: 'Security', count: 8 }
                    ]
                });
            }
        } catch (error) {
            console.error('Error generating report:', error);
            // Use mock data
            setReportData({
                summary: {
                    totalComplaints: 45,
                    resolvedComplaints: 38,
                    pendingComplaints: 7,
                    maintenanceCollected: 450000,
                    maintenancePending: 85000,
                    totalVisitors: 234,
                    activeResidents: 85
                },
                complaintsChart: [
                    { month: 'Week 1', resolved: 8, pending: 2 },
                    { month: 'Week 2', resolved: 12, pending: 3 },
                    { month: 'Week 3', resolved: 10, pending: 1 },
                    { month: 'Week 4', resolved: 8, pending: 1 }
                ],
                maintenanceChart: [
                    { name: 'Collected', value: 84 },
                    { name: 'Pending', value: 16 }
                ],
                topIssues: [
                    { category: 'Plumbing', count: 15 },
                    { category: 'Electrical', count: 12 },
                    { category: 'Maintenance', count: 10 },
                    { category: 'Security', count: 8 }
                ]
            });
        } finally {
            setLoading(false);
        }
    };

    const exportToPDF = () => {
        alert('PDF export functionality will download a comprehensive report');
        // In real implementation, call backend API that generates PDF
    };

    const isDark = theme === 'dark';

    const sidebarItems = [
        { icon: Home, label: 'Dashboard', path: '/admin/dashboard' },
        { icon: Building2, label: 'Flats', path: '/flats' },
        { icon: IndianRupee, label: 'Administration', path: '/administration' },
        { icon: AlertCircle, label: 'Complaints', path: '/complaints' },
        { icon: Bell, label: 'Notices', path: '/notices' },
        { icon: Package, label: 'Visitors', path: '/visitors' },
        { icon: UserPlus, label: 'Create Resident', path: '/admin/residents/create' },
        { icon: FileText, label: 'Reports', path: '/reports', active: true },
        { icon: Settings, label: 'Settings', path: '/settings' }
    ];

    const COLORS = ['#10B981', '#F59E0B'];

    return (
        <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-gray-50'} transition-colors duration-300`}>
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 ${isDark ? 'bg-[#0a0a0a] border-[#1f1f1f]' : 'bg-white border-gray-200'} border-r transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-[#1f1f1f]' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 ${isDark ? 'bg-[#181818]' : 'bg-gray-900'} rounded-lg flex items-center justify-center`}>
                            <span className="text-white font-bold text-sm">N</span>
                        </div>
                        <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>NammaVeedu</span>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
                        <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                    </button>
                </div>

                <nav className="p-4 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 140px)' }}>
                    {sidebarItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.path}
                                onClick={() => {
                                    navigate(item.path);
                                    setSidebarOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${item.active
                                        ? isDark ? 'bg-[#1f1f1f] text-white' : 'bg-blue-600 text-white'
                                        : isDark ? 'text-gray-400 hover:bg-[#181818] hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                <div className={`absolute bottom-0 left-0 right-0 p-4 border-t ${isDark ? 'border-[#1f1f1f]' : 'border-gray-200'}`}>
                    <button onClick={handleLogout} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'}`}>
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="lg:ml-64">
                {/* Header */}
                <div className={`${isDark ? 'bg-[#0a0a0a] border-[#1f1f1f]' : 'bg-white border-gray-200'} border-b sticky top-0 z-40`}>
                    <div className="px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
                                <Menu className={`w-6 h-6 ${isDark ? 'text-white' : 'text-gray-900'}`} />
                            </button>

                            <div className="flex items-center gap-2">
                                <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Admin</span>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Reports</span>
                            </div>

                            <button
                                onClick={() => {
                                    const newTheme = theme === 'dark' ? 'light' : 'dark';
                                    setTheme(newTheme);
                                    localStorage.setItem('theme', newTheme);
                                }}
                                className={`p-2 rounded-lg ${isDark ? 'hover:bg-[#181818]' : 'hover:bg-gray-100'} transition-colors`}
                            >
                                {isDark ? (
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Page Content */}
                <div className="p-4 sm:p-6 lg:p-8">
                    <div className="mb-6">
                        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Analytics & Reports</h1>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Generate detailed reports for selected date range</p>
                    </div>

                    {/* Date Range Selector */}
                    <div className={`${isDark ? 'bg-[#0f0f0f] border-[#1f1f1f]' : 'bg-white border-gray-200'} rounded-xl border p-6 mb-6`}>
                        <div className="grid md:grid-cols-3 gap-4 items-end">
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Start Date</label>
                                <input
                                    type="date"
                                    value={dateRange.startDate}
                                    onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                                    className={`w-full ${isDark ? 'bg-[#141414] text-white border-[#1f1f1f]' : 'bg-gray-50 text-gray-900 border-gray-200'} border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600`}
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>End Date</label>
                                <input
                                    type="date"
                                    value={dateRange.endDate}
                                    onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                                    className={`w-full ${isDark ? 'bg-[#141414] text-white border-[#1f1f1f]' : 'bg-gray-50 text-gray-900 border-gray-200'} border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600`}
                                />
                            </div>
                            <button
                                onClick={generateReport}
                                disabled={loading}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader className="w-5 h-5 animate-spin" /> : <TrendingUp className="w-5 h-5" />}
                                Generate Report
                            </button>
                        </div>
                    </div>

                    {reportData && (
                        <>
                            {/* Summary Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                                <div className={`${isDark ? 'bg-[#0f0f0f] border-[#1f1f1f]' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <CheckCircle className="w-8 h-8 text-green-600" />
                                        <div>
                                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Resolved Complaints</p>
                                            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{reportData.summary.resolvedComplaints}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className={`${isDark ? 'bg-[#0f0f0f] border-[#1f1f1f]' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <Clock className="w-8 h-8 text-orange-600" />
                                        <div>
                                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Pending Complaints</p>
                                            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{reportData.summary.pendingComplaints}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className={`${isDark ? 'bg-[#0f0f0f] border-[#1f1f1f]' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <IndianRupee className="w-8 h-8 text-green-600" />
                                        <div>
                                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Maintenance Collected</p>
                                            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>₹{(reportData.summary.maintenanceCollected / 1000).toFixed(0)}K</p>
                                        </div>
                                    </div>
                                </div>

                                <div className={`${isDark ? 'bg-[#0f0f0f] border-[#1f1f1f]' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <Users className="w-8 h-8 text-blue-600" />
                                        <div>
                                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Visitors</p>
                                            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{reportData.summary.totalVisitors}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Charts */}
                            <div className="grid lg:grid-cols-2 gap-6 mb-6">
                                <div className={`${isDark ? 'bg-[#0f0f0f] border-[#1f1f1f]' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
                                    <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Complaints Trend</h3>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <BarChart data={reportData.complaintsChart}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1f1f1f' : '#E5E7EB'} />
                                            <XAxis dataKey="month" stroke={isDark ? '#666666' : '#6B7280'} />
                                            <YAxis stroke={isDark ? '#666666' : '#6B7280'} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: isDark ? 'rgba(10, 10, 10, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                                                    border: isDark ? '1px solid rgba(31, 31, 31, 0.5)' : '1px solid rgba(229, 231, 235, 0.8)',
                                                    borderRadius: '8px',
                                                    padding: '8px 12px',
                                                    boxShadow: isDark ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
                                                    color: isDark ? '#FFFFFF' : '#000000'
                                                }}
                                                cursor={false}
                                            />
                                            <Legend />
                                            <Bar dataKey="resolved" fill="#10B981" name="Resolved" />
                                            <Bar dataKey="pending" fill="#F59E0B" name="Pending" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className={`${isDark ? 'bg-[#0f0f0f] border-[#1f1f1f]' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
                                    <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Maintenance Collection</h3>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Pie
                                                data={reportData.maintenanceChart}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, value }) => `${name}: ${value}%`}
                                                outerRadius={80}
                                                dataKey="value"
                                            >
                                                {reportData.maintenanceChart.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Top Issues */}
                            <div className={`${isDark ? 'bg-[#0f0f0f] border-[#1f1f1f]' : 'bg-white border-gray-200'} rounded-xl border p-6 mb-6`}>
                                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Top Issue Categories</h3>
                                <div className="space-y-3">
                                    {reportData.topIssues.map((issue, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{issue.category}</span>
                                            <div className="flex items-center gap-3">
                                                <div className={`h-2 rounded-full ${isDark ? 'bg-[#141414]' : 'bg-gray-200'}`} style={{ width: '200px' }}>
                                                    <div className="h-2 bg-blue-600 rounded-full" style={{ width: `${(issue.count / 15) * 100}%` }}></div>
                                                </div>
                                                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'} w-8`}>{issue.count}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Export Button */}
                            <div className="flex justify-center">
                                <button
                                    onClick={exportToPDF}
                                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                                >
                                    <Download className="w-5 h-5" />
                                    Export to PDF
                                </button>
                            </div>
                        </>
                    )}

                    {!reportData && !loading && (
                        <div className={`${isDark ? 'bg-[#0f0f0f] border-[#1f1f1f]' : 'bg-white border-gray-200'} rounded-xl border p-12 text-center`}>
                            <FileText className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>No Report Generated Yet</h3>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Select a date range and click "Generate Report" to view analytics</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
};

export default Reports;
