import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import { ArrowLeft, Globe, Shield, Home, User, UserCog } from 'lucide-react';
import api from '../utils/api';

const Login = () => {
    const navigate = useNavigate();
    const { t, language } = useLanguage();

    // Login Flow State
    const [step, setStep] = useState('role-selection'); // 'role-selection' | 'login-form'
    const [role, setRole] = useState(null); // 'admin' | 'resident'
    const [mobile, setMobile] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [residentLoginMethod, setResidentLoginMethod] = useState('mobile'); // mobile | email
    const [isLoading, setIsLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const handleRoleSelect = (selectedRole) => {
        setRole(selectedRole);
        setStep('login-form');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            let loginPayload = { email, password };

            if (role === 'resident') {
                if (!password) {
                    alert('Please enter password');
                    setIsLoading(false);
                    return;
                }
                if (residentLoginMethod === 'mobile') {
                    if (!mobile || mobile.length < 10) {
                        alert(t('enterValidMobile') || 'Please enter a valid mobile number');
                        setIsLoading(false);
                        return;
                    }
                    loginPayload = { mobile, password };
                } else {
                    if (!email) {
                        alert('Please enter email');
                        setIsLoading(false);
                        return;
                    }
                    loginPayload = { email, password };
                }
            } else if (role === 'admin') {
                if (!email || !password) {
                    alert('Please enter both email and password');
                    setIsLoading(false);
                    return;
                }
            }

            const { data } = await api.post('/api/auth/login', loginPayload);
            if (!data?.success) throw new Error('Login failed');

            const token = data.data?.token;
            const user = data.data?.user;
            if (!token || !user) throw new Error('Invalid login response');

            localStorage.setItem('accessToken', token);
            localStorage.setItem('userRole', (user.role || '').toLowerCase());
            if (rememberMe) localStorage.setItem('rememberMe', 'true');

            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            alert(err?.response?.data?.error || err.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen gradient-mesh flex items-center justify-center p-4">
            <div className="w-full max-w-md animate-scaleIn">
                {/* Header */}
                <div className="text-center mb-8 animate-fadeIn">
                    <div className="flex items-center justify-center space-x-2 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center shadow-colored-primary">
                            <span className="text-white font-bold text-2xl">N</span>
                        </div>
                        <span className={`text-3xl font-bold text-neutral-800 ${language === 'ta' ? 'font-tamil' : ''}`}>
                            NammaVeedu
                        </span>
                    </div>
                    <p className={`text-neutral-600 ${language === 'ta' ? 'font-tamil' : ''}`}>
                        {step === 'role-selection' ? 'Select your role to continue' : `${role === 'admin' ? 'Admin' : 'Resident'} Login`}
                    </p>
                </div>

                {/* Main Card */}
                <Card className="bg-white/80 backdrop-blur-sm shadow-strong border-0 overflow-hidden relative">

                    {/* Role Selection Step */}
                    {step === 'role-selection' && (
                        <div className="space-y-4 animate-fadeIn">
                            <button
                                onClick={() => handleRoleSelect('admin')}
                                className="w-full p-4 flex items-center space-x-4 bg-white border-2 border-transparent hover:border-primary-500 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md group text-left"
                            >
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-neutral-900 group-hover:text-primary-700">Admin Login</h3>
                                    <p className="text-sm text-neutral-500">For Management Committee & Staff</p>
                                </div>
                            </button>

                            <button
                                onClick={() => handleRoleSelect('resident')}
                                className="w-full p-4 flex items-center space-x-4 bg-white border-2 border-transparent hover:border-green-500 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md group text-left"
                            >
                                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
                                    <Home className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-neutral-900 group-hover:text-green-700">Resident Login</h3>
                                    <p className="text-sm text-neutral-500">For Flat Owners & Tenants</p>
                                </div>
                            </button>
                        </div>
                    )}

                    {/* Login Form Step */}
                    {step === 'login-form' && (
                        <form onSubmit={handleLogin} className="space-y-6 animate-slideInRight">
                            <div className="absolute top-4 left-4">
                                <button
                                    type="button"
                                    onClick={() => setStep('role-selection')}
                                    className="p-2 -ml-2 text-neutral-400 hover:text-neutral-600 rounded-full hover:bg-neutral-100 transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="pt-8">
                                {role === 'admin' ? (
                                    <div className="space-y-4">
                                        <Input
                                            label="Email Address"
                                            type="email"
                                            placeholder="admin@nammaveedu.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            icon={UserCog}
                                        />
                                        <div className="space-y-2">
                                            <Input
                                                label="Password"
                                                type="password"
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                            />
                                            <div className="flex items-center justify-between">
                                                <label className="flex items-center space-x-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={rememberMe}
                                                        onChange={(e) => setRememberMe(e.target.checked)}
                                                        className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                                                    />
                                                    <span className="text-sm text-neutral-600">Remember me</span>
                                                </label>
                                                <button
                                                    type="button"
                                                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                                                    onClick={() => alert(t('featureComingSoon'))}
                                                >
                                                    {t('forgotPassword') || 'Forgot Password?'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setResidentLoginMethod('mobile')}
                                                className={`px-3 py-2 rounded-lg text-sm border ${residentLoginMethod === 'mobile' ? 'bg-green-50 border-green-300 text-green-700' : 'bg-white border-neutral-200 text-neutral-700'}`}
                                            >
                                                Mobile
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setResidentLoginMethod('email')}
                                                className={`px-3 py-2 rounded-lg text-sm border ${residentLoginMethod === 'email' ? 'bg-green-50 border-green-300 text-green-700' : 'bg-white border-neutral-200 text-neutral-700'}`}
                                            >
                                                Email
                                            </button>
                                        </div>

                                        {residentLoginMethod === 'mobile' ? (
                                            <Input
                                                label={t('mobileNumber')}
                                                type="tel"
                                                placeholder="9894100003"
                                                value={mobile}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/\D/g, '');
                                                    if (value.length <= 10) setMobile(value);
                                                }}
                                                className={language === 'ta' ? 'font-tamil' : ''}
                                                maxLength={10}
                                                required
                                                icon={User}
                                            />
                                        ) : (
                                            <Input
                                                label="Email Address"
                                                type="email"
                                                placeholder="resident@example.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                icon={User}
                                            />
                                        )}

                                        <Input
                                            label="Password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className={`w-full ${language === 'ta' ? 'font-tamil' : ''} ${role === 'resident' ? 'bg-green-600 hover:bg-green-700 shadow-green-500/20' : ''}`}
                                size="lg"
                                isLoading={isLoading}
                            >
                                {language === 'en' ? 'Login' : 'உள்நுழைய'}
                            </Button>
                        </form>
                    )}
                </Card>

                {/* Back to Home */}
                <div className="text-center mt-6">
                    <button
                        onClick={() => navigate('/')}
                        className="text-neutral-600 hover:text-neutral-800 text-sm transition-colors"
                    >
                        ← Back to home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
