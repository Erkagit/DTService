'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  Truck, 
  Train, 
  Plane, 
  Ship, 
  Package, 
  MapPin, 
  Phone, 
  Mail, 
  Globe,
  Shield,
  Clock,
  Users,
  CheckCircle,
  ArrowRight,
  Warehouse,
  FileCheck,
  Radar,
  Target,
  Eye,
  Heart,
  Zap,
  Settings,
  ChevronDown,
  Building2,
  Lock,
  User
} from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';
import { authApi } from '@/services/api';

type Language = 'MN' | 'EN' | 'CN';

const translations = {
  heroTagline: {
    MN: 'Хил хязгааргүй холболт',
    EN: 'Connecting Without Borders',
    CN: '无国界连接'
  },
  heroSubtitle: {
    MN: 'Олон улсын тээвэр логистикийн цогц шийдэл',
    EN: 'Comprehensive International Logistics Solutions',
    CN: '综合性国际物流解决方案'
  },
  loginBtn: {
    MN: 'Нэвтрэх',
    EN: 'Login',
    CN: '登录'
  },
  emailLabel: {
    MN: 'Имэйл эсвэл Нэр',
    EN: 'Email or Username',
    CN: '邮箱或用户名'
  },
  emailPlaceholder: {
    MN: 'Имэйл эсвэл нэр',
    EN: 'Email or username',
    CN: '邮箱或用户名'
  },
  passwordLabel: {
    MN: 'Нууц үг',
    EN: 'Password',
    CN: '密码'
  },
  passwordPlaceholder: {
    MN: 'Нууц үгээ оруулна уу',
    EN: 'Enter your password',
    CN: '请输入密码'
  },
  loggingIn: {
    MN: 'Нэвтэрч байна...',
    EN: 'Logging in...',
    CN: '登录中...'
  },
  loginError: {
    MN: 'Имэйл/нэр эсвэл нууц үг буруу байна',
    EN: 'Invalid email/username or password',
    CN: '邮箱/用户名或密码错误'
  },
  trackBtn: {
    MN: 'Ачаа хянах',
    EN: 'Track Shipment',
    CN: '货物追踪'
  },
  section1Title: {
    MN: 'БИДНИЙ ТУХАЙ',
    EN: 'ABOUT US',
    CN: '关于我们'
  },
  section1Subtitle: {
    MN: 'Товч танилцуулга',
    EN: 'Company Overview',
    CN: '公司简介'
  },
  about1: {
    MN: 'Манай компани 2021 онд БНХАУ-д байгуулагдаж, олон улсын тээвэр логистикийн салбарт цогц үйлчилгээ үзүүлж байна.',
    EN: 'Our company was established in 2021 in China, delivering comprehensive international logistics services.',
    CN: '我司成立于2021年，总部设立于中国，提供综合性国际物流服务。'
  },
  about2: {
    MN: 'Манай баг авто зам, төмөр зам, агаарын болон далайн тээврийн уялдаа холбоотой сүлжээг ашиглан тээврийн шийдлийг мэргэжлийн түвшинд зохион байгуулдаг.',
    EN: 'Our professional team manages transportation through integrated road, rail, air, and ocean logistics networks.',
    CN: '我们整合公路、铁路、航空及海运资源，构建专业化多式联运体系。'
  },
  about3: {
    MN: 'Бид чингэлэг тээвэр, агуулах, гааль болон door-to-door хүргэлтийг нэг цэгийн үйлчилгээгээр санал болгодог.',
    EN: 'We provide container transportation, warehousing, customs clearance, and door-to-door delivery as a one-stop logistics service.',
    CN: '公司提供集装箱运输、仓储服务、报关清关及门到门配送的一站式物流服务。'
  },
  about4: {
    MN: 'Манай компанийн үйл ажиллагаа ISO 9001:2015, OHSAS 18001:2007 стандартын дагуу явагддаг.',
    EN: 'Our operations comply with ISO 9001:2015 and OHSAS 18001:2007 international certifications.',
    CN: '公司严格遵循 ISO 9001:2015 及 OHSAS 18001:2007 国际管理体系认证标准运行。'
  },
  section2Title: {
    MN: 'АЛСЫН ХАРАА',
    EN: 'VISION',
    CN: '愿景'
  },
  vision: {
    MN: 'Монголын логистикийн салбарт найдвартай, тэргүүлэгч тээврийн компани болох.',
    EN: "To become Mongolia's most trusted and leading logistics service provider.",
    CN: '成为蒙古国最具信誉和领先地位的物流服务商。'
  },
  section3Title: {
    MN: 'ЭРХЭМ ЗОРИЛГО',
    EN: 'MISSION',
    CN: '使命'
  },
  mission: {
    MN: 'Захиалагч бүрт тохирсон оновчтой тээврийн цогц шийдлийг санал болгох.',
    EN: 'To deliver optimized and integrated logistics solutions tailored to each customer.',
    CN: '为每位客户提供定制化、最优的一体化物流解决方案。'
  },
  missionPoint1: {
    MN: 'Зам, агаар, далай, төмөр замын сүлжээг хослуулан ашиглах',
    EN: 'Integrating road, air, sea, and rail transportation networks',
    CN: '整合公路、航空、海运及铁路运输网络'
  },
  missionPoint2: {
    MN: 'Аюулгүй, шуурхай, найдвартай хүргэлт хийх',
    EN: 'Ensuring safe, fast, and reliable delivery',
    CN: '确保安全、准时、可靠交付'
  },
  missionPoint3: {
    MN: 'Real-time tracking хяналтын систем ашиглах',
    EN: 'Implementing real-time tracking systems',
    CN: '实施实时货物追踪系统'
  },
  missionPoint4: {
    MN: 'Мэргэжлийн зөвлөгөө, бүрэн дэмжлэг үзүүлэх',
    EN: 'Providing professional consulting and customer support',
    CN: '提供专业咨询与全程客户支持'
  },
  section4Title: {
    MN: 'ҮНЭТ ЗҮЙЛС',
    EN: 'CORE VALUES',
    CN: '核心价值'
  },
  value1: {
    MN: 'Найдвартай байдал',
    EN: 'Reliability',
    CN: '可靠诚信'
  },
  value2: {
    MN: 'Хариуцлага',
    EN: 'Responsibility',
    CN: '责任担当'
  },
  value3: {
    MN: 'Мэргэжлийн ур чадвар',
    EN: 'Professional Excellence',
    CN: '专业能力'
  },
  value4: {
    MN: 'Тасралтгүй хөгжил',
    EN: 'Continuous Improvement',
    CN: '持续提升'
  },
  value5: {
    MN: 'Зохион байгуулалт, шуурхай байдал',
    EN: 'Efficiency & Organization',
    CN: '高效组织'
  },
  section5Title: {
    MN: 'АВТО ТЭЭВЭР',
    EN: 'ROAD TRANSPORTATION',
    CN: '公路运输'
  },
  road1: {
    MN: 'Гаалийн итгэмжлэгдсэн тээврийн хэрэгсэл',
    EN: 'Customs-certified vehicles',
    CN: '海关备案认证车辆'
  },
  road2: {
    MN: 'Мэргэжлийн жолоочтой аюулгүй тээвэр',
    EN: 'Safe transportation with licensed drivers',
    CN: '持证司机安全运输'
  },
  road3: {
    MN: 'Тогтмол олон улсын маршрут',
    EN: 'Regular international routes',
    CN: '稳定国际运输线路'
  },
  section6Title: {
    MN: 'ТӨМӨР ЗАМЫН ТЭЭВЭР',
    EN: 'RAILWAY TRANSPORTATION',
    CN: '铁路运输'
  },
  rail1: {
    MN: 'Өртөг багатай',
    EN: 'Cost-effective',
    CN: '成本低'
  },
  rail2: {
    MN: 'Цаг уурын нөлөөгүй',
    EN: 'Weather-independent',
    CN: '不受天气影响'
  },
  rail3: {
    MN: 'Door-to-door үйлчилгээ',
    EN: 'Door-to-door service',
    CN: '门到门服务'
  },
  section7Title: {
    MN: 'АГААРЫН ТЭЭВЭР',
    EN: 'AIR TRANSPORTATION',
    CN: '航空运输'
  },
  air1: {
    MN: 'Хамгийн хурдан хүргэлт',
    EN: 'Fastest delivery method',
    CN: '最快捷运输方式'
  },
  air2: {
    MN: 'Яаралтай ачигдахад тохиромжтой',
    EN: 'Ideal for urgent shipments',
    CN: '适用于紧急货物运输'
  },
  air3: {
    MN: 'Incheon – дэлхийн маршрут',
    EN: 'Global routes via Incheon airport',
    CN: '经仁川机场连接全球航线'
  },
  section8Title: {
    MN: 'МУЛЬТИМОДАЛ ТЭЭВЭР',
    EN: 'MULTIMODAL TRANSPORT',
    CN: '多式联运'
  },
  multi1: {
    MN: 'Далайн тээвэр – Тяньжин, Владивосток',
    EN: 'Ocean freight – Tianjin & Vladivostok',
    CN: '海运 – 天津港、符拉迪沃斯托克港'
  },
  multi2: {
    MN: 'Төмөр зам – Москва чиглэл',
    EN: 'Rail transport via Moscow',
    CN: '铁路 – 经莫斯科线路'
  },
  multi3: {
    MN: 'Авто зам – Хил болон дотоод түгээлт',
    EN: 'Road delivery for border & domestic distribution',
    CN: '公路 – 边境及国内配送'
  },
  section9Title: {
    MN: 'НЭМЭЛТ ҮЙЛЧИЛГЭЭ',
    EN: 'ADDITIONAL SERVICES',
    CN: '增值服务'
  },
  service1: {
    MN: 'Консолид тээвэр (LCL / LTL)',
    EN: 'Cargo consolidation services (LCL / LTL)',
    CN: '拼箱及零担服务（LCL / LTL）'
  },
  service2: {
    MN: 'Импорт, экспортын гаалийн бүрдүүлэлт',
    EN: 'Import & export customs clearance',
    CN: '进出口清关服务'
  },
  service3: {
    MN: 'Агуулах, бараа хадгалалт',
    EN: 'Warehousing solutions',
    CN: '仓储服务'
  },
  service4: {
    MN: 'Real-time tracking хяналт',
    EN: 'Real-time tracking monitoring',
    CN: '实时追踪监控'
  },
  section10Title: {
    MN: 'ХОЛБОО БАРИХ',
    EN: 'CONTACT',
    CN: '联系方式'
  },
  address: {
    MN: 'Songinokhairkhan District, 9th Khoroo\nTransport Office Building, 60B\nUlaanbaatar, Mongolia',
    EN: 'Songinokhairkhan District, 9th Khoroo\nTransport Office Building, 60B\nUlaanbaatar, Mongolia',
    CN: 'Songinokhairkhan District, 9th Khoroo\nTransport Office Building, 60B\nUlaanbaatar, Mongolia'
  }
};

export default function LandingPage() {
  const [lang, setLang] = useState<Language>('MN');
  const [isScrolled, setIsScrolled] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  
  // Login form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const t = (key: keyof typeof translations) => translations[key][lang];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    if (!email || !password) {
      setLoginError(t('loginError'));
      return;
    }

    setLoginLoading(true);

    try {
      const response = await authApi.login(email, password);
      login(response.data.user, response.data.token);
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setLoginError(t('loginError'));
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Fixed Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl overflow-hidden bg-white shadow-md">
                <Image src="/logo.png" alt="Achir Bayron" width={48} height={48} className="object-cover" />
              </div>
              <div className="hidden sm:block">
                <div className={`font-bold text-lg ${isScrolled ? 'text-gray-900' : 'text-white'}`}>
                  ACHIR BAYRON LLC
                </div>
                <div className={`text-xs ${isScrolled ? 'text-gray-500' : 'text-white/80'}`}>
                  SOLUTION
                </div>
              </div>
            </div>

            {/* Language Toggle */}
            <div className="flex items-center gap-2 md:gap-4">
              <div className={`flex rounded-full p-1 ${isScrolled ? 'bg-gray-100' : 'bg-white/20 backdrop-blur-sm'}`}>
                {(['MN', 'EN', 'CN'] as Language[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`px-3 py-1.5 text-xs md:text-sm font-medium rounded-full transition-all ${
                      lang === l
                        ? 'bg-gray-900 text-white shadow-md'
                        : isScrolled 
                          ? 'text-gray-600 hover:text-gray-900' 
                          : 'text-white/80 hover:text-white'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
        {/* Background */}
        <div className="absolute inset-0 bg-linear-to-br from-gray-900 via-gray-800 to-gray-900">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Animated Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Side - Company Info */}
            <div className="text-center lg:text-left space-y-6">
              {/* Company Name Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-white/90 text-sm font-medium">ACHIR BAYRON LLC SOLUTION</span>
              </div>

              {/* Main Tagline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                {t('heroTagline')}
              </h1>

              {/* Subtitle */}
              <p className="text-lg sm:text-xl text-white/70 max-w-xl">
                {t('heroSubtitle')}
              </p>

              {/* Transport Icons */}
              <div className="flex items-center justify-center lg:justify-start gap-4 md:gap-6 py-4">
                {[
                  { icon: Truck, label: lang === 'MN' ? 'Авто' : lang === 'CN' ? '公路' : 'Road' },
                  { icon: Train, label: lang === 'MN' ? 'Төмөр зам' : lang === 'CN' ? '铁路' : 'Rail' },
                  { icon: Plane, label: lang === 'MN' ? 'Агаар' : lang === 'CN' ? '航空' : 'Air' },
                  { icon: Ship, label: lang === 'MN' ? 'Далай' : lang === 'CN' ? '海运' : 'Sea' },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 group">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 transition-all border border-white/10">
                      <item.icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                    </div>
                    <span className="text-white/60 text-xs">{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Learn More Button */}
              <button
                onClick={() => scrollToSection('about')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-full font-medium hover:bg-white/20 transition-all border border-white/20"
              >
                {lang === 'MN' ? 'Дэлгэрэнгүй' : lang === 'CN' ? '了解更多' : 'Learn More'}
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto mb-4 shadow-lg">
                    <Image src="/logo.png" alt="Achir Bayron" width={64} height={64} className="object-cover" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {lang === 'MN' ? 'Системд нэвтрэх' : lang === 'CN' ? '登录系统' : 'Login to System'}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {lang === 'MN' ? 'Ачааны байршлаа хянах' : lang === 'CN' ? '追踪您的货物' : 'Track your shipments'}
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  {/* Email Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {t('emailLabel')}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('emailPlaceholder')}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {t('passwordLabel')}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t('passwordPlaceholder')}
                        className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <Eye className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Error Message */}
                  {loginError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-sm text-red-600">{loginError}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loginLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>{t('loggingIn')}</span>
                      </>
                    ) : (
                      <>
                        <span>{t('loginBtn')}</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white text-gray-500">
                      {lang === 'MN' ? 'Туршилтын мэдээлэл' : lang === 'CN' ? '测试账号' : 'Test Credentials'}
                    </span>
                  </div>
                </div>

                {/* Test Credentials */}
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-2">
                    {lang === 'MN' ? 'Админ эрхээр нэвтрэх:' : lang === 'CN' ? '管理员登录：' : 'Admin login:'}
                  </p>
                  <p className="text-sm font-mono text-gray-700">admin@dts.local / password123</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-white/50 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-gray-500 tracking-wider">{t('section1Title')}</span>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold text-gray-900">{t('section1Subtitle')}</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            {[
              { text: t('about1'), icon: Building2 },
              { text: t('about2'), icon: Settings },
              { text: t('about3'), icon: Package },
              { text: t('about4'), icon: Shield },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-6 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center shrink-0">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-gray-600 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision, Mission & Core Values Section */}
      <section className="py-20 md:py-32 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {/* Vision */}
            <div className="text-center p-8 rounded-3xl bg-white/5 hover:bg-white/10 transition-colors">
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-6">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-400 tracking-wider">{t('section2Title')}</span>
              <p className="mt-4 text-lg text-white/90 leading-relaxed">{t('vision')}</p>
            </div>

            {/* Mission */}
            <div className="text-center p-8 rounded-3xl bg-white/5 hover:bg-white/10 transition-colors">
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-400 tracking-wider">{t('section3Title')}</span>
              <p className="mt-4 text-lg text-white/90 leading-relaxed mb-4">{t('mission')}</p>
              <div className="space-y-2 text-left">
                {[t('missionPoint1'), t('missionPoint2'), t('missionPoint3'), t('missionPoint4')].map((point, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-white/70">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Core Values */}
            <div className="text-center p-8 rounded-3xl bg-white/5 hover:bg-white/10 transition-colors">
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-400 tracking-wider">{t('section4Title')}</span>
              <div className="mt-4 space-y-3">
                {[
                  { text: t('value1'), icon: Shield },
                  { text: t('value2'), icon: Users },
                  { text: t('value3'), icon: Zap },
                  { text: t('value4'), icon: Settings },
                  { text: t('value5'), icon: Clock },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-left">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                      <item.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm text-white/90">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Transportation Services */}
      <section className="py-20 md:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Road */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-gray-900 flex items-center justify-center mb-6">
                <Truck className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t('section5Title')}</h3>
              <ul className="space-y-3">
                {[t('road1'), t('road2'), t('road3')].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Rail */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-gray-900 flex items-center justify-center mb-6">
                <Train className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t('section6Title')}</h3>
              <ul className="space-y-3">
                {[t('rail1'), t('rail2'), t('rail3')].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Air */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-gray-900 flex items-center justify-center mb-6">
                <Plane className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t('section7Title')}</h3>
              <ul className="space-y-3">
                {[t('air1'), t('air2'), t('air3')].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Multimodal */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-gray-900 flex items-center justify-center mb-6">
                <Ship className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t('section8Title')}</h3>
              <ul className="space-y-3">
                {[t('multi1'), t('multi2'), t('multi3')].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-20 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-gray-500 tracking-wider">{t('section9Title')}</span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { text: t('service1'), icon: Package },
              { text: t('service2'), icon: FileCheck },
              { text: t('service3'), icon: Warehouse },
              { text: t('service4'), icon: Radar },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center p-6 rounded-2xl border-2 border-gray-100 hover:border-gray-900 transition-colors">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                  <item.icon className="w-7 h-7 text-gray-700" />
                </div>
                <p className="font-medium text-gray-900">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 md:py-32 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-gray-400 tracking-wider">{t('section10Title')}</span>
          </div>

          {/* Horizontal Contact Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div className="text-center p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-7 h-7 text-white" />
              </div>
              <h4 className="font-semibold text-white mb-2 text-sm">Address</h4>
              <p className="text-white/70 text-xs leading-relaxed">{t('address')}</p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4">
                <Phone className="w-7 h-7 text-white" />
              </div>
              <h4 className="font-semibold text-white mb-2 text-sm">Phone</h4>
              <p className="text-white/70 text-xs">+976 95071104</p>
              <p className="text-white/70 text-xs">+976 99152114</p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-7 h-7 text-white" />
              </div>
              <h4 className="font-semibold text-white mb-2 text-sm">Email</h4>
              <p className="text-white/70 text-xs">sales@achirbairon.mn</p>
              <p className="text-white/70 text-xs">b.baterdene@achirbairon.mn</p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4">
                <Globe className="w-7 h-7 text-white" />
              </div>
              <h4 className="font-semibold text-white mb-2 text-sm">Website</h4>
              <a href="https://www.achirbairon.mn" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors text-xs">
                www.achirbairon.mn
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg overflow-hidden">
                <Image src="/logo.png" alt="Achir Bayron" width={32} height={32} className="object-cover" />
              </div>
              <span className="text-white/60 text-sm">© 2024 Achir Bayron LLC. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-white/40 text-sm">Powered by Delivery Tracking System</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}