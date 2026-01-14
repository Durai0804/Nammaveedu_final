import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Building2, AlertCircle, IndianRupee, Plus, FileText } from 'lucide-react';
import { mockFlats, mockComplaints } from '../../utils/mockData';
import RevenueChart from '../../components/dashboard/RevenueChart';
import ComplaintsChart from '../../components/dashboard/ComplaintsChart';
import api from '../../utils/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [adminData, setAdminData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (!token) return; // fallback to mocks when not logged in
    setLoading(true);
    setError('');
    api.get('/api/admin/dashboard')
      .then(({ data }) => {
        if (!data?.success) throw new Error('Failed to load');
        setAdminData(data.data);
      })
      .catch((e) => setError(e.message || 'Unable to load admin dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const totalFlats = adminData?.stats?.totalFlats ?? mockFlats.length;
  const pendingComplaints = adminData?.stats?.pendingComplaints ?? mockComplaints.filter(c => c.status !== 'resolved').length;
  const maintenanceCollected = adminData?.stats?.maintenanceCollected ?? mockFlats.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.maintenance, 0);
  const totalMaintenance = adminData?.stats?.totalMaintenance ?? mockFlats.reduce((sum, f) => sum + f.maintenance, 0);
  const collectionPercentage = totalMaintenance ? Math.round((maintenanceCollected / totalMaintenance) * 100) : 0;

  const adminStats = [
    {
      icon: Building2,
      label: t('totalFlats'),
      value: totalFlats,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100',
    },
    {
      icon: AlertCircle,
      label: t('pendingComplaints'),
      value: pendingComplaints,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      icon: IndianRupee,
      label: t('maintenanceCollection'),
      value: `${collectionPercentage}%`,
      subValue: `₹${maintenanceCollected.toLocaleString('en-IN')} / ₹${totalMaintenance.toLocaleString('en-IN')}`,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
  ];

  const recentActivities = useMemo(() => {
    if (adminData?.recentActivities?.length) {
      return adminData.recentActivities.map(a => ({
        text: a.text,
        time: new Date(a.time).toLocaleString('en-IN')
      }));
    }
    return [
      { text: 'Maintenance payment received from A-101', time: '2 hours ago' },
      { text: 'New complaint registered - Water leakage', time: '3 hours ago' },
      { text: 'Notice posted - Water supply interruption', time: '5 hours ago' },
      { text: 'Visitor logged - Delivery to B-202', time: '6 hours ago' },
    ];
  }, [adminData]);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fadeIn">
        <div>
          <h1 className={`text-3xl font-bold text-neutral-900 ${language === 'ta' ? 'font-tamil' : ''}`}>
            {t('dashboard')}
          </h1>
          <p className={`text-neutral-600 ${language === 'ta' ? 'font-tamil' : ''}`}>
            {t('welcomeMessage')}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminStats.map((stat, index) => (
            <Card key={index} padding="lg" hover className="animate-scaleIn" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className={`text-sm text-neutral-600 mb-2 ${language === 'ta' ? 'font-tamil' : ''}`}>
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-neutral-900 mb-1 bg-gradient-to-r from-neutral-900 to-neutral-700 bg-clip-text">
                    {stat.value}
                  </p>
                  {stat.subValue && (
                    <p className={`text-sm ${stat.subValue.includes('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.subValue}
                    </p>
                  )}
                </div>
                <div className={`w-14 h-14 ${stat.bgColor} rounded-xl flex items-center justify-center shadow-soft transform transition-transform hover:scale-110`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <RevenueChart />
          <ComplaintsChart />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card padding="lg" className="animate-slideInRight" style={{ animationDelay: '400ms' }}>
            <h2 className={`text-xl font-semibold text-neutral-900 mb-4 ${language === 'ta' ? 'font-tamil' : ''}`}>
              Maintenance Overview
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-neutral-600">Collection Progress</span>
                  <span className="font-semibold text-neutral-900">{collectionPercentage}%</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-primary-600 to-primary-700 h-3 rounded-full transition-all duration-700 shadow-colored-primary"
                    style={{ width: `${collectionPercentage}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Paid</p>
                  <div className="flex items-center space-x-2">
                    <Badge variant="success">{mockFlats.filter(f => f.status === 'paid').length}</Badge>
                    <span className="text-sm text-neutral-500">flats</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Unpaid</p>
                  <div className="flex items-center space-x-2">
                    <Badge variant="warning">{mockFlats.filter(f => f.status === 'unpaid').length}</Badge>
                    <span className="text-sm text-neutral-500">flats</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card padding="lg" className="animate-slideInRight" style={{ animationDelay: '500ms' }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-semibold text-neutral-900 ${language === 'ta' ? 'font-tamil' : ''}`}>
                {t('recentActivity')}
              </h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/notices')}>
                {t('viewAll')}
              </Button>
            </div>
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 pb-3 border-b border-neutral-100 last:border-0">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-neutral-800">{activity.text}</p>
                    <p className="text-xs text-neutral-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card padding="lg" className="animate-slideInRight" style={{ animationDelay: '600ms' }}>
          <h2 className={`text-xl font-semibold text-neutral-900 mb-4 ${language === 'ta' ? 'font-tamil' : ''}`}>
            {t('quickActions')}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Button
              variant="outline"
              className={`justify-start ${language === 'ta' ? 'font-tamil' : ''}`}
              onClick={() => navigate('/complaints')}
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('addComplaint')}
            </Button>
            <Button
              variant="outline"
              className={`justify-start ${language === 'ta' ? 'font-tamil' : ''}`}
              onClick={() => navigate('/notices')}
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('addNotice')}
            </Button>
            <Button
              variant="outline"
              className={`justify-start ${language === 'ta' ? 'font-tamil' : ''}`}
              onClick={() => navigate('/reports')}
            >
              <FileText className="w-4 h-4 mr-2" />
              {t('viewReports')}
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
