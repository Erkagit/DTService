'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'MN' | 'EN' | 'CN';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// All translations
const translations: Record<string, Record<Language, string>> = {
  // SIDEBAR / NAVIGATION
  'nav.dashboard': { MN: 'Хянах самбар', EN: 'Dashboard', CN: '仪表盘' },
  'nav.orders': { MN: 'Захиалга', EN: 'Orders', CN: '订单' },
  'nav.preOrders': { MN: 'Урьдчилсан захиалга', EN: 'Pre-Orders', CN: '预订单' },
  'nav.vehicles': { MN: 'Тээврийн хэрэгсэл', EN: 'Vehicles', CN: '运输车辆' },
  'nav.companies': { MN: 'Компаниуд', EN: 'Companies', CN: '公司' },
  'nav.users': { MN: 'Хэрэглэгчид', EN: 'Users', CN: '用户' },
  'nav.myCompany': { MN: 'Миний компани', EN: 'My Company', CN: '我的公司' },
  'nav.admin': { MN: 'Админ', EN: 'Admin', CN: '管理员' },
  'nav.companyAdmin': { MN: 'Компанийн Админ', EN: 'Company Admin', CN: '公司管理员' },
  'nav.logout': { MN: 'Гарах', EN: 'Logout', CN: '退出登录' },
  'nav.deliveryTracking': { MN: 'Delivery Tracking', EN: 'Delivery Tracking', CN: '运输跟踪' },
  'nav.reports': { MN: 'Тайлан', EN: 'Reports', CN: '报告' },

  // REPORTS PAGE
  'reports.title': { MN: 'Тайлан', EN: 'Reports', CN: '报告' },
  'reports.subtitle': { MN: 'Захиалгын дэлгэрэнгүй тайлан', EN: 'Detailed order reports', CN: '订单详细报告' },
  'reports.search': { MN: 'Хайх...', EN: 'Search...', CN: '搜索...' },
  'reports.allStatus': { MN: 'Бүх статус', EN: 'All status', CN: '所有状态' },
  'reports.allCompanies': { MN: 'Бүх компани', EN: 'All companies', CN: '所有公司' },
  'reports.export': { MN: 'Экспорт', EN: 'Export', CN: '导出' },
  'reports.noResults': { MN: 'Үр дүн олдсонгүй', EN: 'No results found', CN: '未找到结果' },
  'reports.totalOrders': { MN: 'Нийт захиалга', EN: 'Total orders', CN: '总订单' },
  'reports.totalAmount': { MN: 'Нийт дүн', EN: 'Total amount', CN: '总金额' },
  'reports.completed': { MN: 'Дууссан', EN: 'Completed', CN: '已完成' },
  'reports.pending': { MN: 'Хүлээгдэж буй', EN: 'Pending', CN: '待处理' },

  // DASHBOARD
  'dashboard.title': { MN: 'Хянах самбар', EN: 'Dashboard', CN: '仪表盘' },
  'dashboard.subtitle': { MN: 'Хүргэлтийн системийн ерөнхий мэдээлэл', EN: 'Delivery system overview', CN: '运输系统概览' },
  'dashboard.loading': { MN: 'Ачааллаж байна...', EN: 'Loading...', CN: '加载中...' },
  'dashboard.totalOrders': { MN: 'Нийт захиалга', EN: 'Total orders', CN: '总订单数' },
  'dashboard.activeCompletedOrders': { MN: 'Идэвхтэй болон дууссан захиалга', EN: 'Active & completed orders', CN: '进行中及已完成订单' },
  'dashboard.activeVehicles': { MN: 'Идэвхтэй тээврийн хэрэгсэл', EN: 'Active vehicles', CN: '活跃车辆' },
  'dashboard.operatingVehicles': { MN: 'Ажиллаж байгаа хэрэгсэл', EN: 'Operating vehicles', CN: '运行中车辆' },
  'dashboard.registeredCompanies': { MN: 'Бүртгэлтэй компаниуд', EN: 'Registered companies', CN: '已注册公司' },
  'dashboard.companyDetail': { MN: 'Компанийн дэлгэрэнгүй', EN: 'Company detail', CN: '公司详情' },
  'dashboard.vehicleLocation': { MN: 'Тээврийн хэрэгслийн байршил', EN: 'Vehicle location', CN: '车辆位置' },
  'dashboard.activeOrderLocations': { MN: 'Идэвхтэй захиалгуудын байршил', EN: 'Active order locations', CN: '活跃订单位置' },
  'dashboard.latestOrders': { MN: 'Сүүлийн захиалгууд', EN: 'Latest orders', CN: '最近订单' },
  'dashboard.recentlyCreatedOrders': { MN: 'Хамгийн сүүлд үүссэн захиалгууд', EN: 'Recently created orders', CN: '最新创建订单' },
  'dashboard.viewAll': { MN: 'Бүгдийг харах', EN: 'View all', CN: '查看全部' },
  'dashboard.noOrdersFound': { MN: 'Захиалга олдсонгүй', EN: 'No orders found', CN: '未找到订单' },
  'dashboard.createFirstOrderDesc': { MN: 'Эхний захиалгаа үүсгэж эхлээрэй', EN: 'Create your first order', CN: '创建您的第一张订单' },
  'dashboard.createFirstOrder': { MN: 'Эхний захиалга үүсгэх', EN: 'Create first order', CN: '创建首个订单' },

  // ORDERS
  'orders.title': { MN: 'Захиалга', EN: 'Orders', CN: '订单' },
  'orders.subtitle': { MN: 'Хүргэлтийн захиалга удирдлага', EN: 'Delivery order management', CN: '运输订单管理' },
  'orders.new': { MN: 'Шинэ захиалга', EN: 'New order', CN: '新建订单' },
  'orders.active': { MN: 'Идэвхтэй захиалгууд', EN: 'Active orders', CN: '进行中订单' },
  'orders.inProgress': { MN: 'захиалга үргэлжилж байна', EN: 'orders in progress', CN: '订单进行中' },
  'orders.noActive': { MN: 'Идэвхтэй захиалга байхгүй', EN: 'No active orders', CN: '没有进行中的订单' },
  'orders.completed': { MN: 'Дууссан захиалгууд', EN: 'Completed orders', CN: '已完成订单' },
  'orders.orderCompleted': { MN: 'захиалга дууссан', EN: 'orders completed', CN: '订单已完成' },
  'orders.hide': { MN: 'Нуух', EN: 'Hide', CN: '隐藏' },
  'orders.show': { MN: 'Харуулах', EN: 'Show', CN: '显示' },
  'orders.showCompleted': { MN: 'Дууссан захиалга харуулах', EN: 'Show completed orders', CN: '显示已完成订单' },
  'orders.noOrders': { MN: 'Захиалга байхгүй байна', EN: 'No orders available', CN: '目前没有订单' },
  'orders.createFirst': { MN: 'Эхлээд захиалга үүсгэнэ үү', EN: 'Please create an order first', CN: '请先创建订单' },
  'orders.create': { MN: 'Захиалга үүсгэх', EN: 'Create order', CN: '创建订单' },
  'orders.createSuccess': { MN: 'Захиалга амжилттай үүсгэлээ!', EN: 'Order created successfully!', CN: '订单创建成功！' },
  'orders.createFailed': { MN: 'Захиалга үүсгэх амжилтгүй боллоо', EN: 'Failed to create order', CN: '创建订单失败' },
  'orders.statusUpdateFailed': { MN: 'Статус шинэчлэх амжилтгүй боллоо', EN: 'Failed to update status', CN: '状态更新失败' },
  'orders.deleteSuccess': { MN: 'Захиалга амжилттай устгагдлаа!', EN: 'Order deleted successfully!', CN: '订单已成功删除！' },
  'orders.deleteFailed': { MN: 'Захиалга устгах амжилтгүй боллоо', EN: 'Failed to delete order', CN: '删除订单失败' },
  'orders.deleteConfirm': { MN: 'захиалгыг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.', EN: 'Are you sure you want to delete this order? This action cannot be undone.', CN: '确认要删除此订单吗？此操作无法撤销。' },
  'orders.statusUpdateConfirm': { MN: 'статусыг болгон шинэчлэх үү?', EN: 'Do you want to update the status?', CN: '是否要更新状态？' },

  // VEHICLES
  'vehicles.title': { MN: 'Тээврийн хэрэгсэл', EN: 'Vehicles', CN: '运输车辆' },
  'vehicles.subtitle': { MN: 'Тээврийн хэрэгсэл болон GPS төхөөрөмж удирдлага', EN: 'Vehicle & GPS device management', CN: '车辆及GPS设备管理' },
  'vehicles.newDevice': { MN: 'Шинэ төхөөрөмж', EN: 'New device', CN: '新建设备' },
  'vehicles.newVehicle': { MN: 'Шинэ тээврийн хэрэгсэл', EN: 'New vehicle', CN: '新建车辆' },
  'vehicles.createSuccess': { MN: 'Тээврийн хэрэгсэл амжилттай үүсгэлээ!', EN: 'Vehicle created successfully!', CN: '车辆创建成功！' },
  'vehicles.createFailed': { MN: 'Тээврийн хэрэгсэл үүсгэх амжилтгүй боллоо', EN: 'Failed to create vehicle', CN: '创建车辆失败' },
  'vehicles.deviceCreateSuccess': { MN: 'Төхөөрөмж амжилттай үүсгэлээ!', EN: 'Device created successfully!', CN: '设备创建成功！' },
  'vehicles.deviceCreateFailed': { MN: 'Төхөөрөмж үүсгэх амжилтгүй боллоо', EN: 'Failed to create device', CN: '创建设备失败' },
  'vehicles.updateSuccess': { MN: 'Тээврийн хэрэгсэл амжилттай шинэчлэгдлээ!', EN: 'Vehicle updated successfully!', CN: '车辆更新成功！' },
  'vehicles.updateFailed': { MN: 'Тээврийн хэрэгсэл шинэчлэх амжилтгүй боллоо', EN: 'Failed to update vehicle', CN: '更新车辆失败' },
  'vehicles.deleteSuccess': { MN: 'Тээврийн хэрэгсэл амжилттай устгагдлаа!', EN: 'Vehicle deleted successfully!', CN: '车辆已成功删除！' },
  'vehicles.deleteFailed': { MN: 'Тээврийн хэрэгсэл устгах амжилтгүй боллоо', EN: 'Failed to delete vehicle', CN: '删除车辆失败' },
  'vehicles.deviceUpdateSuccess': { MN: 'Төхөөрөмж амжилттай шинэчлэгдлээ!', EN: 'Device updated successfully!', CN: '设备更新成功！' },
  'vehicles.deviceUpdateFailed': { MN: 'Төхөөрөмж шинэчлэх амжилтгүй боллоо', EN: 'Failed to update device', CN: '更新设备失败' },
  'vehicles.deviceDeleteSuccess': { MN: 'Төхөөрөмж амжилттай устгагдлаа!', EN: 'Device deleted successfully!', CN: '设备已成功删除！' },
  'vehicles.deviceDeleteFailed': { MN: 'Төхөөрөмж устгах амжилтгүй боллоо', EN: 'Failed to delete device', CN: '删除设备失败' },
  'vehicles.deleteConfirm': { MN: 'тээврийн хэрэгслийг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.', EN: 'Are you sure you want to delete this vehicle? This action cannot be undone.', CN: '确认要删除此车辆吗？此操作无法撤销。' },
  'vehicles.noVehicles': { MN: 'Бүртгэлтэй тээврийн хэрэгсэл байхгүй', EN: 'No registered vehicles', CN: '暂无车辆' },
  'vehicles.addFirstDesc': { MN: 'Эхний тээврийн хэрэгслээ нэмж хяналт эхлүүлнэ үү', EN: 'Add your first vehicle to start tracking', CN: '添加第一辆车并开始跟踪' },
  'vehicles.add': { MN: 'Тээврийн хэрэгсэл нэмэх', EN: 'Add vehicle', CN: '添加车辆' },

  // COMPANIES
  'companies.title': { MN: 'Компаниуд', EN: 'Companies', CN: '公司' },
  'companies.subtitle': { MN: 'Бүртгэлтэй компаниудын удирдлага', EN: 'Registered company management', CN: '已注册公司管理' },
  'companies.new': { MN: 'Шинэ компани', EN: 'New company', CN: '新建公司' },
  'companies.createSuccess': { MN: 'Компани амжилттай үүсгэлээ!', EN: 'Company created successfully!', CN: '公司创建成功！' },
  'companies.createFailed': { MN: 'Компани үүсгэх амжилтгүй боллоо', EN: 'Failed to create company', CN: '创建公司失败' },
  'companies.adminCreateSuccess': { MN: 'Харилцагчийн админ хэрэглэгч амжилттай үүсгэлээ!', EN: 'Customer admin created successfully!', CN: '客户管理员创建成功！' },
  'companies.userCreateFailed': { MN: 'Хэрэглэгч үүсгэх амжилтгүй боллоо', EN: 'Failed to create user', CN: '创建用户失败' },
  'companies.updateSuccess': { MN: 'Компани амжилттай шинэчлэгдлээ!', EN: 'Company updated successfully!', CN: '公司更新成功！' },
  'companies.updateFailed': { MN: 'Компани шинэчлэх амжилтгүй боллоо', EN: 'Failed to update company', CN: '更新公司失败' },
  'companies.deleteSuccess': { MN: 'Компани амжилттай устгагдлаа!', EN: 'Company deleted successfully!', CN: '公司删除成功！' },
  'companies.deleteFailed': { MN: 'Компани устгах амжилтгүй боллоо', EN: 'Failed to delete company', CN: '删除公司失败' },
  'companies.fetchFailed': { MN: 'Компанийн мэдээлэл татах амжилтгүй боллоо', EN: 'Failed to fetch company info', CN: '获取公司信息失败' },
  'companies.deleteConfirm': { MN: 'устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.', EN: 'Are you sure you want to delete? This action cannot be undone.', CN: '确认要删除吗？此操作无法撤销。' },
  'companies.accessDenied': { MN: 'Хандах эрхгүй', EN: 'Access denied', CN: '无权访问' },
  'companies.adminRequired': { MN: 'Админ эрх шаардлагатай', EN: 'Admin access required', CN: '需要管理员权限' },
  'companies.noCompanies': { MN: 'Компани байхгүй байна', EN: 'No companies available', CN: '暂无公司' },
  'companies.createFirst': { MN: 'Эхний компаниа үүсгэнэ үү', EN: 'Create your first company', CN: '创建第一家公司' },
  'companies.create': { MN: 'Компани үүсгэх', EN: 'Create company', CN: '创建公司' },

  // USERS
  'users.title': { MN: 'Хэрэглэгч удирдлага', EN: 'User management', CN: '用户管理' },
  'users.subtitle': { MN: 'Системийн хэрэглэгч болон эрх удирдлага', EN: 'System user & permissions management', CN: '系统用户与权限管理' },
  'users.create': { MN: 'Хэрэглэгч үүсгэх', EN: 'Create user', CN: '创建用户' },
  'users.loadFailed': { MN: 'Хэрэглэгчдийг татах амжилтгүй боллоо', EN: 'Failed to load users', CN: '加载用户失败' },
  'users.createSuccess': { MN: 'Хэрэглэгч амжилттай үүсгэлээ!', EN: 'User created successfully!', CN: '用户创建成功！' },
  'users.createFailed': { MN: 'Хэрэглэгч үүсгэх амжилтгүй боллоо', EN: 'Failed to create user', CN: '创建用户失败' },
  'users.updateWithPasswordSuccess': { MN: 'Хэрэглэгч болон нууц үг амжилттай шинэчлэгдлээ!', EN: 'User & password updated successfully!', CN: '用户及密码更新成功！' },
  'users.updateSuccess': { MN: 'Хэрэглэгч амжилттай шинэчлэгдлээ!', EN: 'User updated successfully!', CN: '用户更新成功！' },
  'users.updateFailed': { MN: 'Хэрэглэгч шинэчлэх амжилтгүй боллоо', EN: 'Failed to update user', CN: '更新用户失败' },
  'users.deleteSuccess': { MN: 'Хэрэглэгч амжилттай устгагдлаа!', EN: 'User deleted successfully!', CN: '用户已成功删除！' },
  'users.deleteFailed': { MN: 'Хэрэглэгч устгах амжилтгүй боллоо', EN: 'Failed to delete user', CN: '删除用户失败' },
  'users.deleteConfirm': { MN: 'хэрэглэгчийг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.', EN: 'Are you sure you want to delete this user? This action cannot be undone.', CN: '确认要删除此用户吗？此操作无法撤销。' },
  'users.accessDenied': { MN: 'Хандах эрхгүй. Админ эрх шаардлагатай.', EN: 'Access denied. Admin required.', CN: '无权访问，需要管理员权限。' },

  // FORM LABELS
  'form.orderCode': { MN: 'Захиалгын код', EN: 'Order code', CN: '订单编号' },
  'form.departurePoint': { MN: 'Гарах цэг', EN: 'Departure point', CN: '出发点' },
  'form.departureLocation': { MN: 'Гарах газар', EN: 'Departure location', CN: '出发地' },
  'form.destinationPoint': { MN: 'Очих цэг', EN: 'Destination point', CN: '目的地点' },
  'form.destinationLocation': { MN: 'Очих газар', EN: 'Destination location', CN: '目的地' },
  'form.vehicle': { MN: 'Тээврийн хэрэгсэл', EN: 'Vehicle', CN: '运输车辆' },
  'form.company': { MN: 'Компани', EN: 'Company', CN: '公司' },
  'form.select': { MN: 'Сонгох', EN: 'Select', CN: '选择' },
  'form.notConnected': { MN: 'Холбогдоогүй', EN: 'Not connected', CN: '未连接' },
  'form.create': { MN: 'Үүсгэх', EN: 'Create', CN: '创建' },
  'form.save': { MN: 'Хадгалах', EN: 'Save', CN: '保存' },
  'form.cancel': { MN: 'Цуцлах', EN: 'Cancel', CN: '取消' },
  'form.edit': { MN: 'Засах', EN: 'Edit', CN: '编辑' },
  'form.delete': { MN: 'Устгах', EN: 'Delete', CN: '删除' },
  'form.close': { MN: 'Хаах', EN: 'Close', CN: '关闭' },
  'form.licensePlate': { MN: 'Улсын дугаар', EN: 'License plate', CN: '车牌号' },
  'form.driverName': { MN: 'Жолоочийн нэр', EN: 'Driver name', CN: '司机姓名' },
  'form.driverPhone': { MN: 'Жолоочийн утас', EN: 'Driver phone', CN: '司机电话' },
  'form.gpsDevice': { MN: 'GPS төхөөрөмж', EN: 'GPS device', CN: 'GPS设备' },
  'form.deviceId': { MN: 'Төхөөрөмжийн ID', EN: 'Device ID', CN: '设备ID' },
  'form.companyName': { MN: 'Компанийн нэр', EN: 'Company name', CN: '公司名称' },
  'form.email': { MN: 'Имэйл', EN: 'Email', CN: '电子邮箱' },
  'form.name': { MN: 'Нэр', EN: 'Name', CN: '姓名' },
  'form.password': { MN: 'Нууц үг', EN: 'Password', CN: '密码' },
  'form.role': { MN: 'Эрх', EN: 'Role', CN: '权限' },
  'form.description': { MN: 'Тайлбар', EN: 'Description', CN: '备注' },
  'form.updateStatus': { MN: 'Статус шинэчлэх', EN: 'Update status', CN: '更新状态' },

  // ORDER STATUS
  'status.pending': { MN: 'Хүлээгдэж байна', EN: 'Pending', CN: '等待中' },
  'status.loading': { MN: 'Ачилт хийгдэж байна', EN: 'Loading', CN: '装货中' },
  'status.transferLoading': { MN: 'Шилжүүлэн ачилт', EN: 'Transshipment', CN: '转运中' },
  'status.cnExportCustoms': { MN: 'Хятад экспортын гааль', EN: 'CN export customs', CN: '中国出口清关' },
  'status.mnImportCustoms': { MN: 'Монгол импортын гааль', EN: 'MN import customs', CN: '蒙古进口清关' },
  'status.inTransit': { MN: 'Тээвэрлэгдэж байна', EN: 'In transit', CN: '运输中' },
  'status.arrived': { MN: 'Хүрэлцэн ирсэн', EN: 'Arrived', CN: '已到达' },
  'status.unloaded': { MN: 'Буулгасан', EN: 'Unloaded', CN: '已卸货' },
  'status.returnTrip': { MN: 'Буцах аялал', EN: 'Return trip', CN: '回程运输' },
  'status.mnExportReturn': { MN: 'Монгол экспорт буцалт', EN: 'MN export return', CN: '蒙古出口回程' },
  'status.cnImportReturn': { MN: 'Хятад импорт буцалт', EN: 'CN import return', CN: '中国进口回程' },
  'status.transfer': { MN: 'Шилжүүлэлт', EN: 'Transfer', CN: '转交' },
  'status.completed': { MN: 'Дууссан', EN: 'Completed', CN: '已完成' },
  'status.cancelled': { MN: 'Цуцлагдсан', EN: 'Cancelled', CN: '已取消' },

  // BUTTONS
  'btn.new': { MN: 'Шинэ', EN: 'New', CN: '新建' },
  'btn.add': { MN: 'Нэмэх', EN: 'Add', CN: '添加' },
  'btn.addUser': { MN: 'Хэрэглэгч нэмэх', EN: 'Add user', CN: '添加用户' },
  'btn.details': { MN: 'Дэлгэрэнгүй', EN: 'Details', CN: '详情' },
  'btn.edit': { MN: 'Засварлах', EN: 'Edit', CN: '编辑' },
  'btn.delete': { MN: 'Устгах', EN: 'Delete', CN: '删除' },
  'btn.download': { MN: 'Татах', EN: 'Download', CN: '下载' },
  'btn.search': { MN: 'Хайх', EN: 'Search', CN: '搜索' },
  'btn.filter': { MN: 'Шүүх', EN: 'Filter', CN: '筛选' },
  'btn.all': { MN: 'Бүгд', EN: 'All', CN: '全部' },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>('MN');

  // Load saved language from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('language') as Language;
      if (savedLang && ['MN', 'EN', 'CN'].includes(savedLang)) {
        setLangState(savedLang);
      }
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', newLang);
    }
  };

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    return translation[lang] || translation['EN'] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
