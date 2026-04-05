import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Truck, Package, Shield, Zap, Star, ChevronRight,
  MapPin, Clock, CreditCard, Users
} from 'lucide-react';

export default function Landing() {
  const { t } = useTranslation();

  const stats = [
    { value:'10K+', label: t('landing.stats.deliveries') },
    { value:'500+', label: t('landing.stats.drivers')    },
    { value:'98%',  label: t('landing.stats.onTime')     },
    { value:'4.8★', label: t('landing.stats.rating')     },
  ];

  const steps = [
    { step:'01', title: t('landing.steps.s1title'), desc: t('landing.steps.s1desc') },
    { step:'02', title: t('landing.steps.s2title'), desc: t('landing.steps.s2desc') },
    { step:'03', title: t('landing.steps.s3title'), desc: t('landing.steps.s3desc') },
    { step:'04', title: t('landing.steps.s4title'), desc: t('landing.steps.s4desc') },
  ];

  const features = [
    { icon: Zap,        title: t('landing.features.f1title'), desc: t('landing.features.f1desc') },
    { icon: MapPin,     title: t('landing.features.f2title'), desc: t('landing.features.f2desc') },
    { icon: CreditCard, title: t('landing.features.f3title'), desc: t('landing.features.f3desc') },
    { icon: Shield,     title: t('landing.features.f4title'), desc: t('landing.features.f4desc') },
    { icon: Clock,      title: t('landing.features.f5title'), desc: t('landing.features.f5desc') },
    { icon: Users,      title: t('landing.features.f6title'), desc: t('landing.features.f6desc') },
  ];

  const rates = [
    {
      vehicle: 'Bike', icon:'🏍️', rate:'₹22/km', base:'₹30 base fare',
      best: t('landing.features.f1desc').slice(0,20),
      bestKey: 'Small parcels, documents',
      color:'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
    },
    {
      vehicle: 'Van / Auto', icon:'🚐', rate:'₹77/km', base:'₹100 base fare',
      bestKey: 'Medium goods, furniture',
      color:'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      featured: true
    },
    {
      vehicle: 'Heavy', icon:'🚛', rate:'₹150/km', base:'₹200 base fare',
      bestKey: 'Bulk goods, machinery',
      color:'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-950 text-gray-900 dark:text-white min-h-screen">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600
                        via-blue-700 to-indigo-800"/>
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize:'32px 32px'
          }}/>
        <div className="relative max-w-6xl mx-auto px-4 py-24 sm:py-32">
          <div className="text-center">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10
                            backdrop-blur rounded-full text-white text-sm font-medium
                            mb-8 border border-white/20">
              <Zap size={14} className="text-yellow-300"/>
              {t('landing.badge')}
            </div>

            {/* Title */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white
                           mb-6 leading-tight">
              {t('landing.heroTitle1')}<br/>
              <span className="text-yellow-300">{t('landing.heroTitle2')}</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
              {t('landing.heroSubtitle')}
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-4
                           bg-white text-blue-700 font-bold rounded-2xl
                           hover:bg-blue-50 transition-all text-lg shadow-xl
                           hover:shadow-2xl hover:-translate-y-0.5">
                {t('landing.startDelivering')}
                <ChevronRight size={20}/>
              </Link>
              <Link to="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4
                           bg-white/10 backdrop-blur text-white font-semibold
                           rounded-2xl border border-white/30 hover:bg-white/20
                           transition-all text-lg">
                {t('landing.loginDashboard')}
              </Link>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map(s => (
              <div key={s.label}
                className="text-center p-4 bg-white/10 backdrop-blur rounded-2xl
                           border border-white/20">
                <div className="text-3xl font-bold text-white">{s.value}</div>
                <div className="text-blue-200 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{t('landing.howItWorks')}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
              {t('landing.howSubtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={s.step} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full
                                  h-0.5 bg-blue-200 dark:bg-blue-800 z-0
                                  -translate-x-1/2"/>
                )}
                <div className="relative z-10 bg-white dark:bg-gray-800 rounded-2xl
                                p-6 border border-gray-100 dark:border-gray-700
                                hover:shadow-lg hover:-translate-y-1 transition-all">
                  <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center
                                  justify-center text-white font-bold text-lg mb-4">
                    {s.step}
                  </div>
                  <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{t('landing.whyTitle')}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {t('landing.whySub')}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(f => (
              <div key={f.title}
                className="p-6 rounded-2xl border border-gray-100 dark:border-gray-800
                           hover:border-blue-200 dark:hover:border-blue-700
                           hover:shadow-lg transition-all group bg-white dark:bg-gray-900">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl
                                flex items-center justify-center mb-4
                                group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50
                                transition-colors">
                  <f.icon size={22} className="text-blue-600 dark:text-blue-400"/>
                </div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{t('landing.pricingTitle')}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {t('landing.pricingSub')}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {rates.map(r => (
              <div key={r.vehicle}
                className={`relative p-8 rounded-2xl border-2 ${r.color}
                            ${r.featured ? 'scale-105 shadow-xl' : 'hover:shadow-md'}
                            transition-all`}>
                {r.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2
                                  px-4 py-1 bg-blue-600 text-white text-xs
                                  font-bold rounded-full">
                    {t('landing.mostPopular')}
                  </div>
                )}
                <div className="text-4xl mb-3">{r.icon}</div>
                <h3 className="text-xl font-bold mb-1">{r.vehicle}</h3>
                <div className="text-3xl font-bold text-blue-600
                                dark:text-blue-400 mb-1">
                  {r.rate}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {r.base}
                </div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300
                                bg-white/60 dark:bg-gray-800/60 rounded-xl px-3 py-2">
                  {t('landing.bestFor')}: {r.bestKey}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            {t('landing.ctaTitle')}
          </h2>
          <p className="text-blue-100 text-xl mb-10 max-w-xl mx-auto">
            {t('landing.ctaSub')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-4
                         bg-white text-blue-700 font-bold rounded-2xl
                         hover:bg-blue-50 transition-all text-lg shadow-xl">
              {t('landing.createFree')}
              <ChevronRight size={20}/>
            </Link>
            <Link to="/login"
              className="inline-flex items-center justify-center px-8 py-4
                         border-2 border-white/40 text-white font-semibold
                         rounded-2xl hover:bg-white/10 transition-all text-lg">
              {t('landing.alreadyAccount')}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center
                          justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center
                              justify-center">
                <Truck size={16} className="text-white"/>
              </div>
              <span className="text-white font-bold text-lg">
                Go<span className="text-blue-400">Goods</span>
              </span>
            </div>
            <p className="text-sm">
              © 2024 GoGoods. {t('landing.footer')}.
            </p>
            <div className="flex gap-6 text-sm">
              <Link to="/login"
                className="hover:text-white transition-colors">
                {t('nav.login')}
              </Link>
              <Link to="/signup"
                className="hover:text-white transition-colors">
                {t('nav.signup')}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}