import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { User, Home, Phone, Mail, Calendar, CreditCard, Building2, AlertCircle, MessageSquare, FileText, Bell, Users, Package } from 'lucide-react';
import { mockFlats, mockComplaints, mockVisitors } from '../../utils/mockData';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import api from '../../utils/api';

const ResidentDashboard = () => {
  const navigate = useNavigate();
  const [resident, setResident] = useState({
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@email.com',
    phone: '+91 98765 43210',
    flatNumber: 'A-101',
    floor: '1st Floor',
    block: 'A Block',
    maintenanceAmount: 5000,
    maintenanceStatus: 'paid',
    lastPaymentDate: '2026-01-05',
    nextDueDate: '2026-02-01',
    memberCount: 4,
  });

  useEffect(() => {
    const saved = localStorage.getItem('residentProfile');
    if (saved) {
      try { setResident(JSON.parse(saved)); } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('residentProfile', JSON.stringify(resident));
  }, [resident]);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: resident.name, email: resident.email, phone: resident.phone });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const openEdit = () => { setEditForm({ name: resident.name, email: resident.email, phone: resident.phone }); setIsEditOpen(true); };
  const saveEdit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    // If not logged in, keep existing local-only behavior
    if (!token) {
      setResident(prev => ({ ...prev, ...editForm }));
      setIsEditOpen(false);
      return;
    }

    try {
      setIsSavingProfile(true);
      const { data } = await api.put('/api/resident/profile', {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
      });
      if (!data?.success) throw new Error(data?.error || 'Update failed');

      const updated = data.data;
      setResident(prev => ({
        ...prev,
        name: updated?.user?.name ?? prev.name,
        email: updated?.user?.email ?? prev.email,
        phone: updated?.resident?.phone ?? prev.phone,
        flatNumber: updated?.user?.flatNumber ?? prev.flatNumber,
        floor: updated?.flat?.floor ?? prev.floor,
        block: updated?.flat?.block ? `${updated.flat.block} Block` : prev.block,
        memberCount: updated?.resident?.members ?? prev.memberCount,
      }));

      setIsEditOpen(false);
    } catch (err) {
      alert(err?.response?.data?.error || err.message || 'Unable to save profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Visitors & Deliveries state (pre-approvals persisted locally)
  const [isPreApproveOpen, setIsPreApproveOpen] = useState(false);
  const [preApproved, setPreApproved] = useState(() => {
    try { return JSON.parse(localStorage.getItem('preApprovedVisitors') || '[]'); } catch { return []; }
  });
  const [preForm, setPreForm] = useState({ name: '', purpose: 'Guest', expectedTime: '' });
  const savePreApproval = (e) => {
    e.preventDefault();
    const entry = { id: Date.now(), flatNumber: resident.flatNumber, ...preForm };
    const next = [entry, ...preApproved];
    setPreApproved(next);
    localStorage.setItem('preApprovedVisitors', JSON.stringify(next));
    setIsPreApproveOpen(false);
    setPreForm({ name: '', purpose: 'Guest', expectedTime: '' });
  };

  // Derive latest maintenance info for this resident's flat
  const currentFlat = mockFlats.find(f => f.flatNumber === resident.flatNumber);
  const maintenanceInfo = currentFlat ? {
    month: currentFlat.month,
    amount: currentFlat.maintenance,
    status: currentFlat.status,
  } : {
    month: 'Current Month',
    amount: resident.maintenanceAmount,
    status: resident.maintenanceStatus,
  };

  // Resident's complaints (merge mock + saved local complaints)
  const savedComplaints = (() => { try { return JSON.parse(localStorage.getItem('residentComplaints') || '[]'); } catch { return []; } })();
  const mockMine = mockComplaints.filter(c => c.flatNumber === resident.flatNumber);
  const myComplaints = [...savedComplaints.filter(c => c.flatNumber === resident.flatNumber), ...mockMine];

  // API integration state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiComplaints, setApiComplaints] = useState(null);
  const [apiVisitorsToday, setApiVisitorsToday] = useState(null);
  const [apiPreApprovals, setApiPreApprovals] = useState(null);
  const [apiMaintenance, setApiMaintenance] = useState(null);
  const [recentNotices, setRecentNotices] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Today's visitors for this resident (prefer DB)
  const today = new Date().toISOString().split('T')[0];
  const todaysVisitors = apiVisitorsToday
    ? apiVisitorsToday
    : (mockVisitors ? mockVisitors.filter(v => v.flatNumber === resident.flatNumber && v.date === today) : []);
  // Latest delivery entry status (prefer DB)
  const latestDelivery = (apiVisitorsToday
    ? apiVisitorsToday
    : (mockVisitors ? mockVisitors.filter(v => v.flatNumber === resident.flatNumber) : []))
    .filter(v => (v.purpose?.toLowerCase().includes('delivery') || v.name?.toLowerCase().includes('delivery')))
    .sort((a, b) => {
      const ad = a.createdAt ? new Date(a.createdAt) : (a.id ? new Date(Number(a.id)) : new Date(0));
      const bd = b.createdAt ? new Date(b.createdAt) : (b.id ? new Date(Number(b.id)) : new Date(0));
      return bd - ad;
    })[0] || null;

  const complaintsList = apiComplaints ? apiComplaints : myComplaints;

  useEffect(() => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (!token) return; // stay on mock/local until auth added
    setLoading(true);
    setError('');
    api.get('/api/resident/dashboard')
      .then(({ data }) => {
        if (!data?.success) throw new Error('Failed to load');
        const d = data.data;
        if (d?.user) {
          setResident(prev => ({
            ...prev,
            name: d.user.name || prev.name,
            email: d.user.email || prev.email,
            flatNumber: d.user.flatNumber || prev.flatNumber,
          }));
        }
        if (d?.complaints) setApiComplaints(d.complaints);
        if (d?.visitorsToday) setApiVisitorsToday(d.visitorsToday);
        if (d?.preApprovals) setApiPreApprovals(d.preApprovals);
        if (d?.maintenance) setApiMaintenance(d.maintenance);
      })
      .catch((e) => setError(e.message || 'Unable to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (!token) return;
    api.get('/api/notices')
      .then(({ data }) => { if (data?.success) setRecentNotices(data.data?.slice(0,3) || []); })
      .catch(()=>{});
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (!token) return;
    api.get('/api/resident/notifications', { params: { take: 10 } })
      .then(({ data }) => { if (data?.success) setNotifications(data.data || []); })
      .catch(()=>{});
  }, []);

  const unreadNotifications = notifications.filter(n => !n.read);
  const unreadCount = unreadNotifications.length;
  const markAllRead = async () => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (!token) return;
    try {
      await api.put('/api/resident/notifications/read', { ids: [] });
      // After marking all as read, hide them from the dashboard list
      setNotifications([]);
    } catch {}
  };

  return (
    <DashboardLayout allowResidentAccess={true}>
      <div className="space-y-6 animate-fadeIn">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 md:p-8 text-white shadow-xl">
          <h1 className="text-3xl font-bold mb-2">Welcome Back, {resident.name.split(' ')[0]}! 👋</h1>
          <p className="text-primary-100">Here's your apartment overview</p>
        </div>

        {unreadCount ? (
          <Card padding="lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-neutral-900">Notifications</h2>
              <div className="flex items-center gap-2">
                <Badge variant="warning">{unreadCount} New</Badge>
                <Button size="sm" variant="outline" onClick={markAllRead}>Mark all read</Button>
              </div>
            </div>
            <div className="space-y-3">
              {unreadNotifications.map(n => (
                <div key={n.id} className="p-3 rounded-lg border bg-primary-50 border-primary-200">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-neutral-900">{n.title}</p>
                      <p className="text-sm text-neutral-700 mt-1">{n.message}</p>
                      <p className="text-xs text-neutral-500 mt-1">{new Date(n.createdAt).toLocaleString('en-IN')}</p>
                    </div>
                    <Badge variant="warning">New</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ) : null}

        <div className="grid lg:grid-cols-3 gap-6">
          <Card padding="lg" className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-neutral-900">Profile Information</h2>
              <Button variant="ghost" size="sm" onClick={openEdit}>Edit Profile</Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 uppercase tracking-wide font-semibold">Full Name</p>
                    <p className="text-neutral-900 font-medium">{resident.name}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 uppercase tracking-wide font-semibold">Email Address</p>
                    <p className="text-neutral-900 font-medium">{resident.email}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 uppercase tracking-wide font-semibold">Phone Number</p>
                    <p className="text-neutral-900 font-medium">{resident.phone}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center shrink-0">
                    <Home className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 uppercase tracking-wide font-semibold">Flat Number</p>
                    <p className="text-neutral-900 font-medium text-lg">{resident.flatNumber}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 uppercase tracking-wide font-semibold">Location</p>
                    <p className="text-neutral-900 font-medium">{resident.floor}, {resident.block}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-pink-50 rounded-lg flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 uppercase tracking-wide font-semibold">Family Members</p>
                    <p className="text-neutral-900 font-medium">{resident.memberCount} Members</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

        <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Profile">
          <form onSubmit={saveEdit} className="space-y-4">
            <Input label="Full Name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required />
            <Input label="Email Address" type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} required />
            <Input label="Phone Number" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} required />
            <div className="pt-4 border-t border-neutral-100 flex justify-end space-x-3">
              <Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)} className="text-neutral-500">Cancel</Button>
              <Button type="submit" isLoading={isSavingProfile}>Save</Button>
            </div>
          </form>
        </Modal>

          <Card padding="lg" className={`border-l-4 ${maintenanceInfo.status === 'paid' ? 'border-l-green-500 bg-green-50/30' : 'border-l-orange-500 bg-orange-50/30'}`}>
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${maintenanceInfo.status === 'paid' ? 'bg-green-100' : 'bg-orange-100'}`}>
                <CreditCard className={`w-8 h-8 ${maintenanceInfo.status === 'paid' ? 'text-green-600' : 'text-orange-600'}`} />
              </div>
              <h3 className="text-sm text-neutral-600 mb-2 uppercase tracking-wide font-semibold">Maintenance Status</h3>
              <Badge variant={maintenanceInfo.status === 'paid' ? 'success' : 'warning'} className="mb-4">
                {maintenanceInfo.status === 'paid' ? 'Paid' : 'Pending'}
              </Badge>

              <div className="space-y-3 mt-6 text-left">
                <div className="flex justify-between items-center pb-3 border-b border-neutral-200">
                  <span className="text-sm text-neutral-600">Monthly Amount</span>
                  <span className="font-bold text-neutral-900">₹{(maintenanceInfo.amount || resident.maintenanceAmount).toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-neutral-200">
                  <span className="text-sm text-neutral-600">Month</span>
                  <span className="text-sm text-neutral-900">{maintenanceInfo.month || 'Current'}</span>
                </div>

                {maintenanceInfo.status === 'paid' ? (
                  <div className="flex justify-between items-center pb-3 border-b border-neutral-200">
                    <span className="text-sm text-neutral-600">Last Paid</span>
                    <span className="text-sm text-neutral-900">{new Date(resident.lastPaymentDate).toLocaleDateString('en-IN')}</span>
                  </div>
                ) : null}

                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Next Due</span>
                  <span className="text-sm text-neutral-900">{new Date(resident.nextDueDate).toLocaleDateString('en-IN')}</span>
                </div>
              </div>

              {maintenanceInfo.status !== 'paid' && (
                <Button className="w-full mt-6">Pay Now</Button>
              )}
            </div>
          </Card>
        </div>

        <Card padding="lg">
          <h2 className="text-xl font-bold text-neutral-900 mb-4">Quick Actions</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button onClick={() => navigate('/resident/complaints/new')} className="flex items-center space-x-4 p-4 bg-white border-2 border-neutral-200 hover:border-primary-500 rounded-xl transition-all group">
              <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-neutral-900">Raise Complaint</p>
                <p className="text-xs text-neutral-500">Report an issue</p>
              </div>
            </button>

            <button onClick={() => navigate('/resident/notices')} className="flex items-center space-x-4 p-4 bg-white border-2 border-neutral-200 hover:border-primary-500 rounded-xl transition-all group">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Bell className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-neutral-900">View Notices</p>
                <p className="text-xs text-neutral-500">Community updates</p>
              </div>
            </button>

            <button className="flex items-center space-x-4 p-4 bg-white border-2 border-neutral-200 hover:border-primary-500 rounded-xl transition-all group">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
                <FileText className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-neutral-900">Payment History</p>
                <p className="text-xs text-neutral-500">View receipts</p>
              </div>
            </button>

            <button onClick={() => navigate('/resident/visitors')} className="flex items-center space-x-4 p-4 bg-white border-2 border-neutral-200 hover:border-primary-500 rounded-xl transition-all group">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Package className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-neutral-900">Visitors & Deliveries</p>
                <p className="text-xs text-neutral-500">Log, track and pre-approve</p>
              </div>
            </button>
          </div>
        </Card>

        <Card padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-neutral-900">My Complaints</h2>
            <div className="flex items-center gap-2">
              <Badge variant={complaintsList.length ? 'warning' : 'success'}>
                {complaintsList.length ? `${complaintsList.length} Open` : 'No Complaints'}
              </Badge>
              <Button size="sm" variant="outline" onClick={() => navigate('/resident/complaints')}>View All</Button>
            </div>
          </div>
          <div className="space-y-3">
            {complaintsList.length ? (
              complaintsList.map((c) => (
                <div key={c.id} className="flex items-start justify-between p-3 bg-neutral-50 rounded-lg">
                  <div>
                    <p className="font-medium text-neutral-900">{c.description}</p>
                    <p className="text-xs text-neutral-500 mt-1">Created: {new Date(c.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                  <Badge variant={(c.status === 'resolved' || c.status === 'RESOLVED') ? 'success' : (c.status === 'inProgress' || c.status === 'IN_PROGRESS') ? 'warning' : 'danger'}>
                    {c.status}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-neutral-500">You have no complaints.</p>
            )}
          </div>
        </Card>

        {/* Emergency & Help */}
        <Card padding="lg">
          <h2 className="text-xl font-bold text-neutral-900 mb-4">Emergency & Help</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
              <div className="flex items-center mb-3">
                <AlertCircle className="w-5 h-5 text-orange-600 mr-2" />
                <span className="font-semibold text-neutral-900">Security Contact</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Main Gate Security</span>
                  <a className="text-primary-600 font-medium" href="tel:+919876543210">+91 98765 43210</a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Block A Security</span>
                  <a className="text-primary-600 font-medium" href="tel:+919123456789">+91 91234 56789</a>
                </div>
              </div>
            </div>
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
              <div className="flex items-center mb-3">
                <Phone className="w-5 h-5 text-primary-600 mr-2" />
                <span className="font-semibold text-neutral-900">Society Emergency Numbers</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center justify-between"><span>Fire Brigade</span><span className="font-medium">101</span></div>
                <div className="flex items-center justify-between"><span>Ambulance</span><span className="font-medium">108</span></div>
                <div className="flex items-center justify-between"><span>Police</span><span className="font-medium">100</span></div>
                <div className="flex items-center justify-between"><span>Maintenance Office</span><span className="font-medium">+91 90000 11111</span></div>
              </div>
            </div>
          </div>
        </Card>

        {/* Visitors & Deliveries */}
        <Card padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-neutral-900">Visitors & Deliveries</h2>
            <div className="flex items-center gap-2">
              <Badge variant="neutral" className="flex items-center"><Users className="w-3 h-3 mr-1" /> {todaysVisitors.length} Today</Badge>
              <Button size="sm" variant="outline" onClick={() => navigate('/resident/visitors')}>View All</Button>
              <Button size="sm" variant="outline" onClick={() => setIsPreApproveOpen(true)}>Pre-approve Visitor</Button>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
              <p className="text-sm font-semibold text-neutral-700 mb-3">Today's Visitors</p>
              <div className="space-y-2">
                {todaysVisitors.length ? todaysVisitors.map(v => (
                  <div key={v.id} className="flex items-center justify-between text-sm">
                    <span className="text-neutral-800">{v.name}</span>
                    <span className="text-neutral-500">{v.inTime} - {v.outTime}</span>
                  </div>
                )) : <p className="text-neutral-500 text-sm">No visitors today.</p>}
              </div>
            </div>
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
              <p className="text-sm font-semibold text-neutral-700 mb-3">Delivery Entry Status</p>
              {latestDelivery ? (
                <div className={`flex items-center justify-between text-sm ${latestDelivery.status === 'in' ? 'text-green-700' : 'text-neutral-700'}`}>
                  <div className="flex items-center">
                    <Package className={`w-4 h-4 mr-2 ${latestDelivery.status === 'in' ? 'text-green-600' : 'text-neutral-500'}`} />
                    <span>{latestDelivery.name} • {latestDelivery.inTime}{latestDelivery.outTime !== '-' ? ` → ${latestDelivery.outTime}` : ''}</span>
                  </div>
                  <Badge variant={latestDelivery.status === 'in' ? 'warning' : 'success'}>{latestDelivery.status === 'in' ? 'Inside' : 'Checked Out'}</Badge>
                </div>
              ) : (
                <p className="text-neutral-500 text-sm">No recent deliveries.</p>
              )}
            </div>
          </div>
        </Card>

        <Modal isOpen={isPreApproveOpen} onClose={() => setIsPreApproveOpen(false)} title="Pre-approve Visitor">
          <form onSubmit={savePreApproval} className="space-y-4">
            <Input label="Visitor Name" value={preForm.name} onChange={(e) => setPreForm({ ...preForm, name: e.target.value })} required />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">Purpose</label>
                <select className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg bg-white focus:outline-none" value={preForm.purpose} onChange={(e) => setPreForm({ ...preForm, purpose: e.target.value })}>
                  <option>Guest</option>
                  <option>Delivery</option>
                  <option>Service</option>
                  <option>Other</option>
                </select>
              </div>
              <Input label="Expected Time" placeholder="e.g. 06:30 PM" value={preForm.expectedTime} onChange={(e) => setPreForm({ ...preForm, expectedTime: e.target.value })} />
            </div>
            {preApproved.length > 0 && (
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-sm">
                <p className="font-semibold text-neutral-800 mb-2">Pre-approved List</p>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {preApproved.filter(p=>p.flatNumber===resident.flatNumber).map(p => (
                    <div key={p.id} className="flex items-center justify-between">
                      <span className="text-neutral-700">{p.name} • {p.purpose}</span>
                      <span className="text-neutral-500">{p.expectedTime || 'Anytime'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="pt-4 border-t border-neutral-100 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsPreApproveOpen(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </Modal>

        <Card padding="lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-neutral-900">Recent Notices</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/resident/notices')}>View All</Button>
          </div>
          <div className="space-y-3">
            {(recentNotices || []).length ? (
              recentNotices.map(n => (
                <div key={n.id} className="flex items-start space-x-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                  <Calendar className="w-5 h-5 text-primary-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-neutral-900">{n.title}</p>
                    <p className="text-sm text-neutral-600 mt-1">{n.description}</p>
                    <p className="text-xs text-neutral-500 mt-1">{new Date(n.date).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-neutral-500 text-sm">No notices available.</p>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ResidentDashboard;
