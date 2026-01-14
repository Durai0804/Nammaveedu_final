import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import api from '../../utils/api';

const Settings = () => {
  const [profile, setProfile] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('residentProfile') || '{}');
    } catch {
      return {};
    }
  });

  const [profileForm, setProfileForm] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
  });

  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPw, setLoadingPw] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const updateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoadingProfile(true);
    try {
      const { data } = await api.put('/api/resident/profile', {
        name: profileForm.name || undefined,
        email: profileForm.email || undefined,
        phone: profileForm.phone || undefined,
      });
      if (!data?.success) throw new Error(data?.error || 'Unable to update');

      const nextProfile = {
        ...(profile || {}),
        ...(data.data?.user || {}),
        ...(data.data?.resident || {}),
        flatNumber: data.data?.user?.flatNumber || profile?.flatNumber,
      };
      setProfile(nextProfile);
      localStorage.setItem('residentProfile', JSON.stringify(nextProfile));
      setSuccess('Profile updated');
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Unable to update profile');
    } finally {
      setLoadingProfile(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!pwForm.oldPassword || !pwForm.newPassword) {
      setError('Please fill all password fields');
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setError('New password and confirm password do not match');
      return;
    }

    setLoadingPw(true);
    try {
      const { data } = await api.put('/api/resident/password', {
        oldPassword: pwForm.oldPassword,
        newPassword: pwForm.newPassword,
      });
      if (!data?.success) throw new Error(data?.error || 'Unable to change password');
      setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setSuccess('Password updated');
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Unable to change password');
    } finally {
      setLoadingPw(false);
    }
  };

  return (
    <DashboardLayout allowResidentAccess={true}>
      <div className="space-y-6 animate-fadeIn">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Settings</h1>
          <p className="text-neutral-600">Update your profile and password</p>
        </div>

        {error ? <div className="text-sm text-red-600">{error}</div> : null}
        {success ? <div className="text-sm text-green-600">{success}</div> : null}

        <Card padding="lg">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Profile</h2>
          <form onSubmit={updateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-neutral-700">Name</label>
              <Input value={profileForm.name} onChange={(e) => setProfileForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm text-neutral-700">Email</label>
              <Input type="email" value={profileForm.email} onChange={(e) => setProfileForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm text-neutral-700">Mobile</label>
              <Input value={profileForm.phone} onChange={(e) => setProfileForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={loadingProfile}>{loadingProfile ? 'Saving…' : 'Save Profile'}</Button>
            </div>
          </form>
        </Card>

        <Card padding="lg">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Change Password</h2>
          <form onSubmit={changePassword} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-neutral-700">Old Password</label>
              <Input type="password" value={pwForm.oldPassword} onChange={(e) => setPwForm(f => ({ ...f, oldPassword: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm text-neutral-700">New Password</label>
              <Input type="password" value={pwForm.newPassword} onChange={(e) => setPwForm(f => ({ ...f, newPassword: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm text-neutral-700">Confirm New Password</label>
              <Input type="password" value={pwForm.confirmPassword} onChange={(e) => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))} />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={loadingPw}>{loadingPw ? 'Updating…' : 'Update Password'}</Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
