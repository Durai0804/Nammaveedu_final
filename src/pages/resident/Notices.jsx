import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Bell, Calendar, Clock } from 'lucide-react';
import api from '../../utils/api';

const statusVariant = (status) => {
  switch (status) {
    case 'ongoing':
      return 'warning';
    case 'upcoming':
      return 'info';
    case 'completed':
      return 'success';
    default:
      return 'neutral';
  }
};

const Notices = () => {
  const [filter, setFilter] = useState('all');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dbNotices, setDbNotices] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (!token) {
      setError('Please login to view notices');
      setDbNotices([]);
      return;
    }

    setLoading(true);
    setError('');
    api.get('/api/notices')
      .then(({ data }) => {
        if (!data?.success) throw new Error('Failed to load');
        setDbNotices(data.data || []);
      })
      .catch((e) => setError(e?.response?.data?.error || e.message || 'Unable to load notices'))
      .finally(() => setLoading(false));
  }, []);

  const notices = useMemo(() => {
    const list = (dbNotices || []).map(n => ({
      ...n,
      status: String(n.status || 'UPCOMING').toLowerCase(),
      description: n.description,
    }));
    if (filter === 'all') return list;
    return list.filter(n => n.status === filter);
  }, [filter]);

  return (
    <DashboardLayout allowResidentAccess={true}>
      <div className="space-y-6 animate-fadeIn">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Notices</h1>
            <p className="text-neutral-600">All apartment events and announcements</p>
          </div>
          <div className="flex gap-2">
            <Button variant={filter === 'all' ? 'primary' : 'outline'} onClick={() => setFilter('all')}>All</Button>
            <Button variant={filter === 'ongoing' ? 'primary' : 'outline'} onClick={() => setFilter('ongoing')}>Ongoing</Button>
            <Button variant={filter === 'upcoming' ? 'primary' : 'outline'} onClick={() => setFilter('upcoming')}>Upcoming</Button>
            <Button variant={filter === 'completed' ? 'primary' : 'outline'} onClick={() => setFilter('completed')}>Completed</Button>
          </div>
        </div>

        <Card padding="lg">
          <div className="space-y-3">
            {loading ? (
              <p className="text-neutral-500 text-sm">Loading notices…</p>
            ) : error ? (
              <p className="text-neutral-500 text-sm">{error}</p>
            ) : notices.length ? notices.map(n => (
              <div key={n.id} className="p-4 bg-white border border-neutral-200 rounded-xl flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Bell className="w-4 h-4 text-primary-600" />
                    <h3 className="font-semibold text-neutral-900">{n.title}</h3>
                    <Badge variant={statusVariant(n.status)}>{n.status}</Badge>
                  </div>
                  <p className="text-sm text-neutral-600 mb-2">{n.description}</p>
                  <div className="flex items-center gap-4 text-xs text-neutral-500">
                    <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" />{new Date(n.date).toISOString().split('T')[0]}</span>
                    {n.time && <span className="flex items-center"><Clock className="w-3 h-3 mr-1" />{n.time}</span>}
                    {n.location && <span>@ {n.location}</span>}
                  </div>
                </div>
              </div>
            )) : (
              <p className="text-neutral-500 text-sm">No notices to show.</p>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Notices;
