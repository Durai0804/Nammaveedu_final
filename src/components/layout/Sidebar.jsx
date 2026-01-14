import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import {
    LayoutDashboard,
    Building2,
    Wrench,
    MessageSquare,
    Bell,
    Users,
    FileText,
    Settings
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose, role }) => {
    const { t, language } = useLanguage();

    const allMenuItems = [
        { icon: LayoutDashboard, label: t('dashboard'), path: role === 'resident' ? '/resident/dashboard' : '/admin/dashboard', roles: ['admin', 'super_admin', 'resident'] },
        { icon: MessageSquare, label: t('complaints'), path: '/resident/complaints', roles: ['resident'] },
        { icon: Bell, label: t('notices'), path: '/resident/notices', roles: ['resident'] },
        { icon: Users, label: 'Visitors & Deliveries', path: '/resident/visitors', roles: ['resident'] },
        { icon: Settings, label: 'Settings', path: '/resident/settings', roles: ['resident'] },
        { icon: Building2, label: t('flats'), path: '/flats', roles: ['admin', 'super_admin'] },
        { icon: Wrench, label: t('maintenance'), path: '/maintenance', roles: ['admin', 'super_admin'] },
        { icon: MessageSquare, label: t('complaints'), path: '/complaints', roles: ['admin', 'super_admin'] },
        { icon: Bell, label: t('notices'), path: '/notices', roles: ['admin', 'super_admin'] },
        { icon: Users, label: t('visitors'), path: '/visitors', roles: ['admin', 'super_admin'] },
        { icon: Users, label: 'Create Resident', path: '/admin/residents/create', roles: ['admin', 'super_admin'] },
        { icon: FileText, label: t('reports'), path: '/reports', roles: ['admin', 'super_admin'] },
    ];

    const menuItems = allMenuItems.filter(item => item.roles.includes(role));

    const navLinkClass = ({ isActive }) => `
    flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
    ${isActive
            ? 'bg-primary-50 text-primary-700 font-medium'
            : 'text-neutral-700 hover:bg-neutral-100'
        }
    ${language === 'ta' ? 'font-tamil' : ''}
  `;

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed lg:sticky top-0 left-0 h-screen
          w-64 bg-white border-r border-neutral-200
          transform transition-transform duration-300 ease-in-out
          z-50 lg:z-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          custom-scrollbar overflow-y-auto
        `}
            >
                <div className="p-4">
                    {/* Logo - Mobile Sidebar */}
                    <div className="lg:hidden flex items-center space-x-2 mb-6 pb-4 border-b border-neutral-200">
                        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">N</span>
                        </div>
                        <span className={`text-xl font-bold text-neutral-800 ${language === 'ta' ? 'font-tamil' : ''}`}>
                            {t('appName')}
                        </span>
                    </div>

                    {/* Navigation */}
                    <nav className="space-y-1">
                        {menuItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={navLinkClass}
                                onClick={() => {
                                    if (window.innerWidth < 1024) {
                                        onClose();
                                    }
                                }}
                            >
                                <item.icon className="w-5 h-5" />
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </nav>

                    {/* Settings at Bottom - Only for Admin */}
                    {role === 'admin' && (
                        <div className="mt-8 pt-4 border-t border-neutral-200">
                            <NavLink
                                to="/settings"
                                className={navLinkClass}
                                onClick={() => {
                                    if (window.innerWidth < 1024) {
                                        onClose();
                                    }
                                }}
                            >
                                <Settings className="w-5 h-5" />
                                <span className={language === 'ta' ? 'font-tamil' : ''}>Settings</span>
                            </NavLink>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
