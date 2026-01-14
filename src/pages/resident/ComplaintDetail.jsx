import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { mockComplaints } from '../../utils/mockData';
import api from '../../utils/api';

const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const resident = (() => { try { return JSON.parse(localStorage.getItem('residentProfile') || '{}'); } catch { return {}; } })();

  const saved = (() => { try { return JSON.parse(localStorage.getItem('residentComplaints') || '[]'); } catch { return []; } })();
  const mineSaved = saved.find(c => String(c.id) === String(id));
  const mineMock = mockComplaints.find(c => String(c.id) === String(id));
  const localComplaint = useMemo(() => mineSaved || mineMock, [id]);
  const [dbComplaint, setDbComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const complaint = dbComplaint || localComplaint;

  const isEditable = !!mineSaved; // only resident-raised local complaints can be edited by resident

  const normalizeStatus = (st) => {
    const s = String(st || '').toUpperCase();
    if (s === 'IN_PROGRESS') return 'inProgress';
    if (s === 'RESOLVED') return 'resolved';
    if (s === 'OPEN') return 'open';
    return st;
  };

  const [status, setStatus] = useState(normalizeStatus(complaint?.status) || 'open');
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => { setStatus(normalizeStatus(complaint?.status) || 'open'); }, [complaint?.status]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (!token) {
      // local-only comments
      setComments(() => {
        try { return JSON.parse(localStorage.getItem(`complaintComments:${id}`) || '[]'); } catch { return []; }
      });
      return;
    }

    setLoading(true);
    setError('');
    api.get(`/api/complaints/${encodeURIComponent(id)}`)
      .then(({ data }) => {
        if (!data?.success) throw new Error('Failed to load');
        setDbComplaint(data.data);
        const serverComments = (data.data?.comments || []).map(c => ({
          id: c.id,
          author: c.author?.name || 'User',
          text: c.text,
          at: c.createdAt,
        }));
        setComments(serverComments);
      })
      .catch((e) => setError(e?.response?.data?.error || e.message || 'Unable to load complaint'))
      .finally(() => setLoading(false));
  }, [id]);

  const saveStatus = () => {
    if (!isEditable) return;
    const next = saved.map(c => String(c.id) === String(id) ? { ...c, status } : c);
    localStorage.setItem('residentComplaints', JSON.stringify(next));
  };

  const addComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (token && complaint?.id) {
      // Resident view: comments are read-only from DB for now
      alert('Comments are managed by admin for this complaint.');
      return;
    }
    const entry = {
      id: Date.now(),
      author: resident?.name || 'You',
      text: newComment.trim(),
      at: new Date().toISOString(),
    };
    const next = [entry, ...comments];
    setComments(next);
    localStorage.setItem(`complaintComments:${id}`, JSON.stringify(next));
    setNewComment('');
  };

  if (!complaint) {
    return (
      <DashboardLayout allowResidentAccess={true}>
        <div className="p-6"><Card padding="lg">Complaint not found.</Card></div>
      </DashboardLayout>
    );
  }

  const variant = (st) => st === 'resolved' ? 'success' : st === 'inProgress' ? 'warning' : 'danger';

  return (
    <DashboardLayout allowResidentAccess={true}>
      <div className="space-y-6 animate-fadeIn">
        {loading ? (
          <Card padding="lg" className="text-center text-neutral-500">Loading complaint…</Card>
        ) : error ? (
          <Card padding="lg" className="text-center text-neutral-500">{error}</Card>
        ) : null}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Complaint #{complaint.id}</h1>
            <p className="text-neutral-600">Flat {complaint.flatNumber}{complaint.doorNumber ? ` • Door ${complaint.doorNumber}` : ''}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/resident/complaints')}>Back</Button>
            <Badge variant={variant(status)}>{status}</Badge>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card padding="lg" className="md:col-span-2">
            <h2 className="text-lg font-semibold text-neutral-900 mb-3">Issue Description</h2>
            <p className="text-neutral-800 leading-relaxed">{complaint.description}</p>
            <div className="grid grid-cols-2 gap-4 text-sm text-neutral-600 mt-6">
              <div>Category: <span className="font-medium text-neutral-900">{complaint.category || 'General'}</span></div>
              <div>Created: <span className="font-medium text-neutral-900">{new Date(complaint.createdAt).toLocaleDateString('en-IN')}</span></div>
              <div>Assigned To: <span className="font-medium text-neutral-900">{complaint.assignedTo || '—'}</span></div>
              <div>Status: <Badge variant={variant(status)}>{status}</Badge></div>
            </div>

            {isEditable && (
              <div className="mt-6">
                <label className="block text-sm font-semibold text-neutral-700 mb-2">Update Status</label>
                <div className="flex items-center gap-3">
                  <select className="px-3 py-2 border border-neutral-200 rounded-lg" value={status} onChange={(e)=>setStatus(e.target.value)}>
                    <option value="open">Open</option>
                    <option value="inProgress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                  <Button onClick={saveStatus}>Save</Button>
                </div>
              </div>
            )}
          </Card>

          <Card padding="lg">
            <h2 className="text-lg font-semibold text-neutral-900 mb-3">Comments</h2>
            {!dbComplaint ? (
              <form onSubmit={addComment} className="space-y-3 mb-4">
                <Input label="Add a comment" value={newComment} onChange={(e)=>setNewComment(e.target.value)} placeholder="Type your message" />
                <div className="flex justify-end"><Button type="submit">Post</Button></div>
              </form>
            ) : null}
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {comments.length ? comments.map(c => (
                <div key={c.id} className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                  <div className="flex items-center justify-between text-sm text-neutral-600">
                    <span className="font-medium text-neutral-800">{c.author}</span>
                    <span>{new Date(c.at).toLocaleString('en-IN')}</span>
                  </div>
                  <p className="text-neutral-800 mt-1">{c.text}</p>
                </div>
              )) : <p className="text-neutral-500 text-sm">No comments yet.</p>}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ComplaintDetail;
