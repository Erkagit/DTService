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
    MN: 'Компанийн танилцуулга',
    EN: 'Company Overview',
    CN: '公司简介'
  },
  about1: {
    MN: 'Манай компани Бүгд Найрамдах Хятад Ард Улсад 2021 онд үүсгэн байгуулагдсанаас хойш олон улсын тээвэр зуучлал, логистикийн салбарт тогтвортой үйл ажиллагаа эрхэлж, бүс нутгийн хэмжээнд тээвэр зохион байгуулалт болон логистикийн цогц үйлчилгээг мэргэжлийн өндөр түвшинд үзүүлэн ажиллаж байна.',
    EN: 'Since its establishment in 2021 in the People\'s Republic of China, our company has been continuously engaged in international freight forwarding and logistics, delivering professional regional transportation management and fully integrated logistics solutions.',
    CN: '我司成立于2021年，总部设立于中华人民共和国，多年来持续深耕于国际货运代理与物流领域，为客户提供专业的区域运输管理服务及一体化综合物流解决方案。'
  },
  about2: {
    MN: 'Харилцагч, түнш байгууллагуудтайгаа итгэлцэлд суурилсан найдвартай хамтын ажиллагааг бүрдүүлсний үндсэн дээр 2025 оноос Монгол Улсад "Ачир Байрон ХХК" нэртэй салбар компаниа байгуулж, үйл ажиллагаагаа өргөжүүлэн явуулж байна.',
    EN: 'Based on long-term trust earned from our clients and partners, we expanded our operations by establishing a subsidiary in Mongolia in 2025 under the name "Achir Bairon LLC."',
    CN: '基于与客户及合作伙伴建立的长期互信关系，我司于2025年在蒙古国设立分公司，并以"Achir Bairon LLC"为名全面拓展业务。'
  },
  about3: {
    MN: 'Бид дэлхий даяарх агентын өргөн сүлжээндээ тулгуурлан импорт, экспорт, дамжин өнгөрөх ачааны төмөр зам, далай, агаарын болон мультимодал тээвэрлэлтийн үйлчилгээг иж бүрнээр үзүүлдэг. Түүнчлэн авто замын тээвэрлэлтийг өөрийн эзэмшлийн тээврийн хэрэгсэл, техникээр гүйцэтгэдэг.',
    EN: 'Leveraging our extensive global agent network, we provide comprehensive rail, ocean, air, and multimodal transportation services for import, export, and transit cargo. We also operate our own fleet of vehicles and equipment to provide road transportation services.',
    CN: '依托覆盖全球的代理网络，我们为进出口及过境货物提供铁路、海运、空运及多式联运服务，同时配备自有车辆及运输设备，高效开展公路运输业务。'
  },
  about4: {
    MN: 'Манай компани ISO 9001:2015 болон OHSAS 18001:2007 олон улсын стандартуудыг бүрэн хэрэгжүүлж, аюулгүй ажиллагаа, үйлчилгээний чанарыг тогтмол сайжруулан ханган ажилладаг.',
    EN: 'Our operations fully comply with international management standards, including ISO 9001:2015 (Quality Management System) and OHSAS 18001:2007 (Occupational Health and Safety Management System).',
    CN: '公司严格遵循ISO 9001:2015 质量管理体系及OHSAS 18001:2007 职业健康安全管理体系等国际标准运行，持续提升安全管理水平与服务品质。'
  },
  about5: {
    MN: 'Мэргэшсэн, туршлагатай манай баг нь таны ачааг найдвартай, хугацаанд нь хүргэхээс гадна, таны бизнесийн өсөлт, хөгжилд бодит дэмжлэг үзүүлэхэд чиглэн хамтран ажиллана.',
    EN: 'Our highly skilled and experienced team ensures safe and timely cargo delivery, while actively supporting the sustainable growth and development of our clients\' businesses.',
    CN: '凭借经验丰富的专业团队，我们不仅确保货物安全、准时交付，同时致力于为客户的业务成长与长期发展提供有力支持。'
  },
  section2Title: {
    MN: 'АЛСЫН ХАРАА',
    EN: 'VISION',
    CN: '愿景'
  },
  vision: {
    MN: 'Монгол Улсаас дэлхийн зах зээлтэй холбосон, хамгийн найдвартай, хурдан, үр ашигтай логистикийн стратегийн түнш болж хөгжих.',
    EN: 'To become Mongolia\'s most reliable, fastest, and most efficient strategic logistics partner connecting the country with global markets.',
    CN: '立志发展成为连接蒙古与全球市场的最可靠、最高效、最具竞争力的战略物流合作伙伴。'
  },
  section3Title: {
    MN: 'ЭРХЭМ ЗОРИЛГО',
    EN: 'MISSION',
    CN: '使命'
  },
  mission: {
    MN: '',
    EN: '',
    CN: '',
  },
  missionPoint1: {
    MN: 'Хэрэглэгчийн хэрэгцээнд суурилсан оновчтой шийдэл',
    EN: 'Tailored logistics solutions based on client needs',
    CN: '基于客户需求定制化物流方案'
  },
  missionPoint2: {
    MN: 'Шуурхай харилцаа, ил тод мэдээлэл',
    EN: 'Transparent and proactive communication',
    CN: '主动沟通与信息透明化'
  },
  missionPoint3: {
    MN: 'Уян хатан, шуурхай шийдвэр',
    EN: 'Flexible and prompt decision-making',
    CN: '灵活高效的决策机制'
  },
  missionPoint4: {
    MN: 'Урт хугацааны итгэлцэлд суурилсан түншлэл',
    EN: 'Long-term partnership based on trust',
    CN: '基于长期互信的合作模式'
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
  value1Desc: {
    MN: 'Хүлээсэн үүргээ чанд мөрдөх',
    EN: 'Fulfillment of commitments',
    CN: '严格履行契约责任'
  },
  value2: {
    MN: 'Хариуцлага',
    EN: 'Responsibility',
    CN: '责任担当'
  },
  value2Desc: {
    MN: 'Ачааны бүрэн бүтэн байдлыг хангах',
    EN: 'Ensuring cargo safety and integrity',
    CN: '保障货物完整交付'
  },
  value3: {
    MN: 'Мэргэжлийн ур чадвар',
    EN: 'Professional Excellence',
    CN: '专业能力'
  },
  value3Desc: {
    MN: 'Олон улсын стандарт мөрдөх',
    EN: 'Compliance with global standards',
    CN: '遵循国际规范'
  },
  value4: {
    MN: 'Тасралтгүй сайжруулалт',
    EN: 'Continuous Improvement',
    CN: '持续提升'
  },
  value4Desc: {
    MN: 'Процессын тасралтгүй шинэчлэл',
    EN: 'Continuous innovation',
    CN: '持续优化提升'
  },
  value5: {
    MN: 'Шударга хамтын ажиллагаа',
    EN: 'Fair Cooperation',
    CN: '诚信合作'
  },
  value5Desc: {
    MN: 'Урт хугацааны түншлэл хөгжүүлэх',
    EN: 'Long-term partnerships',
    CN: '构建长期战略合作'
  },
  section5Title: {
    MN: 'АВТО ЗАМЫН ТЭЭВЭР',
    EN: 'ROAD TRANSPORTATION',
    CN: '公路运输'
  },
  road1: {
    MN: 'Итгэмжлэгдсэн тээврийн хэрэгсэл, мэргэшсэн жолооч, тогтмол маршрут',
    EN: 'Certified fleet, professional drivers, stable routes',
    CN: '海关备案车辆、持证司机、稳定运输线路'
  },
  road2: {
    MN: 'Хүнд даацын тээврийн хэрэгсэл: 15–50 тн',
    EN: 'Heavy-duty vehicles: 15–50 tons',
    CN: '重型卡车: 15–50 吨'
  },
  road3: {
    MN: 'Хөнгөн, дунд даацын тээврийн хэрэгсэл: 1.2–5 тн',
    EN: 'Light & medium vehicles: 1.2–5 tons',
    CN: '轻中型货车: 1.2–5 吨'
  },
  road4: {
    MN: 'Кран болон сэрээт өргөгч: 10 тн хүртэл',
    EN: 'Crane trucks & forklifts: Up to 10 tons',
    CN: '随车吊及叉车: 最大承重 10 吨'
  },
  section6Title: {
    MN: 'ТӨМӨР ЗАМЫН ТЭЭВЭР',
    EN: 'RAILWAY TRANSPORTATION',
    CN: '铁路运输'
  },
  rail1: {
    MN: 'Өртөг багатай, цаг уурын нөлөөгүй',
    EN: 'Cost-efficient, weather-independent',
    CN: '成本低、不受天气影响'
  },
  rail2: {
    MN: 'Door-to-door үйлчилгээ',
    EN: 'Door-to-door delivery',
    CN: '门到门运输服务'
  },
  rail3: {
    MN: 'Олон улсын маршрут',
    EN: 'International routes',
    CN: '国际运输线路'
  },
  section7Title: {
    MN: 'АГААРЫН ТЭЭВЭР',
    EN: 'AIR FREIGHT',
    CN: '航空运输'
  },
  air1: {
    MN: 'Хамгийн хурдан хүргэлт',
    EN: 'Fastest delivery method',
    CN: '最快捷运输方式'
  },
  air2: {
    MN: 'Яаралтай болон өндөр үнэ цэнэтэй ачаанд тохиромжтой',
    EN: 'Ideal for urgent and high-value cargo',
    CN: '适用于紧急及高价值货物'
  },
  air3: {
    MN: 'Дэлхийн маршрут',
    EN: 'Global routes',
    CN: '连接全球航线'
  },
  section8Title: {
    MN: 'МУЛЬТИМОДАЛ ТЭЭВЭР',
    EN: 'MULTIMODAL TRANSPORTATION',
    CN: '多式联运'
  },
  multi1: {
    MN: 'Tianjin & Vladivostok → Монгол',
    EN: 'Tianjin & Vladivostok → Mongolia',
    CN: '天津港、符拉迪沃斯托克 → 蒙古'
  },
  multi2: {
    MN: 'FCL – Бүтэн чингэлэг тээвэр',
    EN: 'FCL – Full Container Load',
    CN: 'FCL – 整箱运输'
  },
  multi3: {
    MN: 'Break Bulk – Том хэмжээний ачаа',
    EN: 'Break Bulk – Oversized Cargo',
    CN: '散杂大件货运输'
  },
  multi4: {
    MN: 'Ro-Ro – Тээврийн хэрэгсэл, барилгын машин',
    EN: 'Ro-Ro – Vehicles & Construction Equipment',
    CN: '车辆及工程设备运输'
  },
  section9Title: {
    MN: 'НЭМЭЛТ ҮЙЛЧИЛГЭЭ',
    EN: 'ANCILLARY SERVICES',
    CN: '增值服务'
  },
  service1: {
    MN: 'Консолидаци (LCL/LTL)',
    EN: 'Cargo consolidation (LCL/LTL)',
    CN: '拼箱零担 (LCL/LTL)'
  },
  service2: {
    MN: 'Гаалийн бүрдүүлэлт',
    EN: 'Customs clearance',
    CN: '专业清关代理'
  },
  service3: {
    MN: 'Агуулахын үйлчилгээ',
    EN: 'Warehousing',
    CN: '仓储服务'
  },
  service4: {
    MN: 'Real-time tracking дэмжлэг',
    EN: 'Real-time shipment tracking support',
    CN: '提供货物实时追踪服务'
  },
  section10Title: {
    MN: 'ХОЛБОО БАРИХ',
    EN: 'CONTACT INFORMATION',
    CN: '联系方式'
  },
  customerPolicy: {
    MN: 'ХАРИЛЦАГЧ ТӨВТЭЙ БОДЛОГО',
    EN: 'CUSTOMER-CENTRIC POLICY',
    CN: '客户中心政策'
  },
  policy1: {
    MN: 'Хэрэглэгчийн хэрэгцээнд суурилсан оновчтой шийдэл',
    EN: 'Tailored logistics solutions based on client needs',
    CN: '基于客户需求定制化物流方案'
  },
  policy2: {
    MN: 'Шуурхай харилцаа, ил тод мэдээлэл',
    EN: 'Transparent and proactive communication',
    CN: '主动沟通与信息透明化'
  },
  policy3: {
    MN: 'Real-time tracking дэмжлэг',
    EN: 'Real-time shipment tracking support',
    CN: '提供货物实时追踪服务'
  },
  policy4: {
    MN: 'Уян хатан, шуурхай шийдвэр',
    EN: 'Flexible and prompt decision-making',
    CN: '灵活高效的决策机制'
  },
  policy5: {
    MN: 'Урт хугацааны итгэлцэл',
    EN: 'Long-term partnership approach',
    CN: '基于长期互信的合作模式'
  },
  address: {
    MN: 'Монгол Улс, Улаанбаатар хот\nСүхбаатар дүүрэг, 9-р хороо\nХоймор оффис, 806 тоот',
    EN: 'Khoymor Office, Suite 806\n9th Khoroo, Sukhbaatar District\nUlaanbaatar, Mongolia',
    CN: '蒙古国 乌兰巴托市\n苏赫巴托区 第9分区\n怀默尔办公楼806室'
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
              <p className="text-white/70 text-xs">+976 99001240</p>
              <p className="text-white/70 text-xs">+976 99132414</p>
              <p className="text-white/70 text-xs">+86 15164989922</p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-7 h-7 text-white" />
              </div>
              <h4 className="font-semibold text-white mb-2 text-sm">Email</h4>
              <p className="text-white/70 text-xs">sales@achirbairon.mn</p>
              <p className="text-white/70 text-xs">B.bat-erdene@achirbairon.mn</p>
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
              <span className="text-white/60 text-sm">© 2025 Achir Bayron LLC. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-white/40 text-sm">Powered by Erka Gantsaaraa</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}