import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Eye, EyeOff, Mail, Lock, Phone, User, Shield } from 'lucide-react';

/**
 * Login Page - UI v2
 * 
 * Role-based login page with light/dark theme toggle
 * Features: Admin (email/password) and Resident (mobile/email + password) login
 */
const Login = () => {
    const navigate = useNavigate();
    const [theme, setTheme] = useState('dark');
    const [showPassword, setShowPassword] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null); // 'admin' or 'resident'
    const [formData, setFormData] = useState({
        email: '',
        mobile: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    // Load theme from localStorage on mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        setTheme(savedTheme);
    }, []);

    // Toggle theme
    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    // Handle role selection
    const handleRoleSelect = (role) => {
        setSelectedRole(role);
        setFormData({ email: '', mobile: '', password: '' });
        setErrors({});
    };

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (selectedRole === 'admin') {
            // Admin validation - email required
            if (!formData.email) {
                newErrors.email = 'Email is required';
            } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
                newErrors.email = 'Email is invalid';
            }
        } else if (selectedRole === 'resident') {
            // Resident validation - mobile or email required
            if (!formData.mobile && !formData.email) {
                newErrors.credential = 'Mobile number or email is required';
            } else if (formData.mobile && !/^[0-9]{10}$/.test(formData.mobile)) {
                newErrors.mobile = 'Mobile number must be 10 digits';
            } else if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
                newErrors.email = 'Email is invalid';
            }
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            // Prepare login data based on role
            const loginData = {
                password: formData.password
            };

            if (selectedRole === 'admin') {
                // Admin login with email only
                loginData.email = formData.email;
            } else {
                // Resident login with mobile or email
                if (formData.mobile) {
                    loginData.mobile = formData.mobile;
                } else {
                    loginData.email = formData.email;
                }
            }

            // Call backend API
            const response = await fetch('http://localhost:4000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Store authentication data
                localStorage.setItem('token', result.data.token);
                localStorage.setItem('userRole', result.data.user.role);
                localStorage.setItem('userId', result.data.user.id);
                localStorage.setItem('userName', result.data.user.name);
                localStorage.setItem('userEmail', result.data.user.email);

                // Navigate based on role from API response
                if (result.data.user.role === 'admin') {
                    navigate('/admin/dashboard');
                } else if (result.data.user.role === 'resident') {
                    navigate('/resident/dashboard');
                } else {
                    // Fallback based on selected role
                    navigate(selectedRole === 'admin' ? '/admin/dashboard' : '/resident/dashboard');
                }
            } else {
                // Show error message from API or default message
                setErrors({ general: result.error || 'Invalid credentials. Please try again.' });
            }
        } catch (error) {
            console.error('Login error:', error);
            setErrors({ general: 'Unable to connect to server. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    // Theme-based styles
    const isDark = theme === 'dark';

    const bgClass = isDark
        ? 'bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900'
        : 'bg-gradient-to-br from-gray-50 via-gray-50 to-gray-50';

    const cardBg = isDark
        ? 'bg-gray-800/60 backdrop-blur-xl border-gray-700'
        : 'bg-white/80 backdrop-blur-xl border-gray-200';

    const textPrimary = isDark ? 'text-gray-100' : 'text-gray-900';
    const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';

    const inputBg = isDark
        ? 'bg-gray-900/60 border-gray-700'
        : 'bg-gray-50 border-gray-300';

    const inputText = isDark ? 'text-gray-100' : 'text-gray-900';
    const inputPlaceholder = isDark ? 'placeholder-gray-500' : 'placeholder-gray-400';


    return (
        <div className={`min-h-screen ${bgClass} transition-all duration-500 flex items-center justify-center p-4`}>
            {/* Theme Toggle Button */}
            <button
                onClick={toggleTheme}
                className={`fixed top-6 right-6 p-3 rounded-full ${isDark ? 'bg-slate-800 text-yellow-400' : 'bg-white text-gray-900'
                    } shadow-lg hover:scale-110 transition-all duration-300 z-50`}
                aria-label="Toggle theme"
            >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Login Card */}
            <div className={`w-full max-w-md ${cardBg} border rounded-2xl shadow-2xl p-8 transition-all duration-500`}>
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className={`text-3xl font-bold ${textPrimary} mb-2`}>
                        Welcome Back
                    </h1>
                    <p className={textSecondary}>
                        {selectedRole
                            ? `Sign in as ${selectedRole === 'admin' ? 'Admin' : 'Resident'}`
                            : 'Select your role to continue'}
                    </p>
                </div>

                {/* Role Selection - Show if no role selected */}
                {!selectedRole && (
                    <div className="space-y-4">
                        {/* Admin Role Card */}
                        <button
                            onClick={() => handleRoleSelect('admin')}
                            className={`w-full p-6 ${inputBg} border rounded-xl hover:border-cyan-500 transition-all duration-300 group text-left`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg group-hover:scale-110 transition-transform">
                                    <Shield className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className={`text-lg font-semibold ${textPrimary} mb-1`}>
                                        Admin Login
                                    </h3>
                                    <p className={`text-sm ${textSecondary}`}>
                                        Access admin dashboard and management tools
                                    </p>
                                </div>
                            </div>
                        </button>

                        {/* Resident Role Card */}
                        <button
                            onClick={() => handleRoleSelect('resident')}
                            className={`w-full p-6 ${inputBg} border rounded-xl hover:border-cyan-500 transition-all duration-300 group text-left`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                                    <User className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className={`text-lg font-semibold ${textPrimary} mb-1`}>
                                        Resident Login
                                    </h3>
                                    <p className={`text-sm ${textSecondary}`}>
                                        Access your personal dashboard and services
                                    </p>
                                </div>
                            </div>
                        </button>
                    </div>
                )}

                {/* Login Form - Show after role selection */}
                {selectedRole && (
                    <>
                        {/* Back Button */}
                        <button
                            onClick={() => setSelectedRole(null)}
                            className={`mb-6 text-sm ${textSecondary} hover:text-cyan-500 transition-colors flex items-center gap-2`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Change role
                        </button>

                        {/* Error Message */}
                        {errors.general && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
                                <p className="text-red-500 text-sm text-center">{errors.general}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Admin - Email Input */}
                            {selectedRole === 'admin' && (
                                <div>
                                    <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail className={`w-5 h-5 ${textSecondary}`} />
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="admin@nammaveedu.com"
                                            className={`w-full pl-12 pr-4 py-3 ${inputBg} ${inputText} ${inputPlaceholder} border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all outline-none`}
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                                    )}
                                </div>
                            )}

                            {/* Resident - Mobile or Email Input */}
                            {selectedRole === 'resident' && (
                                <>
                                    <div>
                                        <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                                            Mobile Number
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Phone className={`w-5 h-5 ${textSecondary}`} />
                                            </div>
                                            <input
                                                type="tel"
                                                name="mobile"
                                                value={formData.mobile}
                                                onChange={handleChange}
                                                placeholder="9876543210"
                                                maxLength={10}
                                                className={`w-full pl-12 pr-4 py-3 ${inputBg} ${inputText} ${inputPlaceholder} border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all outline-none`}
                                            />
                                        </div>
                                        {errors.mobile && (
                                            <p className="mt-1 text-sm text-red-500">{errors.mobile}</p>
                                        )}
                                    </div>

                                    {/* OR Divider */}
                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className={`w-full border-t ${isDark ? 'border-slate-700' : 'border-gray-300'}`}></div>
                                        </div>
                                        <div className="relative flex justify-center text-xs">
                                            <span className={`px-2 ${isDark ? 'bg-slate-800' : 'bg-white'} ${textSecondary}`}>
                                                OR
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Mail className={`w-5 h-5 ${textSecondary}`} />
                                            </div>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="resident@example.com"
                                                className={`w-full pl-12 pr-4 py-3 ${inputBg} ${inputText} ${inputPlaceholder} border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all outline-none`}
                                            />
                                        </div>
                                        {errors.email && (
                                            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                                        )}
                                        {errors.credential && (
                                            <p className="mt-1 text-sm text-red-500">{errors.credential}</p>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* Password Input */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className={`block text-sm font-medium ${textSecondary}`}>
                                        Password
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/forgot-password')}
                                        className="text-sm text-cyan-500 hover:text-cyan-400 transition-colors"
                                    >
                                        Forgot password?
                                    </button>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className={`w-5 h-5 ${textSecondary}`} />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className={`w-full pl-12 pr-12 py-3 ${inputBg} ${inputText} ${inputPlaceholder} border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all outline-none`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                                    >
                                        {showPassword ? (
                                            <EyeOff className={`w-5 h-5 ${textSecondary} hover:text-cyan-500 transition-colors`} />
                                        ) : (
                                            <Eye className={`w-5 h-5 ${textSecondary} hover:text-cyan-500 transition-colors`} />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                                )}
                            </div>

                            {/* Sign In Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed group mt-6"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Sign In as {selectedRole === 'admin' ? 'Admin' : 'Resident'}
                                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Footer */}
                        <div className={`mt-8 text-center text-xs ${textSecondary}`}>
                            By signing in, you agree to our{' '}
                            <button className="text-cyan-500 hover:text-cyan-400 transition-colors">
                                Terms of Service
                            </button>
                            {' '}and{' '}
                            <button className="text-cyan-500 hover:text-cyan-400 transition-colors">
                                Privacy Policy
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Bottom Info */}
            <div className={`fixed bottom-6 left-0 right-0 flex items-center justify-center gap-8 text-xs ${textSecondary}`}>
                <span>ENCRYPTED CONNECTION</span>
                <span>V2.4.0 STABLE</span>
                <span>NAMMA VEEDU SYSTEMS</span>
            </div>
        </div>
    );
};

export default Login;
