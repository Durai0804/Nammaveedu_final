import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { mockComplaints } from '../../utils/mockData';
import api from '../../utils/api';

const MyComplaints = () => {
  const navigate = useNavigate();
  const resident = (() => { try { return JSON.parse(localStorage.getItem('residentProfile') || '{}'); } catch { return {}; } })();
  const saved = (() => { try { return JSON.parse(localStorage.getItem('residentComplaints') || '[]'); } catch { return []; } })();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiComplaints, setApiComplaints] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (!token) return;
    setLoading(true);
    setError('');
    api.get('/api/resident/complaints')
      .then(({ data }) => {
        if (!data?.success) throw new Error('Failed to load');
        setApiComplaints(data.data || []);
      })
      .catch((e) => setError(e?.response?.data?.error || e.message || 'Unable to load complaints'))
      .finally(() => setLoading(false));
  }, []);

  const all = useMemo(() => {
    if (apiComplaints) return apiComplaints;
    const mine = mockComplaints.filter(c => c.flatNumber === resident.flatNumber);
    return [...saved.filter(c => c.flatNumber === resident.flatNumber), ...mine];
  }, [apiComplaints, resident.flatNumber, saved]);

  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState('all');

  const filtered = all.filter(c => {
    const s = status === 'all' || c.status === status;
    const t = !search || c.description.toLowerCase().includes(search.toLowerCase()) || (c.id || '').toLowerCase().includes(search.toLowerCase());
    return s && t;
  });

  const variant = (st) => (st === 'resolved' || st === 'RESOLVED') ? 'success' : (st === 'inProgress' || st === 'IN_PROGRESS') ? 'warning' : 'danger';

  const handleDelete = async (e, complaint) => {
    e.stopPropagation();
    const ok = window.confirm('Delete this complaint?');
    if (!ok) return;

    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (!token || !apiComplaints) {
      // local fallback
      const next = saved.filter(c => String(c.id) !== String(complaint.id));
      localStorage.setItem('residentComplaints', JSON.stringify(next));
      setApiComplaints(null);
      return;
    }

    try {
      await api.delete(`/api/complaints/${encodeURIComponent(complaint.id)}`);
      setApiComplaints(prev => (prev || []).filter(c => String(c.id) !== String(complaint.id)));
    } catch (err) {
      alert(err?.response?.data?.error || err.message || 'Unable to delete complaint');
    }
  };

  return (
    <DashboardLayout allowResidentAccess={true}>
      <div className="space-y-6 animate-fadeIn">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">My Complaints</h1>
            <p className="text-neutral-600">Track and manage your complaints</p>
          </div>
          <Button onClick={() => navigate('/resident/complaints/new')}>Raise Complaint</Button>
        </div>

        <Card padding="md" className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:w-1/3">
            <Input placeholder="Search by id or description..." value={search} onChange={(e)=>setSearch(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-600">Status:</span>
            <select className="px-3 py-2 border border-neutral-200 rounded-lg" value={status} onChange={(e)=>setStatus(e.target.value)}>
              <option value="all">All</option>
              <option value="open">Open</option>
              <option value="inProgress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </Card>

        <div className="grid gap-4">
          {loading ? (
            <Card padding="lg" className="text-center text-neutral-500">Loading complaints…</Card>
          ) : error ? (
            <Card padding="lg" className="text-center text-neutral-500">{error}</Card>
          ) : filtered.length ? filtered.map(c => (
            <Card key={c.id} padding="lg" hover className="cursor-pointer" onClick={() => navigate(`/resident/complaints/${encodeURIComponent(c.id)}`)}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <span className="text-sm text-neutral-500">#{c.id}</span>
                    <Badge variant={variant(c.status)}>{c.status}</Badge>
                  </div>
                  <p className="text-neutral-900 font-medium break-words">{c.description}</p>
                  <p className="text-xs text-neutral-500 mt-1">Created: {new Date(c.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
                <div className="text-right text-sm text-neutral-600 shrink-0">
                  <div>Flat: {c.flatNumber}</div>
                  <div className="mt-2 flex justify-end">
                    <Button variant="danger" size="sm" onClick={(e) => handleDelete(e, c)}>Delete</Button>
                  </div>
                </div>
              </div>
            </Card>
          )) : (
            <Card padding="lg" className="text-center text-neutral-500">No complaints found.</Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MyComplaints;
