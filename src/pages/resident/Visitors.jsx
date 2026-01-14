import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { Users, Package, UserPlus, Trash } from 'lucide-react';
import api from '../../utils/api';

const Visitors = () => {
  const resident = (() => { try { return JSON.parse(localStorage.getItem('residentProfile') || '{}'); } catch { return {}; } })();

  const todayStr = new Date().toLocaleDateString('en-CA');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dbVisitors, setDbVisitors] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (!token) {
      setError('Please login to view visitors');
      setDbVisitors([]);
      return;
    }
    setLoading(true);
    setError('');
    api.get('/api/resident/visitors')
      .then(({ data }) => {
        if (!data?.success) throw new Error('Failed to load');
        setDbVisitors(data.data || []);
      })
      .catch((e) => setError(e?.response?.data?.error || e.message || 'Unable to load visitors'))
      .finally(() => setLoading(false));
  }, []);

  const todaysVisitors = useMemo(() => {
    return (dbVisitors || []).filter(v => {
      const d = new Date(v.date).toLocaleDateString('en-CA');
      return d === todayStr;
    });
  }, [dbVisitors, todayStr]);

  const [preApproved, setPreApproved] = useState(() => {
    try { return JSON.parse(localStorage.getItem('preApprovedVisitors') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (!token) return;
    api.get('/api/resident/pre-approvals')
      .then(({ data }) => { if (data?.success) setPreApproved(data.data || []); })
      .catch(()=>{});
  }, []);

  const myPreApproved = preApproved.filter(p => p.flatNumber === resident.flatNumber);

  const [isPreModalOpen, setIsPreModalOpen] = useState(false);
  const [preForm, setPreForm] = useState({ name: '', purpose: 'Guest', expectedTime: '' });

  const addPreApproval = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (!token) {
      const entry = { id: Date.now(), flatNumber: resident.flatNumber, ...preForm };
      const next = [entry, ...preApproved];
      setPreApproved(next);
      localStorage.setItem('preApprovedVisitors', JSON.stringify(next));
      setPreForm({ name: '', purpose: 'Guest', expectedTime: '' });
      setIsPreModalOpen(false);
      return;
    }
    try {
      const { data } = await api.post('/api/resident/pre-approvals', {
        name: preForm.name,
        purpose: preForm.purpose,
        expectedTime: preForm.expectedTime,
      });
      if (!data?.success) throw new Error(data?.error || 'Unable to save');
      setPreApproved(prev => [data.data, ...prev]);
      setPreForm({ name: '', purpose: 'Guest', expectedTime: '' });
      setIsPreModalOpen(false);
    } catch (err) {
      alert(err?.response?.data?.error || err.message || 'Unable to save pre-approval');
    }
  };

  const removePreApproval = async (id) => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (!token || typeof id === 'number') {
      const next = preApproved.filter(p => p.id !== id);
      setPreApproved(next);
      localStorage.setItem('preApprovedVisitors', JSON.stringify(next));
      return;
    }
    try {
      await api.delete(`/api/resident/pre-approvals/${encodeURIComponent(id)}`);
      setPreApproved(prev => prev.filter(p => String(p.id) !== String(id)));
    } catch (err) {
      alert(err?.response?.data?.error || err.message || 'Unable to delete pre-approval');
    }
  };

  const countToday = todaysVisitors.length;

  return (
    <DashboardLayout allowResidentAccess={true}>
      <div className="space-y-6 animate-fadeIn">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Visitors & Deliveries</h1>
            <p className="text-neutral-600">View today's visitors and manage pre-approvals</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="neutral" className="flex items-center"><Users className="w-3 h-3 mr-1" /> {countToday} Today</Badge>
            <Button variant="outline" onClick={() => setIsPreModalOpen(true)}>
              <UserPlus className="w-4 h-4 mr-2" /> Pre-approve Visitor
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card padding="lg">
            <h2 className="text-lg font-semibold text-neutral-900 mb-3">Today's Visitors</h2>
            <div className="space-y-3">
              {loading ? (
                <p className="text-neutral-500 text-sm">Loading visitors…</p>
              ) : error ? (
                <p className="text-neutral-500 text-sm">{error}</p>
              ) : countToday ? todaysVisitors.map(v => (
                <div key={v.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                  <div className="text-sm">
                    <div className="font-medium text-neutral-900">{v.name}</div>
                    <div className="text-neutral-500">{v.inTime} - {v.outTime}</div>
                  </div>
                  <Badge variant={v.status === 'in' ? 'warning' : 'success'}>
                    {v.status === 'in' ? 'Inside' : 'Checked Out'}
                  </Badge>
                </div>
              )) : <p className="text-neutral-500 text-sm">No visitors logged today.</p>}
            </div>
          </Card>

          <Card padding="lg">
            <h2 className="text-lg font-semibold text-neutral-900 mb-3">Pre-approved Visitors</h2>
            <div className="space-y-3">
              {myPreApproved.length ? myPreApproved.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                  <div className="text-sm">
                    <div className="font-medium text-neutral-900">{p.name} • {p.purpose}</div>
                    <div className="text-neutral-500">Expected: {p.expectedTime || 'Anytime'}</div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removePreApproval(p.id)} title="Remove">
                    <Trash className="w-4 h-4 text-neutral-500" />
                  </Button>
                </div>
              )) : <p className="text-neutral-500 text-sm">No pre-approved visitors yet.</p>}
            </div>
          </Card>
        </div>

        <Card padding="lg">
          <h2 className="text-lg font-semibold text-neutral-900 mb-3">Latest Delivery</h2>
          {(() => {
            const deliveries = (dbVisitors || [])
              .filter(v => (v.purpose?.toLowerCase().includes('delivery') || v.name.toLowerCase().includes('delivery')))
              .sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));
            const last = deliveries[0];
            if (!last) return <p className="text-neutral-500 text-sm">No recent deliveries.</p>;
            return (
              <div className={`flex items-center justify-between p-3 bg-neutral-50 rounded-lg border border-neutral-200 ${last.status === 'in' ? 'text-green-700' : 'text-neutral-700'}`}>
                <div className="flex items-center">
                  <Package className={`w-4 h-4 mr-2 ${last.status === 'in' ? 'text-green-600' : 'text-neutral-500'}`} />
                  <span className="text-sm">{last.name} • {last.inTime}{last.outTime !== '-' ? ` → ${last.outTime}` : ''}</span>
                </div>
                <Badge variant={last.status === 'in' ? 'warning' : 'success'}>{last.status === 'in' ? 'Inside' : 'Checked Out'}</Badge>
              </div>
            );
          })()}
        </Card>

        <Modal isOpen={isPreModalOpen} onClose={() => setIsPreModalOpen(false)} title="Pre-approve Visitor">
          <form onSubmit={addPreApproval} className="space-y-4">
            <Input label="Visitor Name" value={preForm.name} onChange={(e)=>setPreForm({ ...preForm, name: e.target.value })} required />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">Purpose</label>
                <select className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg bg-white focus:outline-none" value={preForm.purpose} onChange={(e)=>setPreForm({ ...preForm, purpose: e.target.value })}>
                  <option>Guest</option>
                  <option>Delivery</option>
                  <option>Service</option>
                  <option>Other</option>
                </select>
              </div>
              <Input label="Expected Time" placeholder="e.g. 06:30 PM" value={preForm.expectedTime} onChange={(e)=>setPreForm({ ...preForm, expectedTime: e.target.value })} />
            </div>
            <div className="pt-4 border-t border-neutral-100 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsPreModalOpen(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default Visitors;
