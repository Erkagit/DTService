'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthProvider';
import { useLanguage, type Language } from '@/context/LanguageProvider';
import { 
  LayoutDashboard, 
  Package, 
  Truck, 
  Building2, 
  Users, 
  LogOut,
  Menu,
  X,
  Globe,
  FileBox
} from 'lucide-react';
import { useState } from 'react';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const languages: { code: Language; label: string }[] = [
    { code: 'MN', label: 'MN' },
    { code: 'EN', label: 'EN' },
    { code: 'CN', label: '中文' },
  ];

  const navigation = [
    { nameKey: 'nav.dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'CLIENT_ADMIN'] },
    { nameKey: 'nav.orders', href: '/orders', icon: Package, roles: ['ADMIN', 'CLIENT_ADMIN'] },
    { nameKey: 'nav.preOrders', href: '/preorders', icon: FileBox, roles: ['ADMIN'] },
    { nameKey: 'nav.vehicles', href: '/vehicles', icon: Truck, roles: ['ADMIN'] },
    { nameKey: 'nav.companies', href: '/companies', icon: Building2, roles: ['ADMIN'] },
    { nameKey: 'nav.users', href: '/users', icon: Users, roles: ['ADMIN'] },
    ...(user?.role === 'CLIENT_ADMIN' && user.companyId ? [
      { nameKey: 'nav.myCompany', href: `/companies/${user.companyId}`, icon: Building2, roles: ['CLIENT_ADMIN'] }
    ] : []),
  ];

  const filteredNavigation = navigation.filter(item => 
    user && item.roles.includes(user.role)
  );

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen transition-transform bg-linear-to-b from-gray-900 via-gray-900 to-gray-800
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 w-64 shadow-2xl
        `}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-white/10">
            <Link href="/" className="flex items-center gap-3 min-w-0 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-white shadow-lg">
                <Image src="/logo.png" alt="Logo" width={40} height={40} className="object-cover" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-white leading-tight">Achir Bayron LLC</div>
                <div className="text-xs text-white/50 leading-tight">{t('nav.deliveryTracking')}</div>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-xl hover:bg-white/10 shrink-0"
            >
              <X className="w-5 h-5 text-white/80" />
            </button>
          </div>

          {/* User info */}
          <div className="px-4 py-4 border-b border-white/10">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
                <span className="text-gray-900 font-bold text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-white/50 truncate">{user.email}</p>
              </div>
            </div>
            <div className="mt-3 px-1">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                user.role === 'ADMIN' ? 'bg-white/10 text-white' :
                'bg-white/10 text-white'
              }`}>
                {user.role === 'ADMIN' ? t('nav.admin') : t('nav.companyAdmin')}
              </span>
            </div>
          </div>

          {/* Language selector */}
          <div className="px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-white/50" />
              <div className="flex-1 flex gap-1">
                {languages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => setLang(language.code)}
                    className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      lang === language.code
                        ? 'bg-white text-gray-900'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {language.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.nameKey}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                    ${isActive 
                      ? 'bg-white text-gray-900 font-medium shadow-lg' 
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-gray-900' : 'text-white/50'}`} />
                  <span>{t(item.nameKey)}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout button */}
          <div className="p-3 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span>{t('nav.logout')}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <header className="lg:hidden h-16 bg-linear-to-r from-gray-900 via-gray-800 to-gray-900 fixed top-0 left-0 right-0 z-30 flex items-center px-4 shadow-lg">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl hover:bg-white/10 shrink-0"
          >
            <Menu className="w-6 h-6 text-white" />
          </button>
          <div className="ml-3 flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0 bg-white">
              <Image src="/logo.png" alt="Logo" width={32} height={32} className="object-cover" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-white leading-tight truncate">Achir Bayron</div>
              <div className="text-xs text-white/60 leading-tight">Tracking</div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="lg:pt-0 pt-16">
          {children}
        </main>
      </div>
    </div>
  );
}
