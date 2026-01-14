import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import {
    Wrench,
    MessageSquare,
    Shield,
    CheckCircle2,
    Globe,
    ArrowRight
} from 'lucide-react';

const Landing = () => {
    const navigate = useNavigate();
    const { t, toggleLanguage, language } = useLanguage();

    const features = [
        {
            icon: Wrench,
            title: t('maintenanceTitle'),
            description: t('maintenanceDesc'),
        },
        {
            icon: MessageSquare,
            title: t('complaintsTitle'),
            description: t('complaintsDesc'),
        },
        {
            icon: Shield,
            title: t('securityTitle'),
            description: t('securityDesc'),
        },
    ];

    const benefits = [
        'Digital maintenance tracking',
        'Automated payment reminders',
        'Organized complaint management',
        'Visitor logging system',
        'Notice board for announcements',
        'Mobile-friendly interface',
    ];

    return (
        <div className="min-h-screen gradient-mesh">
            {/* Header */}
            <header className="border-b border-neutral-200 glass-effect backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xl">N</span>
                            </div>
                            <span className={`text-2xl font-bold text-neutral-800 ${language === 'ta' ? 'font-tamil' : ''}`}>
                                {t('appName')}
                            </span>
                        </div>

                        <div className="flex items-center space-x-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={toggleLanguage}
                                className="flex items-center space-x-1"
                            >
                                <Globe className="w-4 h-4" />
                                <span>{language === 'en' ? 'தமிழ்' : 'English'}</span>
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate('/login')}
                            >
                                Login
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 animate-fadeIn">
                <div className="text-center">
                    <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6 ${language === 'ta' ? 'font-tamil' : ''}`}>
                        {t('heroTitle')}
                    </h1>
                    <p className={`text-lg sm:text-xl text-neutral-600 mb-8 max-w-3xl mx-auto ${language === 'ta' ? 'font-tamil' : ''}`}>
                        {t('heroSubtitle')}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button
                            size="lg"
                            onClick={() => navigate('/login')}
                            className={`w-full sm:w-auto ${language === 'ta' ? 'font-tamil' : ''}`}
                        >
                            {t('startFreeTrial')}
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className={`w-full sm:w-auto ${language === 'ta' ? 'font-tamil' : ''}`}
                        >
                            {t('requestDemo')}
                        </Button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white">
                <h2 className={`text-3xl font-bold text-center text-neutral-900 mb-12 ${language === 'ta' ? 'font-tamil' : ''}`}>
                    {t('featuresTitle')}
                </h2>

                <div className="grid md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <Card key={index} padding="lg" hover className="text-center animate-fadeIn" style={{ animationDelay: `${index * 100}ms` }}>
                            <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-soft">
                                <feature.icon className="w-8 h-8 text-primary-600" />
                            </div>
                            <h3 className={`text-xl font-semibold text-neutral-900 mb-3 ${language === 'ta' ? 'font-tamil' : ''}`}>
                                {feature.title}
                            </h3>
                            <p className={`text-neutral-600 ${language === 'ta' ? 'font-tamil' : ''}`}>
                                {feature.description}
                            </p>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Benefits Section */}
            <section className="bg-primary-50 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-neutral-900 mb-6">
                                Everything you need to manage your apartment
                            </h2>
                            <p className="text-neutral-600 mb-8">
                                NammaVeedu brings all your apartment management needs into one simple, easy-to-use platform.
                                No more WhatsApp confusion or paper records.
                            </p>

                            <div className="space-y-3">
                                {benefits.map((benefit, index) => (
                                    <div key={index} className="flex items-center space-x-3">
                                        <CheckCircle2 className="w-5 h-5 text-primary-600 flex-shrink-0" />
                                        <span className="text-neutral-700">{benefit}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <div className="aspect-video bg-gradient-to-br from-primary-100 to-secondary-100 rounded-lg flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                                        <span className="text-3xl font-bold text-primary-600">N</span>
                                    </div>
                                    <p className="text-neutral-600 font-medium">Dashboard Preview</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fadeIn">
                <Card padding="lg" className="text-center bg-gradient-to-r from-primary-600 via-primary-700 to-secondary-600 border-0 shadow-strong hover:shadow-colored-primary">
                    <h2 className={`text-3xl font-bold text-white mb-4 ${language === 'ta' ? 'font-tamil' : ''}`}>
                        Ready to simplify your apartment management?
                    </h2>
                    <p className={`text-primary-50 mb-8 text-lg ${language === 'ta' ? 'font-tamil' : ''}`}>
                        Join hundreds of apartments in Chennai already using NammaVeedu
                    </p>
                    <Button
                        size="lg"
                        className="bg-white text-primary-700 hover:bg-neutral-100"
                        onClick={() => navigate('/login')}
                    >
                        {t('startFreeTrial')}
                    </Button>
                </Card>
            </section>

            {/* Footer */}
            <footer className="border-t border-neutral-200 bg-white py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center text-neutral-600">
                        <p>© 2026 NammaVeedu. Made for Chennai apartments with ❤️</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
