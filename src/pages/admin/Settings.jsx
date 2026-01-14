import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { User, Lock, Users, Bell, Plus, Shield, Mail, Phone, Moon, Globe } from 'lucide-react';
import { mockAdmins } from '../../utils/mockData';

const Settings = () => {
  const { t, language, toggleLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState('profile');

  const [profile, setProfile] = useState({
    name: 'Admin User',
    email: 'admin@nammaveedu.com',
    phone: '+91 98765 43210',
  });

  const [admins, setAdmins] = useState(mockAdmins);
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', role: 'Manager' });

  const [notifications, setNotifications] = useState({ email: true, push: true, sms: false });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'preferences', label: 'Preferences', icon: Bell },
  ];

  const handleAddAdmin = (e) => {
    e.preventDefault();
    setAdmins([
      ...admins,
      {
        id: Date.now(),
        ...newAdmin,
        status: 'active',
      },
    ]);
    setNewAdmin({ name: '', email: '', role: 'Manager' });
    setIsAddAdminOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fadeIn">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className={`text-3xl font-bold text-neutral-900 ${language === 'ta' ? 'font-tamil' : ''}`}>Settings</h1>
            <p className="text-neutral-600 mt-1">Manage your account and preferences</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30 font-medium'
                    : 'bg-white text-neutral-600 hover:bg-neutral-50 border border-transparent hover:border-neutral-200'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="md:col-span-3">
            <Card padding="none" className="min-h-[500px]">
              {activeTab === 'profile' && (
                <div className="p-6 md:p-8 space-y-8 animate-fadeIn">
                  <div className="flex items-center space-x-6">
                    <div className="w-24 h-24 rounded-full bg-neutral-100 flex items-center justify-center border-4 border-white shadow-lg">
                      <User className="w-10 h-10 text-neutral-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-neutral-900">{profile.name}</h3>
                      <p className="text-neutral-500">{profile.role || 'Super Admin'}</p>
                    </div>
                  </div>

                  <div className="grid gap-6 max-w-2xl">
                    <Input label="Full Name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} icon={User} />
                    <div className="grid md:grid-cols-2 gap-6">
                      <Input label="Email Address" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} icon={Mail} />
                      <Input label="Phone Number" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} icon={Phone} />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-neutral-100 flex justify-end">
                    <Button>Save Changes</Button>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="p-6 md:p-8 space-y-8 animate-fadeIn">
                  <div className="max-w-xl space-y-6">
                    <h3 className="text-lg font-bold text-neutral-900 mb-4">Change Password</h3>
                    <Input label="Current Password" type="password" placeholder="••••••••" />
                    <Input label="New Password" type="password" placeholder="••••••••" />
                    <Input label="Confirm New Password" type="password" placeholder="••••••••" />

                    <div className="bg-blue-50 p-4 rounded-lg flex items-start space-x-3 text-sm text-blue-700">
                      <Shield className="w-5 h-5 shrink-0 mt-0.5" />
                      <p>Password must be at least 8 characters long and include a number and special character.</p>
                    </div>

                    <div className="pt-4">
                      <Button variant="outline">Update Password</Button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'team' && (
                <div className="p-6 md:p-8 space-y-6 animate-fadeIn">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-neutral-900">Admin Management</h3>
                      <p className="text-neutral-500 text-sm">Manage team members and their roles</p>
                    </div>
                    <Button onClick={() => setIsAddAdminOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Admin
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {admins.map((admin) => (
                      <div key={admin.id} className="flex items-center justify-between p-4 bg-white border border-neutral-200 rounded-xl hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-bold">
                            {admin.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-neutral-900">{admin.name}</p>
                            <p className="text-sm text-neutral-500">{admin.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge variant="neutral">{admin.role}</Badge>
                          {admin.status === 'active' && (
                            <span className="flex items-center text-xs font-medium text-green-600">
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                              Active
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="p-6 md:p-8 space-y-8 animate-fadeIn">
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900 mb-6">System Preferences</h3>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <Globe className="w-5 h-5 text-neutral-600" />
                          <div>
                            <p className="font-medium text-neutral-900">Language</p>
                            <p className="text-sm text-neutral-500">Toggle between English and Tamil</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={toggleLanguage}>
                          Current: {language === 'en' ? 'English' : 'தமிழ்'}
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <Moon className="w-5 h-5 text-neutral-600" />
                          <div>
                            <p className="font-medium text-neutral-900">Theme</p>
                            <p className="text-sm text-neutral-500">Switch between light and dark mode</p>
                          </div>
                        </div>
                        <div className="px-3 py-1 bg-neutral-200 rounded text-xs font-medium text-neutral-600">Light Mode Only</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-neutral-900 mb-6">Notifications</h3>
                    <div className="space-y-4">
                      {['Email Notifications', 'Push Notifications', 'SMS Alerts'].map((type, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-neutral-700 font-medium">{type}</span>
                          <div className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${i < 2 ? 'bg-primary-600' : 'bg-neutral-300'}`}>
                            <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${i < 2 ? 'translate-x-5' : 'translate-x-0'}`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>

        <Modal isOpen={isAddAdminOpen} onClose={() => setIsAddAdminOpen(false)} title="Add New Admin">
          <form onSubmit={handleAddAdmin} className="space-y-6">
            <Input label="Full Name" value={newAdmin.name} onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })} required placeholder="e.g. John Doe" />
            <Input label="Email Address" type="email" value={newAdmin.email} onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })} required placeholder="john@nammaveedu.com" />
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">Role</label>
              <select className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none cursor-pointer" value={newAdmin.role} onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}>
                <option value="Manager">Manager</option>
                <option value="Super Admin">Super Admin</option>
                <option value="Viewer">Viewer</option>
              </select>
            </div>

            <div className="pt-6 border-t border-neutral-100 flex justify-end space-x-3 mt-8">
              <Button type="button" variant="ghost" onClick={() => setIsAddAdminOpen(false)} className="text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50 px-6">
                Cancel
              </Button>
              <Button type="submit" className="min-w-[140px] shadow-lg shadow-primary-500/20 active:scale-95 transition-transform">
                Add Admin
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
