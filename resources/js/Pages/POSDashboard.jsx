import React, { useState, useEffect } from 'react';
import { 
  ChevronRight,
  ChevronDown,
  LayoutDashboard, 
  Radio, 
  Package, 
  Truck, 
  Users, 
  BarChart3, 
  Settings, 
  Bell, 
  Search, 
  Plus, 
  ShoppingBag,
  MoreVertical,
  Edit,
  Trash2,
  Calendar,
  User,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Filter,
  Sparkles,
  Loader2,
  MessageCircle,
  ShoppingCart,
  CreditCard,
  Store,
  PlusCircle,
  UserPlus,
  XCircle,
  BookOpen,
  Bike,
  Boxes,
  X,
  Check,
  BellRing,
  Wallet,
  Printer,
  FileSpreadsheet,
  History,
  MinusCircle
} from 'lucide-react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import axios from 'axios';
import Swal from 'sweetalert2';
import AccountingReports from './Reports/AccountingReports';
import SettingsIndex from './Settings/Index';

export default function POSDashboard({ auth, products, categories, suppliers, customers = [], deliveries = [], analytics = {}, settings = {}, users = [] }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [posInitialAction, setPosInitialAction] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = auth?.user?.unread_notifications_count || 0;
  const notifications = auth?.user?.notifications || [];

  const handleMarkAsRead = async (id) => {
    try {
      await axios.post(route('notifications.markAsRead', id));
      router.reload({ preserveScroll: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axios.post(route('notifications.markAllAsRead'));
      router.reload({ preserveScroll: true });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      <Head title="VariedadesPOS" />
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-800 mb-4">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-indigo-500/30">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">Variedades<span className="text-indigo-400">POS</span></span>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <NavItem id="dashboard" label="Dashboard" icon={<LayoutDashboard size={20} />} activeTab={activeTab} setActiveTab={setActiveTab} />
          
          <div className="mt-6 mb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Operación</div>
          <NavItem id="live" label="Modo Live" icon={<Radio size={20} />} activeTab={activeTab} setActiveTab={setActiveTab} badge="EN VIVO" />
          <NavItem id="pos" label="Nueva Venta (Post-Live)" icon={<ShoppingCart size={20} />} activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavItem id="pedidos" label="Logística y Envíos" icon={<Truck size={20} />} activeTab={activeTab} setActiveTab={setActiveTab} badge={deliveries.length > 0 ? deliveries.length : null} />
          <NavItem id="inventario" label="Inventario" icon={<Package size={20} />} activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavExternalLink href={route('cash-register.index')} label="Control de Caja" icon={<Wallet size={20} />} />
          <NavExternalLink href={route('logistics.driver.index')} label="Módulo Motoristas" icon={<Bike size={20} />} />
          
          <div className="mt-6 mb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Administración</div>
          <NavItem id="clientes" label="Directorio de Clientes" icon={<Users size={20} />} activeTab={activeTab} setActiveTab={setActiveTab} />
          <NavItem id="proveedores" label="Proveedores" icon={<Store size={20} />} activeTab={activeTab} setActiveTab={setActiveTab} />
          
          {(auth?.user?.role === 'admin' || !auth?.user) && (
            <>
              <NavItem id="reportes" label="Reportes" icon={<BarChart3 size={20} />} activeTab={activeTab} setActiveTab={setActiveTab} />
              <NavItem id="contabilidad" label="Libros Contables" icon={<BookOpen size={20} />} activeTab={activeTab} setActiveTab={setActiveTab} />
              <NavItem id="gastos" label="Control de Gastos" icon={<CreditCard size={20} />} activeTab={activeTab} setActiveTab={setActiveTab} />
              <NavItem id="configuracion" label="Configuración" icon={<Settings size={20} />} activeTab={activeTab} setActiveTab={setActiveTab} />
            </>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center space-x-3 cursor-pointer hover:bg-slate-800 p-2 rounded-lg transition-colors">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white text-xs">
              {auth?.user ? auth.user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'AD'}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{auth?.user ? auth.user.name : 'Admin Principal'}</p>
              <p className="text-xs text-slate-400 capitalize">{auth?.user ? auth.user.role : 'Administrador'} - Sucursal Central</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* TOP BAR */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 z-10">
          <div className="flex items-center text-slate-500">
            <h1 className="text-xl font-bold text-slate-800 capitalize">
              {activeTab === 'live' ? 'Modo de Transmisión (Live)' : activeTab.replace('-', ' ')}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNotifications(!showNotifications);
                }}
                className={`relative p-2 rounded-full transition-all ${showNotifications ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-100'}`}
              >
                {unreadCount > 0 ? <BellRing className="w-5 h-5 animate-pulse" /> : <Bell className="w-5 h-5" />}
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* DROPDOWN DE NOTIFICACIONES */}
              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                      <h3 className="font-bold text-slate-800 text-sm">Notificaciones</h3>
                      {unreadCount > 0 && (
                        <button 
                          onClick={handleMarkAllAsRead}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          Marcar todo como leído
                        </button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">
                          <Bell className="w-8 h-8 opacity-20 mx-auto mb-2" />
                          <p className="text-xs">No tienes notificaciones</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-50">
                          {notifications.map((n) => {
                            const isUnread = !n.read_at;
                            const type = n.data?.type;
                            const colorClass = type === 'return' ? 'bg-red-50 text-red-600' : 
                                               type === 'stock' ? 'bg-amber-50 text-amber-600' : 
                                               'bg-indigo-50 text-indigo-600';
                            const icon = type === 'return' ? <XCircle className="w-4 h-4" /> :
                                         type === 'stock' ? <Package className="w-4 h-4" /> :
                                         <Bell className="w-4 h-4" />;

                            return (
                              <div key={n.id} className={`p-4 flex items-start space-x-3 hover:bg-slate-50 transition-colors ${isUnread ? 'bg-indigo-50/30' : ''}`}>
                                <div className={`p-2 rounded-lg shrink-0 ${colorClass}`}>
                                  {icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-xs leading-snug ${isUnread ? 'font-bold text-slate-900' : 'text-slate-600'}`}>
                                    {n.data?.message}
                                  </p>
                                  <p className="text-[10px] text-slate-400 mt-1">
                                    {new Date(n.created_at).toLocaleString()}
                                  </p>
                                </div>
                                {isUnread && (
                                  <button 
                                    onClick={() => handleMarkAsRead(n.id)}
                                    className="p-1 text-slate-300 hover:text-indigo-600 transition-colors"
                                    title="Marcar como leída"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex flex-col items-center space-y-2">
                        {unreadCount > 0 && (
                          <button 
                            onClick={handleMarkAllAsRead}
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-bold"
                          >
                            Marcar todas como leídas
                          </button>
                        )}
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Mostrando últimas {notifications.length}</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            {activeTab !== 'live' && (
              <button 
                onClick={() => setActiveTab('live')}
                className="flex items-center px-4 py-2 bg-red-50 text-red-600 font-medium rounded-full hover:bg-red-100 transition-colors border border-red-200"
              >
                <Radio className="w-4 h-4 mr-2" />
                Iniciar Live
              </button>
            )}
          </div>
        </header>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === 'dashboard' && <Dsh_DashboardView products={products} analytics={analytics} />}
          {activeTab === 'live' && <LiveView products={products} />}
          {activeTab === 'pos' && <POSView products={products} initialAction={posInitialAction} setInitialAction={setPosInitialAction} />}
          {activeTab === 'inventario' && <InventoryView products={products} categories={categories} suppliers={suppliers} />}
          {activeTab === 'pedidos' && <OrdersView deliveries={deliveries} setActiveTab={setActiveTab} setPosInitialAction={setPosInitialAction} />}
          {activeTab === 'clientes' && <CustomersView customers={customers} />}
          {activeTab === 'proveedores' && <SuppliersView suppliers={suppliers} />}
          {activeTab === 'reportes' && <ReportsView />}
          {activeTab === 'contabilidad' && <AccountingReports />}
          {activeTab === 'gastos' && <ExpensesView />}
          {activeTab === 'configuracion' && <SettingsIndex settings={settings} users={users} />}
        </div>
      </main>

    </div>
  );
}

/* =========================================
   COMPONENTES DE LAS VISTAS (TABS)
   ========================================= */

// 1. DASHBOARD VIEW
// 1. DASHBOARD VIEW
function Dsh_DashboardView({ products = [], analytics = {} }) {
  // Sumar stock y reserva de todas las variantes de todos los productos
  let totalStock = 0;
  let totalReserved = 0;
  
  if (Array.isArray(products)) {
    products.forEach(p => {
      if (p.variants && Array.isArray(p.variants)) {
        p.variants.forEach(v => {
          totalStock += Number(v.stock) || 0;
          totalReserved += Number(v.reserved) || 0;
        });
      }
    });
  }

  const lowStockCount = Array.isArray(products) 
    ? products.filter(p => (p.variants || []).some(v => Number(v.stock) > 0 && Number(v.stock) <= 5)).length 
    : 0;

  const salesToday = Number(analytics?.salesToday) || 0;
  const weeklyPerformance = Array.isArray(analytics?.weeklyPerformance) ? analytics.weeklyPerformance : [];
  const recentActivity = Array.isArray(analytics?.recentActivity) ? analytics.recentActivity : [];

  // Encontrar el valor máximo para escalar el gráfico
  const maxAmount = Math.max(...weeklyPerformance.map(p => Number(p.amount) || 0), 1);

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Dsh_StatCard title="Ventas Hoy (Live + Tienda)" amount={`Q ${salesToday.toFixed(2)}`} trend="0%" isPositive={true} icon={<BarChart3 />} color="indigo" />
        <Dsh_StatCard title="Total SKU en Inventario" amount={products.length} subtitle={`${totalStock} unidades físicas`} icon={<Package />} color="blue" />
        <Dsh_StatCard title="Productos Apartados" amount={totalReserved} subtitle="Esperando confirmación" icon={<ShoppingBag />} color="amber" />
        <Dsh_StatCard title="Alertas Stock Bajo" amount={lowStockCount} subtitle="Requieren reabastecimiento" icon={<Bell />} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800">Rendimiento Semanal</h2>
            <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-sm outline-none">
              <option>Esta semana</option>
              <option>Mes pasado</option>
            </select>
          </div>
          <div className="h-64 flex items-end justify-between space-x-2 pb-6">
            {weeklyPerformance.map((dayData, i) => {
              const amount = Number(dayData.amount) || 0;
              const height = (amount / maxAmount) * 100;
              return (
                <div key={i} className="w-full flex flex-col items-center justify-end group">
                  <div className="w-full bg-slate-100 rounded-t-md relative group-hover:bg-indigo-50 transition-colors" style={{ height: `100%` }}>
                    <div className="absolute bottom-0 w-full bg-indigo-500 rounded-t-md shadow-sm transition-all duration-500" style={{ height: `${height}%` }}>
                       {amount > 0 && (
                         <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                           Q {amount.toFixed(0)}
                         </div>
                       )}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-tighter">{dayData.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actividad Reciente */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Actividad Reciente</h2>
          <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
            {recentActivity.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 py-12">
                <Clock className="w-12 h-12 mb-2 opacity-20" />
                <p className="text-sm">Sin actividad reciente</p>
              </div>
            )}
            {recentActivity.map((activity) => (
              <Dsh_ActivityItem 
                key={activity.id}
                text={activity.text} 
                time={activity.time} 
                iconName={activity.icon}
                color={activity.color}
              />
            ))}
          </div>
          <button className="w-full mt-6 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            Ver todo el historial
          </button>
        </div>
      </div>
    </div>
  );
}

function Dsh_ActivityItem({ text, time, iconName, color }) {
  const Icon = iconName === 'ShoppingBag' ? ShoppingBag : (iconName === 'CheckCircle2' ? CheckCircle2 : Clock);
  const colorClass = color === 'indigo' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600';

  return (
    <div className="flex items-start space-x-3 group">
      <div className={`p-2 rounded-lg shrink-0 ${colorClass}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-700 leading-snug group-hover:text-slate-900 transition-colors">{text}</p>
        <p className="text-xs text-slate-400 mt-0.5">{time}</p>
      </div>
    </div>
  );
}

function Dsh_StatCard({ title, amount, subtitle, trend, isPositive, icon, color }) {
  const colorClasses = {
    indigo: 'bg-indigo-100 text-indigo-600',
    amber: 'bg-amber-100 text-amber-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    blue: 'bg-blue-100 text-blue-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${colorClasses[color] || 'bg-slate-100 text-slate-600'}`}>
          {icon}
        </div>
        {trend && (
          <span className={`flex items-center text-sm font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
            {isPositive ? <ArrowUpRight className="w-4 h-4 mr-1" /> : null}
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-slate-800">{amount}</p>
      {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
}

// 2. MODO LIVE VIEW (Adaptado del diseño anterior)
function LiveView({ products }) {
  const [bags, setBags] = useState([]);
  const [isLoadingBags, setIsLoadingBags] = useState(true);

  // Load bags from API
  useEffect(() => {
    const loadBags = async () => {
      try {
        const response = await axios.get(route('live.bags'));
        setBags(response.data);
      } catch (error) {
        console.error("Error loading bags:", error);
      } finally {
        setIsLoadingBags(false);
      }
    };
    loadBags();
  }, []);

  // Estados para el formulario
  const [username, setUsername] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToBag, setIsAddingToBag] = useState(false);
  
  // Estados para Gemini AI
  const [rawComment, setRawComment] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Estados para modales y checkout
  const [viewingBag, setViewingBag] = useState(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutBag, setCheckoutBag] = useState(null);
  const [checkoutData, setCheckoutData] = useState({
    customer_name: '',
    customer_phone: '',
    shipping_address: '',
    shipping_cost: 0,
    payment_status: 'Pago Contra Entrega'
  });
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [cancellingIds, setCancellingIds] = useState([]);

  // Historial de artículos liberados
  const [cancelledItems, setCancelledItems] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState('active'); // 'active' o 'history'

  const loadCancelledItemsHistory = async (saleId) => {
    if (!saleId) return;
    setIsLoadingHistory(true);
    try {
      const response = await axios.get(route('live.cancelledItems', saleId));
      setCancelledItems(response.data);
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (viewingBag) {
      loadCancelledItemsHistory(viewingBag.id);
      setActiveModalTab('active');
    }
  }, [viewingBag?.id]);

  const handleOpenCheckout = (bag) => {
    setCheckoutBag(bag);
    setCheckoutData({
      customer_name: '',
      customer_phone: '',
      shipping_address: '',
      shipping_cost: 0,
      payment_status: 'Pago Contra Entrega'
    });
    setIsCheckoutModalOpen(true);
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setIsProcessingCheckout(true);
    
    try {
      const response = await axios.post(route('live.checkout', checkoutBag.id), checkoutData);
      
      if (response.status === 200) {
        setIsCheckoutModalOpen(false);
        setBags(bags.filter(b => b.id !== checkoutBag.id));
        alert("¡Venta agendada con éxito! La encontrarás en el panel de Logística.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert(error.response?.data?.error || "Error al procesar el checkout");
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  // Función para llamar a Gemini API vía Backend
  const handleAnalyzeComment = async () => {
    if (!rawComment) return;
    setIsAnalyzing(true);

    try {
      const response = await axios.post(route('live.processAI'), { text: rawComment });
      const result = response.data;
      
      if (result.usuario || result.producto) {
        if (result.usuario) setUsername(result.usuario);
        
        const query = `${result.producto || ''} ${result.variante || ''}`.trim();
        setSearchQuery(query);
        setQuantity(parseInt(result.cantidad) || 1);
        
        // Intentar auto-seleccionar la mejor coincidencia BUSCANDO EN TODOS LOS PRODUCTOS
        if (query.length > 1) {
            const queryLower = query.toLowerCase();
            
            // Generar lista local de variantes disponibles para búsqueda inmediata
            const allAvailableVariants = products.flatMap(p => 
                (p.variants || [])
                  .filter(v => v.stock > 0)
                  .map(v => ({
                    ...v,
                    product_name: p.name,
                    search_text: `${p.name} ${v.size || ''} ${v.color || ''} ${v.sku}`.toLowerCase()
                  }))
            );

            // Buscar coincidencia exacta o parcial
            const match = allAvailableVariants.find(v => 
                v.search_text.includes(queryLower) || 
                queryLower.includes(v.product_name.toLowerCase())
            ) || allAvailableVariants.find(v => 
                queryLower.split(' ').some(word => word.length > 2 && v.search_text.includes(word))
            );
            
            if (match) {
                setSelectedVariant(match);
                setSearchQuery(`${match.product_name} - ${match.size || ''} ${match.color || ''}`);
            }
        }
        
        setRawComment(''); // Limpiar el comentario tras éxito
      }
    } catch (error) {
      console.error("Error analizando con Gemini:", error);
      alert("Hubo un error al analizar el comentario con IA.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddToBag = async (e) => {
    if (e) e.preventDefault();
    if(!username || !selectedVariant) return;
    setIsAddingToBag(true);
    
    try {
      const response = await axios.post(route('live.addItem'), {
        social_handle: username,
        variant_id: selectedVariant.id,
        quantity: quantity
      });
      
      if (response.status === 200) {
        const data = response.data;
        // Limpiar inputs (se mantiene el usuario por si desea seguir agregando)
        setSearchQuery('');
        setSelectedVariant(null);
        setQuantity(1);
        
        // Actualizar lista de bolsas
        const updatedBags = bags.map(b => b.id === data.bag.id ? data.bag : b);
        if (!bags.find(b => b.id === data.bag.id)) {
          setBags([data.bag, ...bags]);
        } else {
          setBags(updatedBags);
        }
      }
    } catch (error) {
      console.error("Error adding to bag:", error);
      alert(error.response?.data?.error || "Error al agregar a la bolsa");
    } finally {
      setIsAddingToBag(false);
    }
  };

  const handleRemoveItem = async (item) => {
    const result = await Swal.fire({
      title: `¡Atención ${viewingBag?.social_handle || username}!`,
      text: "¿Deseas liberar este artículo? Se devolverá al inventario disponible para otro cliente.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#10b981', 
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Sí, liberar',
      cancelButtonText: 'No, cancelar',
      reverseButtons: true
    });
    
    if (result.isConfirmed) {
      try {
        const response = await axios.post(route('live.cancelItem'), { detail_id: item.id });
        
        if (response.status === 200) {
          const data = response.data;
          
          // Actualizar localmente la bolsa activa
          const updatedBag = {
            ...viewingBag,
            details: viewingBag.details.filter(d => d.id !== item.id),
            total: data.new_total
          };

          if (updatedBag.details.length === 0) {
            setBags(bags.filter(b => b.id !== updatedBag.id));
            // No cerramos el modal, para que se vea el historial
            setViewingBag(updatedBag);
          } else {
            setBags(bags.map(b => b.id === updatedBag.id ? updatedBag : b));
            setViewingBag(updatedBag);
          }

          // Refrescar historial
          loadCancelledItemsHistory(viewingBag.id);

          Swal.fire({
            title: '¡Artículo Liberado!',
            text: 'Se ha actualizado el inventario y el historial.',
            icon: 'success',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
          });
        }
      } catch (error) {
        console.error("Error removing item:", error);
        Swal.fire('Error', error.response?.data?.error || "Error al eliminar el artículo", 'error');
      }
    }
  };

  const handleCancelBag = async (saleId) => {
    if(!confirm("¿Deseas CANCELAR esta bolsa por completo? Todos los artículos volverán al inventario.")) return;
    
    setCancellingIds(prev => [...prev, saleId]);
    
    try {
      const response = await axios.post(route('live.cancelBag', saleId));
      if (response.status === 200) {
        setTimeout(() => {
          setBags(bags.filter(b => b.id !== saleId));
          setViewingBag(null);
          setCancellingIds(prev => prev.filter(id => id !== saleId));
        }, 500);
      }
    } catch (error) {
      setCancellingIds(prev => prev.filter(id => id !== saleId));
      console.error("Error cancelling bag:", error);
      alert(error.response?.data?.error || "Error al cancelar la bolsa");
    }
  };

  // Filtrado de variantes para el autocomplete
  const filteredVariants = products.flatMap(p => 
    (p.variants || [])
      .filter(v => v.stock > 0)
      .map(v => ({
        ...v,
        product_name: p.name,
        search_text: `${p.name} ${v.size || ''} ${v.color || ''} ${v.sku}`.toLowerCase()
      }))
  ).filter(v => v.search_text.includes(searchQuery.toLowerCase())).slice(0, 10);

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <div className="relative flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
          </div>
          <h2 className="text-xl font-bold text-slate-800">Transmisión Activa - Ropa de Verano</h2>
        </div>
        <div className="text-slate-500 font-medium font-mono text-lg bg-white px-4 py-1 rounded-lg border border-slate-200 shadow-sm">
          01:45:22
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Panel Captura (Izquierda) */}
        <div className="lg:col-span-4 bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col overflow-y-auto">
          
          {/* SECCIÓN GEMINI AI */}
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 mb-6 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 text-indigo-100 opacity-50">
              <Sparkles className="w-24 h-24" />
            </div>
            <h3 className="font-bold text-indigo-800 mb-2 flex items-center relative z-10">
              <Sparkles className="w-4 h-4 mr-2 text-indigo-500" /> IA Lectura Rápida
            </h3>
            <p className="text-xs text-indigo-600/80 mb-3 relative z-10">Pega el comentario enredado del cliente y la IA extraerá los datos.</p>
            <div className="relative z-10">
              <textarea 
                value={rawComment}
                onChange={(e) => setRawComment(e.target.value)}
                placeholder="Ej. 'Mío blusa roja talla m soy lorenita_22'" 
                className="w-full text-sm border border-indigo-200 rounded-lg p-2 bg-white focus:ring-2 focus:ring-indigo-300 outline-none resize-none h-20"
              />
              <button 
                onClick={handleAnalyzeComment}
                disabled={isAnalyzing || !rawComment}
                className="mt-2 w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-sm font-bold py-2 rounded-lg transition-colors flex items-center justify-center"
              >
                {isAnalyzing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                {isAnalyzing ? 'Analizando...' : 'Autocompletar Datos'}
              </button>
            </div>
          </div>

          <div className="h-px bg-slate-200 w-full mb-6"></div>

          <h3 className="font-bold text-slate-700 mb-4 flex items-center">
            <Plus className="w-5 h-5 mr-2 text-indigo-500" /> Datos de Asignación
          </h3>
          <div className="space-y-4 flex-1 relative">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Usuario (@)</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ej. sofia_lopez" 
                className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none transition-all" 
              />
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-slate-600 mb-1">Producto / Variante</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (selectedVariant) setSelectedVariant(null);
                  }}
                  placeholder="Buscar producto, talla o color..." 
                  className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none transition-all" 
                />
                {searchQuery.length > 1 && !selectedVariant && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                    {filteredVariants.length > 0 ? (
                      filteredVariants.map(v => (
                        <div 
                          key={v.id} 
                          onClick={() => {
                            setSelectedVariant(v);
                            setSearchQuery(`${v.product_name} - ${v.size || ''} ${v.color || ''}`);
                          }}
                          className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0"
                        >
                          <p className="font-bold text-slate-800">{v.product_name}</p>
                          <div className="flex justify-between text-xs text-slate-500">
                            <span>{v.size || 'N/A'} / {v.color || 'N/A'} ({v.sku})</span>
                            <span className="font-bold text-indigo-600">Stock: {v.stock} | Q {v.selling_price}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-slate-400 text-sm">No se encontraron variantes con stock.</div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Precio (Q)</label>
                <div className="w-full border border-slate-200 rounded-lg p-3 bg-slate-100 text-lg font-bold text-indigo-700 h-[50px] flex items-center">
                  {selectedVariant ? `Q ${parseFloat(selectedVariant.selling_price).toFixed(2)}` : '0.00'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Cantidad</label>
                <input 
                  type="number" 
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none transition-all text-lg font-bold" 
                />
              </div>
            </div>

            <button 
              onClick={handleAddToBag}
              disabled={isAddingToBag || !username || !selectedVariant}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 text-white font-bold py-3 rounded-lg shadow-md transition-colors mt-4 flex items-center justify-center"
            >
              {isAddingToBag ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <ShoppingBag className="w-5 h-5 mr-2" />}
              Guardar en Bolsa
            </button>
          </div>
        </div>

        {/* Panel Consolidación (Derecha) */}
        <div className="lg:col-span-8 bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-700 flex items-center">
              <Package className="w-5 h-5 mr-2 text-indigo-500" /> Bolsas del Live Actual
            </h3>
            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold shadow-sm">
              {isLoadingBags ? 'Cargando...' : `${bags.length} Activas`}
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {!isLoadingBags && bags.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 py-12">
                <ShoppingBag className="w-16 h-16 mb-4 opacity-20" />
                <p className="font-medium text-slate-400">No hay bolsas activas aún</p>
              </div>
            )}
            {!isLoadingBags && bags.map(bag => (
              <div key={bag.id} className={`group border border-slate-200 rounded-xl p-4 flex items-center justify-between transition-all bg-slate-50/50 hover:bg-white hover:border-indigo-400 hover:shadow-md ${cancellingIds.includes(bag.id) ? 'opacity-0 scale-95 pointer-events-none' : ''}`}>
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-full text-white shadow-indigo-200 shadow-lg group-hover:scale-110 transition-transform">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg flex items-center">
                      @{bag.social_handle}
                      <span className="ml-2 w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    </h4>
                    <p className="text-sm text-slate-500 font-medium">
                      <span className="text-indigo-600 font-bold">{bag.details?.length || 0}</span> artículos apartados
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Total a cobrar</p>
                    <p className="text-xl font-black text-indigo-700">Q {parseFloat(bag.total).toFixed(2)}</p>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <button 
                      onClick={() => handleOpenCheckout(bag)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg text-sm font-bold flex items-center justify-center shadow-lg shadow-emerald-200 transition-all hover:-translate-y-0.5"
                    >
                      <Calendar className="w-4 h-4 mr-2" /> Agendar
                    </button>
                    <button 
                      onClick={() => setViewingBag(bag)}
                      className="bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 text-slate-600 px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-sm"
                    >
                      Ver detalle
                    </button>
                    <button 
                      onClick={() => handleCancelBag(bag.id)}
                      className="text-red-400 hover:text-red-600 text-xs font-bold pt-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <XCircle className="w-3 h-3 mr-1" /> Cancelar Bolsa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL DETALLE DE BOLSA */}
      {viewingBag && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-lg">Bolsa de @{viewingBag.social_handle}</h3>
              <button onClick={() => setViewingBag(null)} className="text-slate-400 hover:text-slate-600"><Plus className="w-6 h-6 rotate-45" /></button>
            </div>

            {/* Pestañas del Modal */}
            <div className="flex border-b border-slate-100 bg-white">
              <button 
                onClick={() => setActiveModalTab('active')}
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all ${activeModalTab === 'active' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                Artículos Activos ({viewingBag.details.length})
              </button>
              <button 
                onClick={() => setActiveModalTab('history')}
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all ${activeModalTab === 'history' ? 'border-amber-500 text-amber-600 bg-amber-50/30' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                🛍️ Historial de Liberados ({cancelledItems.length})
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[50vh]">
              {activeModalTab === 'active' ? (
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-xs font-bold text-slate-400 uppercase border-b border-slate-100">
                      <th className="pb-2">Producto</th>
                      <th className="pb-2 text-center">Cant.</th>
                      <th className="pb-2 text-right">Precio</th>
                      <th className="pb-2 text-right">Subtotal</th>
                      <th className="pb-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {viewingBag.details.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-slate-400 text-sm">No hay artículos activos.</td>
                      </tr>
                    ) : (
                      viewingBag.details.map(item => (
                        <tr key={item.id} className="text-sm">
                          <td className="py-3">
                            <p className="font-bold text-slate-800">{item.product_variant?.product?.name}</p>
                            <p className="text-xs text-slate-500">{item.product_variant?.size} / {item.product_variant?.color}</p>
                          </td>
                          <td className="py-3 text-center font-bold">{item.quantity}</td>
                          <td className="py-3 text-right">Q {parseFloat(item.selling_price).toFixed(2)}</td>
                          <td className="py-3 text-right font-bold text-indigo-600">Q {(item.quantity * item.selling_price).toFixed(2)}</td>
                          <td className="py-3 text-right">
                            <button 
                              onClick={() => handleRemoveItem(item)}
                              className="p-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                              title="Liberar artículo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              ) : (
                <div className="space-y-4">
                  {isLoadingHistory ? (
                    <div className="py-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-500" /></div>
                  ) : cancelledItems.length === 0 ? (
                    <div className="py-12 text-center text-slate-400">
                      <Package className="w-12 h-12 mx-auto mb-2 opacity-10" />
                      <p className="text-sm font-medium">Aún no se han liberado artículos de esta bolsa.</p>
                    </div>
                  ) : (
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="text-xs font-bold text-slate-400 uppercase border-b border-slate-100">
                          <th className="pb-2">Cant.</th>
                          <th className="pb-2 text-center">Producto (Variante)</th>
                          <th className="pb-2 text-right">Liberado el</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {cancelledItems.map(item => (
                          <tr key={item.id} className="hover:bg-slate-50/50">
                            <td className="py-3 font-bold text-amber-600">{item.quantity}</td>
                            <td className="py-3 text-center">
                              <p className="font-medium text-slate-700">{item.product_variant?.product?.name || 'Producto Eliminado'}</p>
                              <p className="text-[10px] text-slate-400">{item.product_variant?.size} / {item.product_variant?.color}</p>
                            </td>
                            <td className="py-3 text-right text-slate-500 font-mono text-xs">
                              {new Date(item.cancelled_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(item.cancelled_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Total Actual</p>
                <p className="text-2xl font-bold text-indigo-700">Q {parseFloat(viewingBag.total).toFixed(2)}</p>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={() => handleCancelBag(viewingBag.id)}
                  className="bg-red-50 text-red-600 border border-red-100 px-4 py-2 rounded-lg font-bold hover:bg-red-100 transition-colors flex items-center"
                >
                  <XCircle className="w-4 h-4 mr-2" /> Anular Bolsa
                </button>
                <button 
                  onClick={() => setViewingBag(null)}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold shadow-md hover:bg-indigo-700"
                >
                  Regresar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CHECKOUT (DATOS DE ENVÍO) */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-emerald-600 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center"><Truck className="w-5 h-5 mr-3" /> Agendar Envío (Desde Live)</h3>
              <button onClick={() => setIsCheckoutModalOpen(false)} className="text-emerald-200 hover:text-white"><Plus className="w-6 h-6 rotate-45" /></button>
            </div>
            <form onSubmit={handleCheckoutSubmit} className="p-6 space-y-4">
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-center mb-2">
                <User className="w-5 h-5 text-amber-600 mr-3" />
                <span className="text-sm font-bold text-amber-800">Cliente de Live: @{checkoutBag?.social_handle}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nombre Completo</label>
                  <input required type="text" value={checkoutData.customer_name} onChange={e => setCheckoutData({...checkoutData, customer_name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Teléfono</label>
                  <input 
                    required 
                    type="text" 
                    maxLength="8"
                    value={checkoutData.customer_phone} 
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 8) setCheckoutData({...checkoutData, customer_phone: val});
                    }} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 outline-none" 
                    placeholder="Ej. 12345678"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Dirección de Entrega</label>
                <textarea required value={checkoutData.shipping_address} onChange={e => setCheckoutData({...checkoutData, shipping_address: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 outline-none h-20" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Costo de Envío</label>
                  <input required type="number" step="0.01" value={checkoutData.shipping_cost} onChange={e => setCheckoutData({...checkoutData, shipping_cost: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Método de Pago</label>
                  <select required value={checkoutData.payment_status} onChange={e => setCheckoutData({...checkoutData, payment_status: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 outline-none">
                    <option value="Pago Contra Entrega">Pago Contra Entrega</option>
                    <option value="Pagado">Ya Pagado (Transferencia)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">Total a Cobrar</p>
                  <p className="text-xl font-bold text-indigo-700">Q {(parseFloat(checkoutBag?.total || 0) + parseFloat(checkoutData.shipping_cost || 0)).toFixed(2)}</p>
                </div>
                <button type="submit" disabled={isProcessingCheckout} className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:bg-emerald-700 flex items-center">
                  {isProcessingCheckout ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <CheckCircle2 className="w-5 h-5 mr-2" />}
                  Confirmar y Agendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// 3. INVENTARIO VIEW
function InventoryView({ products, categories, suppliers }) {
  const emptyVariant = { sku: '', size: '', color: '', reference_cost: '', margin: '', selling_price: '' };
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCategoryForCountSheet, setSelectedCategoryForCountSheet] = useState('all');
  const [expandedRows, setExpandedRows] = useState({});
  
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [selectedVariantForAdjustment, setSelectedVariantForAdjustment] = useState(null);
  const [isAdjustmentHistoryModalOpen, setIsAdjustmentHistoryModalOpen] = useState(false);
  const [adjustmentHistory, setAdjustmentHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const adjustmentForm = useForm({
    product_variant_id: '',
    type: 'addition',
    quantity: '',
    reason: ''
  });

  const toggleRow = (id) => setExpandedRows(prev => ({...prev, [id]: !prev[id]}));

  const productForm = useForm({
    name: '', description: '', category_id: '', image_url: '', variants: [{ ...emptyVariant }]
  });
  const { data, setData, post, put, processing, reset } = productForm;
  const destroy = productForm.delete;

  const openAdjustmentModal = (v, p) => {
    setSelectedVariantForAdjustment({ ...v, product_name: p.name });
    adjustmentForm.setData({
        product_variant_id: v.id,
        type: 'addition',
        quantity: '',
        reason: ''
    });
    setIsAdjustmentModalOpen(true);
  };

  const handleAdjustmentSubmit = (e) => {
    e.preventDefault();
    adjustmentForm.post(route('products.adjust-stock'), {
        onSuccess: () => {
            setIsAdjustmentModalOpen(false);
            adjustmentForm.reset();
        }
    });
  };

  const fetchAdjustmentHistory = async () => {
    setLoadingHistory(true);
    try {
        const response = await axios.get(route('api.products.adjustments'));
        setAdjustmentHistory(response.data);
        setIsAdjustmentHistoryModalOpen(true);
    } catch (error) {
        console.error("Error fetching history", error);
    } finally {
        setLoadingHistory(false);
    }
  };

  const generateRandomSKU = () => 'VAR-' + Math.random().toString(36).substr(2, 6).toUpperCase();

  const handleAddVariantRow = () => setData('variants', [...data.variants, { ...emptyVariant }]);
  const handleRemoveVariantRow = (index) => {
    const newVariants = [...data.variants]; newVariants.splice(index, 1); setData('variants', newVariants);
  };
  const updateVariantRow = (index, field, value) => {
    const newVariants = [...data.variants]; newVariants[index][field] = value; setData('variants', newVariants);
  };

  const purchaseForm = useForm({
    supplier_id: '', invoice_number: '', details: [{ product_variant_id: '', quantity: 1, unit_cost: '', margin: '', selling_price: '' }]
  });

  const handleAddPurchaseDetail = () => purchaseForm.setData('details', [...purchaseForm.data.details, { product_variant_id: '', quantity: 1, unit_cost: '', margin: '', selling_price: '' }]);
  const updatePurchaseDetail = (index, field, value) => {
    const newDetails = [...purchaseForm.data.details]; newDetails[index][field] = value; purchaseForm.setData('details', newDetails);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === '' || p.category_id === parseInt(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const allVariants = products.flatMap(p => (p.variants || []).map(v => ({...v, product_name: p.name})));

  const openAddModal = () => { setEditingProduct(null); reset(); setIsModalOpen(true); };
  const openEditModal = (product) => {
    setEditingProduct(product);
    setData({
      name: product.name, description: product.description || '', category_id: product.category_id || '',
      image_url: product.image_url || '', variants: product.variants || []
    });
    setIsModalOpen(true);
  };

  const handleProductSubmit = (e) => {
    e.preventDefault();
    if (editingProduct) {
      put(route('products.update', editingProduct.id), { onSuccess: () => setIsModalOpen(false) });
    } else {
      post(route('products.store'), { onSuccess: () => { setIsModalOpen(false); reset(); } });
    }
  };

  const handlePurchaseSubmit = (e) => {
    e.preventDefault();
    purchaseForm.post(route('purchase-entries.store'), {
       onSuccess: () => { setIsPurchaseModalOpen(false); purchaseForm.reset(); }
    });
  };

  const handleDelete = (id) => {
    if (confirm('¿Estás seguro de eliminar este producto y todas sus variantes?')) destroy(route('products.destroy', id));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
      <div className="p-6 border-b border-slate-200 flex flex-wrap gap-4 justify-between items-center bg-slate-50 rounded-t-xl">
        <div className="flex space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Buscar por código o nombre..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:border-indigo-500 outline-none w-64 shadow-sm transition-all" />
          </div>
        </div>
        <div className="flex space-x-3 items-center">
            <div className="flex items-center bg-white border border-slate-300 rounded-lg shadow-sm">
                <span className="px-3 text-slate-400"><Filter className="w-4 h-4" /></span>
                <select 
                    value={selectedCategoryForCountSheet}
                    onChange={(e) => setSelectedCategoryForCountSheet(e.target.value)}
                    className="pr-4 py-2 bg-transparent text-sm font-medium text-slate-700 outline-none border-none min-w-[150px]"
                >
                    <option value="all">Todas las Categorías</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
            </div>
            <a 
                href={route('products.count-sheet', { category: selectedCategoryForCountSheet })} 
                target="_blank" 
                className="flex items-center px-4 py-2 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-900 transition-all shadow-sm active:scale-95"
            >
              <Printer className="w-4 h-4 mr-2" /> Hoja de Conteo
            </a>
            <button onClick={fetchAdjustmentHistory} className="flex items-center px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors shadow-sm border border-slate-300">
              <History className="w-4 h-4 mr-2" /> Historial
            </button>
            <button onClick={() => setIsPurchaseModalOpen(true)} className="flex items-center px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">
             <PlusCircle className="w-4 h-4 mr-2" /> Ingresar Compra
           </button>
           <button onClick={openAddModal} className="flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
             <Plus className="w-4 h-4 mr-2" /> Nuevo Producto
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-500 text-sm border-b border-slate-200">
              <th className="px-6 py-4 font-medium w-10"></th>
              <th className="px-6 py-4 font-medium">Producto Padre</th>
              <th className="px-6 py-4 font-medium">Categoría</th>
              <th className="px-6 py-4 font-medium text-center">Variantes</th>
              <th className="px-6 py-4 font-medium text-center">Stock Total</th>
              <th className="px-6 py-4 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProducts.map(p => {
               const totalStock = p.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
               return (
                <React.Fragment key={p.id}>
                  <tr className="hover:bg-slate-50 transition-colors cursor-pointer group" onClick={() => toggleRow(p.id)}>
                    <td className="px-6 py-4">{expandedRows[p.id] ? <ChevronDown className="w-5 h-5 text-indigo-500" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}</td>
                    <td className="px-6 py-4"><div className="flex items-center"><div className="w-10 h-10 bg-slate-200 rounded-lg mr-3 flex items-center justify-center text-slate-400 overflow-hidden"><Package className="w-5 h-5" /></div><p className="font-bold text-slate-800">{p.name}</p></div></td>
                    <td className="px-6 py-4 text-sm text-slate-600">{p.category?.name || 'S/C'}</td>
                    <td className="px-6 py-4 text-center"><span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-xs font-bold">{p.variants?.length || 0}</span></td>
                    <td className="px-6 py-4 text-center"><span className={`text-lg font-bold ${totalStock <= 0 ? 'text-red-500' : 'text-slate-800'}`}>{totalStock}</span></td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={(e) => { e.stopPropagation(); openEditModal(p); }} className="text-slate-400 hover:text-indigo-600 p-1 ml-2"><Edit className="w-4 h-4" /></button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }} className="text-slate-400 hover:text-red-600 p-1 ml-2"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                  
                  {expandedRows[p.id] && p.variants && (
                    <tr className="bg-slate-50/50">
                      <td colSpan="6" className="p-0 border-b border-indigo-100">
                         <div className="px-14 py-4 bg-indigo-50/30">
                              <table className="w-full text-sm text-left border-separate border-spacing-0">
                             <thead>
                                <tr className="text-slate-500 border-b border-slate-200 text-[10px] uppercase tracking-wider font-bold">
                                    <th className="pb-2 border-b border-slate-200">SKU</th>
                                    <th className="pb-2 border-b border-slate-200">Variante</th>
                                    <th className="pb-2 border-b border-slate-200 text-right">Precio</th>
                                    <th className="pb-2 border-b border-slate-200 text-right">Costo</th>
                                    <th className="pb-2 border-b border-slate-200 text-center">Stock</th>
                                    <th className="pb-2 border-b border-slate-200 text-center">Res.</th>
                                    <th className="pb-2 border-b border-slate-200 text-right">Ajuste</th>
                                </tr>
                             </thead>
                             <tbody>
                               {p.variants.map(v => (
                                 <tr key={v.id} className="border-b border-slate-100 last:border-0 hover:bg-white transition-colors">
                                   <td className="py-2.5 font-mono text-xs text-slate-500">{v.sku}</td>
                                   <td className="py-2.5"><span className="font-semibold text-slate-700">{v.size || 'N/A'}</span> <span className="text-slate-400 mx-1">|</span> <span className="text-slate-500">{v.color || 'N/A'}</span></td>
                                   <td className="py-2.5 text-right font-bold text-indigo-600">{parseFloat(v.selling_price).toFixed(2)}</td>
                                   <td className="py-2.5 text-right text-slate-500">{parseFloat(v.average_cost).toFixed(2)}</td>
                                   <td className="py-2.5 text-center">{v.stock <= 0 ? <span className="text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded text-[10px] uppercase">Agotado</span> : <span className="font-bold text-slate-700">{v.stock}</span>}</td>
                                   <td className="py-2.5 text-center text-amber-600 font-medium">{v.reserved}</td>
                                   <td className="py-2.5 text-right">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); openAdjustmentModal(v, p); }}
                                            className="p-1 px-2 text-amber-600 hover:bg-amber-100 rounded-lg transition-all border border-transparent hover:border-amber-200 shadow-sm active:scale-95 flex items-center float-right"
                                            title="Ajustar Stock"
                                        >
                                            <Settings className="w-4 h-4" />
                                        </button>
                                   </td>
                                 </tr>
                               ))}
                             </tbody>
                           </table>
                         </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
               );
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL DE AJUSTE */}
      {isAdjustmentModalOpen && selectedVariantForAdjustment && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 bg-amber-50 border-b border-amber-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-amber-900 flex items-center text-lg">
                    <Settings className="w-5 h-5 mr-2" /> Ajuste de Inventario
                </h3>
                <p className="text-xs text-amber-700 font-medium">{selectedVariantForAdjustment.product_name} ({selectedVariantForAdjustment.size} / {selectedVariantForAdjustment.color})</p>
              </div>
              <button onClick={() => setIsAdjustmentModalOpen(false)} className="text-amber-400 hover:text-amber-600 transition-colors bg-white/50 p-1 rounded-full"><Plus className="w-5 h-5 rotate-45" /></button>
            </div>
            <form onSubmit={handleAdjustmentSubmit} className="p-6 space-y-5">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between items-center">
                <span className="text-sm text-slate-500">Stock Actual:</span>
                <span className="text-lg font-bold text-slate-800">{selectedVariantForAdjustment.stock}</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Tipo de Ajuste</label>
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        type="button" 
                        onClick={() => adjustmentForm.setData('type', 'addition')}
                        className={`flex items-center justify-center py-3 rounded-xl border-2 transition-all ${adjustmentForm.data.type === 'addition' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'}`}
                    >
                        <PlusCircle className="w-5 h-5 mr-2" /> <span className="font-bold">Suma (+)</span>
                    </button>
                    <button 
                        type="button" 
                        onClick={() => adjustmentForm.setData('type', 'subtraction')}
                        className={`flex items-center justify-center py-3 rounded-xl border-2 transition-all ${adjustmentForm.data.type === 'subtraction' ? 'bg-red-50 border-red-500 text-red-700 shadow-sm' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'}`}
                    >
                        <MinusCircle className="w-5 h-5 mr-2" /> <span className="font-bold">Resta (-)</span>
                    </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Cantidad a Ajustar</label>
                <input 
                    type="number" 
                    value={adjustmentForm.data.quantity} 
                    onChange={e => adjustmentForm.setData('quantity', e.target.value)} 
                    required 
                    min="1"
                    placeholder="Eje: 5"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-indigo-500 outline-none transition-all shadow-inner" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Motivo del Ajuste</label>
                <textarea 
                    value={adjustmentForm.data.reason} 
                    onChange={e => adjustmentForm.setData('reason', e.target.value)} 
                    required 
                    rows="3"
                    placeholder="Ej. Producto dañado, Error de conteo físico..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-indigo-500 outline-none transition-all shadow-inner resize-none"
                />
              </div>

              <div className="pt-2 flex space-x-3">
                <button type="button" onClick={() => setIsAdjustmentModalOpen(false)} className="px-5 py-3 text-slate-500 font-bold hover:text-slate-700 transition-colors">Cancelar</button>
                <button 
                    type="submit" 
                    disabled={adjustmentForm.processing} 
                    className={`flex-1 py-3 rounded-xl text-white font-bold shadow-lg transition-all active:scale-95 ${adjustmentForm.data.type === 'addition' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' : 'bg-red-600 hover:bg-red-700 shadow-red-200'}`}
                >
                    {adjustmentForm.processing ? 'Procesando...' : 'Confirmar Ajuste'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE HISTORIAL */}
      {isAdjustmentHistoryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="px-8 py-5 bg-slate-50 border-b border-slate-200 flex justify-between items-center shrink-0">
               <div className="flex items-center">
                  <div className="bg-indigo-100 p-2 rounded-lg mr-4">
                    <History className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-xl tracking-tight">Historial de Ajustes</h3>
                    <p className="text-sm text-slate-500 font-medium">Registro de auditoría de movimientos manuales</p>
                  </div>
               </div>
               <button onClick={() => setIsAdjustmentHistoryModalOpen(false)} className="bg-white border border-slate-200 text-slate-400 hover:text-red-500 p-2 rounded-xl transition-all shadow-sm"><Plus className="w-6 h-6 rotate-45" /></button>
            </div>
            <div className="flex-1 overflow-auto p-8">
               <table className="w-full text-left">
                 <thead>
                    <tr className="text-slate-400 text-[11px] uppercase tracking-widest font-bold border-b-2 border-slate-100 italic">
                        <th className="pb-4">Fecha</th>
                        <th className="pb-4">Producto</th>
                        <th className="pb-4">Variante</th>
                        <th className="pb-4">Tipo</th>
                        <th className="pb-4">Usuario</th>
                        <th className="pb-4">Motivo</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {adjustmentHistory.length > 0 ? adjustmentHistory.map(adj => (
                        <tr key={adj.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-4 whitespace-nowrap">
                                <span className="block font-bold text-slate-700">{new Date(adj.created_at).toLocaleDateString()}</span>
                                <span className="text-[10px] text-slate-400">{new Date(adj.created_at).toLocaleTimeString()}</span>
                            </td>
                            <td className="py-4 font-bold text-indigo-700">{adj.variant?.product?.name}</td>
                            <td className="py-4">
                                <span className="bg-slate-100 px-2 py-1 rounded text-xs font-bold text-slate-600">{adj.variant?.size || 'N/A'} / {adj.variant?.color || 'N/A'}</span>
                            </td>
                            <td className="py-4">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-tighter ${adj.type === 'addition' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                    {adj.type === 'addition' ? <Plus className="w-3 h-3 mr-1" /> : <Minus className="w-3 h-3 mr-1" />}
                                    {adj.quantity} unid.
                                </span>
                            </td>
                            <td className="py-4 text-slate-600 font-medium">
                                <div className="flex items-center">
                                    <div className="w-6 h-6 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center text-[10px] font-bold mr-2 uppercase">{adj.user?.name?.charAt(0)}</div>
                                    {adj.user?.name}
                                </div>
                            </td>
                            <td className="py-4 italic text-slate-500 max-w-xs truncate" title={adj.reason}>"{adj.reason}"</td>
                        </tr>
                    )) : (
                        <tr><td colSpan="6" className="py-20 text-center"><div className="flex flex-col items-center"><History className="w-12 h-12 text-slate-200 mb-3" /><p className="text-slate-400 font-medium italic">No hay registros de ajustes aún.</p></div></td></tr>
                    )}
                 </tbody>
               </table>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-slate-800 text-lg">Nuevo Producto con Variantes</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><Plus className="w-6 h-6 rotate-45" /></button>
            </div>
            <form onSubmit={handleProductSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-bold text-indigo-800 border-b pb-2">Información General</h4>
                  <div><label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nombre</label><input type="text" value={data.name} onChange={e => setData('name', e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:bg-white focus:border-indigo-500 outline-none" /></div>
                  <div><label className="block text-xs font-bold text-slate-400 uppercase mb-1">Categoría</label><select value={data.category_id} onChange={e => setData('category_id', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:bg-white focus:border-indigo-500 outline-none"><option value="">Sin Categoría</option>{categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                  <div><label className="block text-xs font-bold text-slate-400 uppercase mb-1">Descripción</label><textarea value={data.description} onChange={e => setData('description', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:bg-white focus:border-indigo-500 outline-none h-20" /></div>
                </div>
                <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-center border-b pb-2"><h4 className="font-bold text-indigo-800">Variantes</h4><button type="button" onClick={handleAddVariantRow} className="text-indigo-600 hover:text-indigo-800 text-sm font-bold flex items-center"><Plus className="w-4 h-4 mr-1"/> Agregar Variante</button></div>
                  <div className="max-h-[300px] overflow-y-auto pr-2 space-y-3">
                    {data.variants.map((variant, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm relative group">
                        {data.variants.length > 1 && (<button type="button" onClick={() => handleRemoveVariantRow(idx)} className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><Plus className="w-3 h-3 rotate-45" /></button>)}
                        <div className="grid grid-cols-2 gap-3 mb-2">
                          <div><label className="text-[10px] font-bold text-slate-400 uppercase">Talla</label><input placeholder="Ej. L" type="text" value={variant.size} onChange={e => updateVariantRow(idx, 'size', e.target.value)} className="w-full border-b border-slate-200 text-sm py-1 outline-none focus:border-indigo-500" /></div>
                          <div><label className="text-[10px] font-bold text-slate-400 uppercase">Color</label><input placeholder="Ej. Rojo" type="text" value={variant.color} onChange={e => updateVariantRow(idx, 'color', e.target.value)} className="w-full border-b border-slate-200 text-sm py-1 outline-none focus:border-indigo-500" /></div>
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                          <div><label className="text-[10px] items-center flex justify-between font-bold text-slate-400 uppercase">SKU<span onClick={() => updateVariantRow(idx, 'sku', generateRandomSKU())} className="text-indigo-500 cursor-pointer font-normal hover:underline">Autogenerar</span></label><input type="text" value={variant.sku} onChange={e => updateVariantRow(idx, 'sku', e.target.value)} required className="w-full border-b border-slate-200 text-sm py-1 outline-none focus:border-indigo-500 font-mono text-slate-600" /></div>
                          <div><label className="text-[10px] font-bold text-slate-400 uppercase">Costo Ref. (Q)</label><input type="number" step="0.01" value={variant.reference_cost} onChange={e => {
                            const c = e.target.value;
                            const nv = { ...variant, reference_cost: c };
                            if (c && nv.margin) nv.selling_price = (parseFloat(c) * (1 + parseFloat(nv.margin)/100)).toFixed(2);
                            else if (c && nv.selling_price) nv.margin = (((parseFloat(nv.selling_price) - parseFloat(c)) / parseFloat(c)) * 100).toFixed(2);
                            const nvArr = [...data.variants]; nvArr[idx] = nv; setData('variants', nvArr);
                          }} className="w-full border-b border-slate-200 text-sm py-1 outline-none focus:border-indigo-500" /></div>
                          <div><label className="text-[10px] font-bold text-slate-400 uppercase">Margen Sobre Costo (%)</label><input placeholder="Ej. 30" type="number" step="0.01" value={variant.margin} onChange={e => {
                            const m = e.target.value;
                            const nv = { ...variant, margin: m };
                            if (nv.reference_cost && m) nv.selling_price = (parseFloat(nv.reference_cost) * (1 + parseFloat(m)/100)).toFixed(2);
                            const nvArr = [...data.variants]; nvArr[idx] = nv; setData('variants', nvArr);
                          }} className="w-full border-b border-slate-200 text-sm py-1 outline-none focus:border-indigo-500" /></div>
                          <div><label className="text-[10px] font-bold text-slate-400 uppercase">Precio Venta (Q)</label><input type="number" step="0.01" value={variant.selling_price} onChange={e => {
                            const s = e.target.value;
                            const nv = { ...variant, selling_price: s };
                            if (nv.reference_cost && s) nv.margin = (((parseFloat(s) - parseFloat(nv.reference_cost)) / parseFloat(nv.reference_cost)) * 100).toFixed(2);
                            const nvArr = [...data.variants]; nvArr[idx] = nv; setData('variants', nvArr);
                          }} required className="w-full border-b border-slate-200 font-bold text-indigo-600 text-sm py-1 outline-none focus:border-indigo-500" /></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="pt-4 flex space-x-3 border-t"><button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50">Cancelar</button><button type="submit" disabled={processing} className="flex-1 px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700">Guardar</button></div>
            </form>
          </div>
        </div>
      )}

      {isPurchaseModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-emerald-600 text-white flex justify-between items-center shrink-0">
              <h3 className="font-bold text-lg flex items-center"><Truck className="w-5 h-5 mr-2"/> Registro de Entrada por Compra</h3>
              <button onClick={() => setIsPurchaseModalOpen(false)} className="text-emerald-200 hover:text-white"><Plus className="w-6 h-6 rotate-45" /></button>
            </div>
            <form onSubmit={handlePurchaseSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-slate-400 uppercase mb-1">Proveedor</label><select required value={purchaseForm.data.supplier_id} onChange={e => purchaseForm.setData('supplier_id', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 outline-none"><option value="">Seleccione Proveedor</option>{suppliers?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                <div><label className="block text-xs font-bold text-slate-400 uppercase mb-1">No. Factura / Recibo</label><input required type="text" value={purchaseForm.data.invoice_number} onChange={e => purchaseForm.setData('invoice_number', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 outline-none"/></div>
              </div>
              <div>
                <div className="flex justify-between items-end border-b pb-2 mb-4"><h4 className="font-bold text-slate-800">Detalles de la Compra</h4><button type="button" onClick={handleAddPurchaseDetail} className="text-emerald-600 hover:text-emerald-800 text-sm font-bold flex items-center"><Plus className="w-4 h-4 mr-1"/> Añadir Fila</button></div>
                <div className="space-y-3">
                  {purchaseForm.data.details.map((detail, idx) => (
                    <div key={idx} className="flex gap-3 items-start bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <div className="flex-1"><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Producto / Variante</label><select required value={detail.product_variant_id} onChange={e => {
                          const vId = e.target.value;
                          const nv = { ...detail, product_variant_id: vId };
                          const found = allVariants.find(v => v.id == vId);
                          if (found) {
                              nv.selling_price = parseFloat(found.selling_price).toFixed(2);
                              if (nv.unit_cost) nv.margin = (((parseFloat(nv.selling_price) - parseFloat(nv.unit_cost)) / parseFloat(nv.unit_cost)) * 100).toFixed(2);
                          }
                          const newDetails = [...purchaseForm.data.details]; newDetails[idx] = nv; purchaseForm.setData('details', newDetails);
                      }} className="w-full border border-slate-200 rounded text-sm py-1.5 px-2 outline-none focus:border-emerald-500 shrink-0"><option value="">Buscar Variante...</option>{allVariants.map(v => (<option key={v.id} value={v.id}>{v.product_name} - {v.size} {v.color} ({v.sku})</option>))}</select></div>
                      <div className="w-24"><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Cantidad</label><input required type="number" min="1" value={detail.quantity} onChange={e => updatePurchaseDetail(idx, 'quantity', e.target.value)} className="w-full border border-slate-200 rounded text-sm py-1.5 px-2 outline-none focus:border-emerald-500 text-center" /></div>
                      <div className="w-20"><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Costo Unit. (Q)</label><input required type="number" step="0.01" value={detail.unit_cost} onChange={e => {
                        const c = e.target.value; 
                        const nv = { ...detail, unit_cost: c };
                        if (c && nv.margin) nv.selling_price = (parseFloat(c) * (1 + parseFloat(nv.margin)/100)).toFixed(2);
                        else if (c && nv.selling_price) nv.margin = (((parseFloat(nv.selling_price) - parseFloat(c)) / parseFloat(c)) * 100).toFixed(2);
                        const newDetails = [...purchaseForm.data.details]; newDetails[idx] = nv; purchaseForm.setData('details', newDetails);
                      }} className="w-full border border-slate-200 rounded text-sm py-1.5 px-2 outline-none focus:border-emerald-500 text-right font-medium text-emerald-700" /></div>
                      
                      <div className="w-20"><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Margen Sobre Costo (%)</label><input type="number" step="0.01" value={detail.margin} onChange={e => {
                        const m = e.target.value; 
                        const nv = { ...detail, margin: m };
                        if (nv.unit_cost && m) nv.selling_price = (parseFloat(nv.unit_cost) * (1 + parseFloat(m)/100)).toFixed(2);
                        const newDetails = [...purchaseForm.data.details]; newDetails[idx] = nv; purchaseForm.setData('details', newDetails);
                      }} className="w-full border border-slate-200 rounded text-sm py-1.5 px-2 outline-none focus:border-emerald-500 text-center" /></div>
                      
                      <div className="w-24"><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Venta (Q)</label><input required type="number" step="0.01" value={detail.selling_price} onChange={e => {
                        const s = e.target.value;
                        const nv = { ...detail, selling_price: s };
                        if (nv.unit_cost && s) nv.margin = (((parseFloat(s) - parseFloat(nv.unit_cost)) / parseFloat(nv.unit_cost)) * 100).toFixed(2);
                        const newDetails = [...purchaseForm.data.details]; newDetails[idx] = nv; purchaseForm.setData('details', newDetails);
                      }} className="w-full border border-slate-200 rounded text-sm py-1.5 px-2 outline-none focus:border-emerald-500 text-right font-bold text-indigo-600" /></div>
                      
                      {purchaseForm.data.details.length > 1 && (<div className="pt-5"><button type="button" onClick={() => { const nd = [...purchaseForm.data.details]; nd.splice(idx,1); purchaseForm.setData('details', nd); }} className="text-red-400 hover:text-red-600 mt-1"><Trash2 className="w-5 h-5"/></button></div>)}
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-4 mt-6 border-t flex space-x-3"><button type="button" onClick={() => setIsPurchaseModalOpen(false)} className="px-6 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50">Cancelar</button><button type="submit" disabled={purchaseForm.processing} className="flex-1 px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700">{purchaseForm.processing ? 'Guardando...' : 'Completar Compra'}</button></div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// 4. PEDIDOS Y LOGÍSTICA VIEW

// 4. PEDIDOS Y LOGÍSTICA VIEW
function OrdersView({ deliveries = [], setActiveTab, setPosInitialAction }) {
  const [generatingDraftFor, setGeneratingDraftFor] = useState(null);
  const [draftMessage, setDraftMessage] = useState('');
  
  // Modals state
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [pendingDropOrder, setPendingDropOrder] = useState(null);
  const [shippingAddress, setShippingAddress] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Independent Shipping Modal
  const [isManualDeliveryModalOpen, setIsManualDeliveryModalOpen] = useState(false);
  const manualForm = useForm({
    customer_name: '',
    customer_phone: '',
    shipping_address: '',
    package_description: '',
    shipping_cost: '',
    total: ''
  });

  // Cancel order state
  const [cancellingIds, setCancellingIds] = useState([]);

  const handleCancelOrder = (e, orderId) => {
    e.stopPropagation();
    if (!confirm('¿Estás seguro de cancelar esta orden? El inventario será liberado inmediatamente.')) return;
    
    setCancellingIds(prev => [...prev, orderId]);
    
    router.post(route('logistics.cancel', orderId), {}, {
      preserveScroll: true,
      onSuccess: () => {
        // La animación fade-out se mantiene por el ID en cancellingIds
        setTimeout(() => {
          setCancellingIds(prev => prev.filter(id => id !== orderId));
        }, 500);
      },
      onError: () => {
        setCancellingIds(prev => prev.filter(id => id !== orderId));
        alert('Error al cancelar el pedido.');
      }
    });
  };

  // Order Details Modal
  const [selectedOrder, setSelectedOrder] = useState(null);

  const columns = [
    { id: 'pending_confirmation', title: 'Por Confirmar (Lives)', color: 'border-slate-300', bg: 'bg-slate-100' },
    { id: 'packing', title: 'Empacando / Agendado', color: 'border-amber-300', bg: 'bg-amber-50' },
    { id: 'in_transit', title: 'En Ruta (Mensajero)', color: 'border-blue-300', bg: 'bg-blue-50' }
  ];

  const handleDragStart = (e, order) => {
    e.dataTransfer.setData('orderId', order.id);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const orderId = e.dataTransfer.getData('orderId');
    const order = deliveries.find(d => d.id == orderId);
    
    if (!order || order.shipping_status === newStatus) return;

    if (newStatus === 'packing' && (!order.shipping_address || order.shipping_address.trim() === '')) {
      setPendingDropOrder(order);
      setShippingAddress('');
      setAddressModalOpen(true);
      return;
    }

    await changeOrderStatus(orderId, newStatus);
  };

  const changeOrderStatus = async (orderId, newStatus) => {
    setIsUpdating(true);
    router.patch(route('logistics.updateStatus', orderId), {
      shipping_status: newStatus
    }, {
      preserveScroll: true,
      onFinish: () => setIsUpdating(false)
    });
  };

  const submitAddress = async () => {
    if (!shippingAddress.trim()) {
      alert("La dirección es obligatoria.");
      return;
    }
    
    setIsUpdating(true);
    router.patch(route('logistics.updateAddress', pendingDropOrder.id), {
      shipping_address: shippingAddress
    }, {
      preserveScroll: true,
      onSuccess: () => {
        setAddressModalOpen(false);
        changeOrderStatus(pendingDropOrder.id, 'packing');
      },
      onFinish: () => setIsUpdating(false)
    });
  };

  const markAsDelivered = async (orderId) => {
    if(confirm('¿Confirmas que este pedido fue entregado?')) {
      await changeOrderStatus(orderId, 'delivered');
      setSelectedOrder(null);
    }
  };

  const handleGenerateMessage = async (orderId, customerName, amount) => {
    setGeneratingDraftFor(orderId);
    setDraftMessage('');
    
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    
    const prompt = `Escribe un mensaje corto, amable y entusiasta para WhatsApp (usa emojis).
    Es para avisarle a nuestro cliente "${customerName}" que su pedido de la tienda Variedades está listo para ser enviado.
    El monto a pagar al recibir es de Q ${amount}. Pídele amablemente que nos confirme su dirección exacta para hacerle el envío hoy mismo.`;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }]
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (data.candidates) {
        setDraftMessage(data.candidates[0].content.parts[0].text);
      }
    } catch (error) {
      console.error(error);
      alert("Error al generar mensaje.");
    } finally {
      setGeneratingDraftFor(null);
    }
  };

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Tablero de Envíos {isUpdating && <Loader2 className="inline-block w-4 h-4 ml-2 animate-spin text-indigo-500" />}</h2>
        <div className="flex space-x-2">
          <button onClick={() => window.open(route('logistics.manifest'), '_blank')} className="bg-white border border-slate-300 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center">
            <Truck className="w-4 h-4 mr-2" /> Manifiesto Motorista
          </button>
          <button onClick={() => setIsManualDeliveryModalOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
            Nuevo Envío Manual
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 min-h-0">
        {columns.map((col, idx) => {
          const colOrders = deliveries.filter(d => d.shipping_status === col.id);
          return (
            <div 
              key={idx} 
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`rounded-xl border ${col.color} bg-white flex flex-col overflow-hidden shadow-sm h-full`}
            >
              <div className={`${col.bg} p-4 border-b ${col.color} flex justify-between items-center shrink-0`}>
                <h3 className="font-bold text-slate-700">{col.title}</h3>
                <span className="bg-white text-slate-600 text-xs font-bold px-2 py-1 rounded-full shadow-sm">{colOrders.length}</span>
              </div>
              
              <div className="p-4 flex-1 overflow-y-auto space-y-4 bg-slate-50/50">
                {colOrders.map(order => {
                  const orderIdStr = `ORD-${order.id.toString().padStart(4, '0')}`;
                  const customerName = order.customer_name || 'Sin Nombre';
                  const total = parseFloat(order.total);

                  return (
                    <div 
                      key={order.id} 
                      draggable 
                      onDragStart={(e) => handleDragStart(e, order)}
                      onClick={() => setSelectedOrder(order)}
                      className={`bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer group active:cursor-grabbing cursor-grab ${cancellingIds.includes(order.id) ? 'opacity-0 scale-95 pointer-events-none' : ''}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{orderIdStr}</span>
                          <button 
                            onClick={(e) => handleCancelOrder(e, order.id)}
                            className="bg-red-50 text-red-500 hover:bg-red-600 hover:text-white p-1.5 rounded-full opacity-60 group-hover:opacity-100 transition-all shadow-sm flex items-center justify-center"
                            title="Cancelar Pedido"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                        <span className="text-xs text-slate-400 flex items-center"><Clock className="w-3 h-3 mr-1" /> {new Date(order.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="font-bold text-slate-800">{customerName}</p>
                      <p className="text-sm text-slate-500 mb-3 truncate">{order.shipping_address || 'Sin dirección registrada'}</p>
                      
                      <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                        <span className="text-sm font-bold text-slate-700">Q {total.toFixed(2)}</span>
                        <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">{order.payment_status === 'paid' ? 'Pagado' : 'Pago c/Entrega'}</span>
                      </div>

                      {/* Botón Mágico de WhatsApp solo si está por confirmar y falta dirección */}
                      {col.id === 'pending_confirmation' && (!order.shipping_address) && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleGenerateMessage(order.id, customerName, total); }}
                          className="mt-3 w-full opacity-0 group-hover:opacity-100 transition-opacity bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 py-1.5 rounded text-xs font-bold flex items-center justify-center"
                        >
                          {generatingDraftFor === order.id ? (
                             <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> 
                          ) : (
                             <Sparkles className="w-3 h-3 mr-1.5" /> 
                          )}
                          Pedir Dirección IA
                        </button>
                      )}
                    </div>
                  )
                })}
                {colOrders.length === 0 && (
                  <div className="h-full flex items-center justify-center text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-lg p-6">
                    Soltar tarjeta aquí
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Address Modal */}
      {addressModalOpen && pendingDropOrder && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col p-6">
            <h3 className="font-bold text-lg text-slate-800 mb-2">Dirección Requerida</h3>
            <p className="text-sm text-slate-600 mb-4">El pedido de <strong>{pendingDropOrder.customer_name}</strong> no tiene dirección. Ingrésala para pasar a Empaque.</p>
            <textarea 
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="Ej. 4ta Calle 2-10 Zona 1, Huehuetenango"
              className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:border-indigo-500 outline-none min-h-[100px] mb-4"
            />
            <div className="flex space-x-3 justify-end">
              <button onClick={() => setAddressModalOpen(false)} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50">Cancelar</button>
              <button disabled={isUpdating} onClick={submitAddress} className="px-4 py-2 bg-indigo-600 flex items-center text-white font-bold rounded-lg hover:bg-indigo-700">
                {isUpdating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null} Generar Empaque
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col">
            <div className="px-5 py-4 bg-indigo-600 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center"><Package className="w-5 h-5 mr-2" /> Detalle de Orden de Envío</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-indigo-200 hover:text-white"><Plus className="w-6 h-6 rotate-45" /></button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Cliente</p>
                  <p className="font-bold text-slate-800">{selectedOrder.customer_name || 'N/A'}</p>
                  <p className="text-sm text-slate-600">📞 {selectedOrder.customer_phone || selectedOrder.shipping_phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Dirección de Envío</p>
                  <p className="text-sm text-slate-800 mb-1">{selectedOrder.shipping_address || 'No especificada'}</p>
                </div>
              </div>

              {selectedOrder.sale_type === 'manual_delivery' ? (
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 mb-6">
                  <h4 className="font-bold text-amber-800 flex items-center"><Package className="w-4 h-4 mr-2" /> Descripción del Paquete (Envío Independiente)</h4>
                  <p className="text-sm text-slate-700 mt-2 whitespace-pre-wrap">{selectedOrder.package_description}</p>
                </div>
              ) : (
                <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden mb-6">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-100 border-b border-slate-200 text-slate-500">
                      <tr><th className="px-4 py-2 font-bold">Producto</th><th className="px-4 py-2 font-bold text-center">Cant.</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedOrder.details?.map(detail => {
                        const variant = detail.product_variant;
                        return (
                          <tr key={detail.id}>
                            <td className="px-4 py-3">
                              <span className="font-bold text-slate-800 block">{variant?.product?.name || 'Producto Desconocido'}</span>
                              <span className="text-[10px] text-slate-500 bg-slate-200 px-1 rounded">{variant?.size} {variant?.color}</span>
                            </td>
                            <td className="px-4 py-3 text-center font-bold text-indigo-600 text-lg">{detail.quantity}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              
              <div className="flex justify-between items-center border-t border-slate-100 pt-4 mb-4">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Estado de Pago</p>
                  <p className="font-bold text-slate-800">{selectedOrder.payment_status === 'paid' ? '✅ Pagado' : '⏳ Pago Contra Entrega'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase">Total + Envío</p>
                  <p className="text-2xl font-black text-indigo-600">Q {parseFloat(selectedOrder.total).toFixed(2)}</p>
                </div>
              </div>

              {selectedOrder.shipping_status === 'in_transit' && (
                <button 
                  disabled={isUpdating}
                  onClick={() => markAsDelivered(selectedOrder.id)} 
                  className="w-full flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl shadow-md transition-colors"
                >
                  {isUpdating ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <CheckCircle2 className="w-5 h-5 mr-2" />} 
                  ✅ Marcar como Entregado
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE RESULTADO GEMINI (WHATSAPP) */}
      {draftMessage && (
        <div className="absolute bottom-6 right-6 bg-white border border-slate-200 p-5 rounded-xl shadow-2xl w-80 z-40">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-bold text-slate-800 flex items-center">
              <MessageCircle className="w-4 h-4 mr-2 text-green-500" /> Borrador IA
            </h4>
            <button onClick={() => setDraftMessage('')} className="text-slate-400 hover:text-slate-700">&times;</button>
          </div>
          <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 mb-3 whitespace-pre-wrap">
            {draftMessage}
          </p>
          <button 
            onClick={() => { navigator.clipboard.writeText(draftMessage); alert("¡Copiado al portapapeles!"); setDraftMessage(''); }}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-lg text-sm transition-colors"
          >
            Copiar al Portapapeles
          </button>
        </div>
      )}

      {/* Manual Independent Delivery Modal */}
      {isManualDeliveryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="px-5 py-4 bg-indigo-600 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center"><Package className="w-5 h-5 mr-2" /> Crear Envío Independiente</h3>
              <button disabled={manualForm.processing} onClick={() => setIsManualDeliveryModalOpen(false)} className="text-indigo-200 hover:text-white"><Plus className="w-6 h-6 rotate-45" /></button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              manualForm.post(route('logistics.storeManualDelivery'), {
                preserveScroll: true,
                onSuccess: () => {
                  setIsManualDeliveryModalOpen(false);
                  manualForm.reset();
                }
              });
            }} className="p-6">
              <p className="text-sm text-slate-600 mb-4 bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                Utiliza este formulario para envíos de paquetes que no incluyen productos del inventario (ej. premios, documentos, repuestos). Aparecerá directo en "Empacando".
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Destinatario</label>
                  <input required type="text" value={manualForm.data.customer_name} onChange={e => manualForm.setData('customer_name', e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:border-indigo-500 outline-none" placeholder="Nombre completo" />
                  {manualForm.errors.customer_name && <div className="text-red-500 text-xs mt-1">{manualForm.errors.customer_name}</div>}
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Teléfono</label>
                  <input required type="text" value={manualForm.data.customer_phone} onChange={e => manualForm.setData('customer_phone', e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:border-indigo-500 outline-none" placeholder="Teléfono" />
                  {manualForm.errors.customer_phone && <div className="text-red-500 text-xs mt-1">{manualForm.errors.customer_phone}</div>}
                </div>
              </div>

              <div className="mb-4">
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Dirección Exacta</label>
                <textarea required value={manualForm.data.shipping_address} onChange={e => manualForm.setData('shipping_address', e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:border-indigo-500 outline-none h-20" placeholder="Dirección de entrega" />
                {manualForm.errors.shipping_address && <div className="text-red-500 text-xs mt-1">{manualForm.errors.shipping_address}</div>}
              </div>

              <div className="mb-4">
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Descripción del Paquete</label>
                <textarea required value={manualForm.data.package_description} onChange={e => manualForm.setData('package_description', e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:border-indigo-500 outline-none h-20 bg-amber-50" placeholder="Ej. Cambio de Talla - Playera Polo Negra M. Sin Cobro." />
                {manualForm.errors.package_description && <div className="text-red-500 text-xs mt-1">{manualForm.errors.package_description}</div>}
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Costo Envío (Mensajero)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-medium">Q</span>
                    <input required type="number" step="0.01" value={manualForm.data.shipping_cost} onChange={e => manualForm.setData('shipping_cost', e.target.value)} className="w-full pl-8 border border-slate-300 rounded-lg p-2.5 text-sm focus:border-indigo-500 outline-none" />
                  </div>
                  {manualForm.errors.shipping_cost && <div className="text-red-500 text-xs mt-1">{manualForm.errors.shipping_cost}</div>}
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Monto a Cobrar (Total)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-indigo-600 font-bold">Q</span>
                    <input required type="number" step="0.01" value={manualForm.data.total} onChange={e => manualForm.setData('total', e.target.value)} className="w-full pl-8 border border-slate-300 rounded-lg p-2.5 text-sm focus:border-indigo-500 outline-none font-bold text-indigo-600" />
                  </div>
                  {manualForm.errors.total && <div className="text-red-500 text-xs mt-1">{manualForm.errors.total}</div>}
                </div>
              </div>
              
              <div className="mt-6 flex space-x-3">
                <button type="button" disabled={manualForm.processing} onClick={() => setIsManualDeliveryModalOpen(false)} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium">Cancelar</button>
                <button type="submit" disabled={manualForm.processing} className="flex-1 px-4 py-2 bg-indigo-600 flex justify-center items-center text-white font-bold rounded-lg hover:bg-indigo-700">
                  {manualForm.processing ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Package className="w-5 h-5 mr-2" />} 
                  Crear y Enviar a Empaque
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// 5. NUEVO: MÓDULO DE VENTA MANUAL / POST-LIVE
function POSView({ products, initialAction, setInitialAction }) {
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [dmText, setDmText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedProductForVariant, setSelectedProductForVariant] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isLocalPaymentModalOpen, setIsLocalPaymentModalOpen] = useState(false);
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [lastSaleData, setLastSaleData] = useState(null);
  const [receiptPhone, setReceiptPhone] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isQuickCustomerModalOpen, setIsQuickCustomerModalOpen] = useState(false);
  const [quickCustomerData, setQuickCustomerData] = useState({
    full_name: '',
    social_handle: '',
    phone: '',
    default_address: ''
  });
  const [isSavingQuickCustomer, setIsSavingQuickCustomer] = useState(false);

  // Función para guardar cliente rápido
  const handleQuickCustomerSubmit = async (e) => {
    e.preventDefault();
    setIsSavingQuickCustomer(true);
    try {
      console.log('Enviando datos de cliente rápido:', quickCustomerData);
      const response = await window.axios.post(route('customers.store'), quickCustomerData);
      console.log('Respuesta del servidor:', response.data);
      if (response.data.success) {
        const newCustomer = response.data.customer;
        // Seleccionamos al nuevo cliente automáticamente
        setSelectedCustomer(newCustomer);
        setCustomerName(newCustomer.full_name);
        
        // Cerramos modal y reseteamos
        setIsQuickCustomerModalOpen(false);
        setQuickCustomerData({ full_name: '', social_handle: '', phone: '', default_address: '' });
        alert('Cliente guardado y seleccionado: ' + newCustomer.full_name);
      }
    } catch (error) {
      console.error("Error al crear cliente rápido:", error);
      const errorMsg = error.response?.data?.message || 'Error al guardar el cliente. Verifique los datos.';
      alert(errorMsg);
    } finally {
      setIsSavingQuickCustomer(false);
    }
  };

  React.useEffect(() => {
    if (initialAction === 'open_shipping') {
      setIsShippingModalOpen(true);
      if (setInitialAction) setInitialAction(null);
    }
  }, [initialAction]);

  // Hook para actualizar campos de envío cuando cambia el cliente seleccionado
  React.useEffect(() => {
    if (selectedCustomer && isShippingModalOpen) {
      setCustomerName(selectedCustomer.full_name || '');
      setShippingPhone(selectedCustomer.phone || '');
      setShippingAddress(selectedCustomer.default_address || '');
    }
  }, [selectedCustomer, isShippingModalOpen]);

  // Local Payment Form
  const [localPaymentMethod, setLocalPaymentMethod] = useState('Efectivo');
  const [amountReceived, setAmountReceived] = useState('');

  // Shipping Form
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingPhone, setShippingPhone] = useState('');
  const [shippingCost, setShippingCost] = useState('');
  const [shippingPaymentStatus, setShippingPaymentStatus] = useState('Pago Contra Entrega');

  const inventory = products.filter(p => {
    const searchLower = searchQuery.toLowerCase();
    const matchesName = p.name.toLowerCase().includes(searchLower);
    const matchesSKU = p.sku && p.sku.toLowerCase().includes(searchLower);
    const matchesVariants = p.variants && p.variants.some(v => 
      (v.sku && v.sku.toLowerCase().includes(searchLower)) ||
      (v.size && v.size.toLowerCase().includes(searchLower)) ||
      (v.color && v.color.toLowerCase().includes(searchLower))
    );
    return matchesName || matchesSKU || matchesVariants;
  });

  const addToCartVariant = (product, variant) => {
    const cartItemId = variant ? `var_${variant.id}` : `prod_${product.id}`;
    const name = variant ? `${product.name} (${variant.size || ''} ${variant.color || ''})` : product.name;
    const price = variant ? parseFloat(variant.selling_price) : parseFloat(product.price || 0);
    const variantId = variant ? variant.id : null;

    const existing = cart.find(item => item.cartItemId === cartItemId);
    if (existing) {
      setCart(cart.map(item => item.cartItemId === cartItemId ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { 
        id: product.id, 
        cartItemId, 
        variant_id: variantId, 
        name: product.name,
        variant_details: variant ? `Talla: ${variant.size || 'N/A'} | Color: ${variant.color || 'N/A'}` : null,
        price, 
        qty: 1,
        needs_variant: !variant // Flag for AI additions that missed a variant
      }]);
    }
    
    setSelectedProductForVariant(null);
  };

  const handleProductClick = (product) => {
    if (product.variants && product.variants.length > 0) {
      setSelectedProductForVariant(product);
    } else {
      // Si no tiene variantes, lo agregamos normal (aunque el sistema nuevo pide variantes, por seguridad)
      addToCartVariant(product, null);
    }
  };

  const removeFromCart = (cartItemId) => {
    setCart(cart.filter(item => item.cartItemId !== cartItemId));
  };

  const openVariantSelectorForCartItem = (item) => {
    const product = products.find(p => p.id === item.id);
    if(product) {
      removeFromCart(item.cartItemId); // Se quita el temporal y abre el modal
      setSelectedProductForVariant(product);
    }
  };

  const processCartItemMissingVariant = (item, newVariant) => {
    removeFromCart(item.cartItemId);
    const product = products.find(p => p.id === item.id);
    if(product) {
      addToCartVariant(product, newVariant);
    }
  };

  const handleAnalyzeDM = async () => {
    if (!dmText) return;
    setIsAnalyzing(true);

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    
    // Le enviamos a Gemini nuestro inventario y sus variantes
    const inventoryData = products.map(p => {
      const vars = p.variants ? p.variants.map(v => `{id: ${v.id}, size: '${v.size}', color: '${v.color}'}`).join(', ') : '';
      return `{prod_id: ${p.id}, name: '${p.name}', variants: [ ${vars} ]}`;
    }).join('\n');

    const prompt = `Ahora los productos tienen variantes (tallas/colores). Al procesar el mensaje del cliente, extrae no solo el nombre del producto, sino también la talla o color si lo menciona. 
    Busca en el siguiente inventario disponible: 
    ${inventoryData}
    
    Si el cliente no especifica la variante (ej. solo dice 'quiero la blusa floral'), devuelve el 'variant_id' como nulo (null) para que el propio cajero lo complete manualmente antes de cobrar.
    Si sí la menciona, devuelve el 'variant_id' exacto.
    Devuelve estrictamente un JSON con esta estructura: { "customer": "nombre_del_cliente", "items": [{ "prod_id": id, "variant_id": id_o_null }] }. 
    Mensaje: "${dmText}"`;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            customer: { type: "STRING" },
            items: { 
              type: "ARRAY", 
              items: { 
                type: "OBJECT",
                properties: {
                  prod_id: { type: "NUMBER" },
                  variant_id: { type: "NUMBER", nullable: true }
                }
              } 
            }
          }
        }
      }
    };

    try {
      const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (data.candidates) {
        const result = JSON.parse(data.candidates[0].content.parts[0].text);
        if(result.customer) setCustomerName(result.customer);
        
        if(result.items && result.items.length > 0) {
          result.items.forEach(itemInfo => {
            const prod = products.find(p => p.id === itemInfo.prod_id);
            if(prod) {
              if(itemInfo.variant_id) {
                const variant = prod.variants.find(v => v.id === itemInfo.variant_id);
                if(variant) addToCartVariant(prod, variant);
                else addToCartVariant(prod, null);
              } else {
                addToCartVariant(prod, null);
              }
            }
          });
        }
        setDmText('');
      }
    } catch (error) {
      console.error("Error analizando con IA:", error);
      alert("No se pudo analizar el mensaje.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const openLocalPaymentModal = () => {
    if(cart.some(item => item.needs_variant)) {
      alert("Por favor selecciona las variantes faltantes en los productos marcados en rojo en el carrito.");
      return;
    }
    setIsLocalPaymentModalOpen(true);
    setAmountReceived('');
  };

  const openShippingModal = () => {
    if(cart.some(item => item.needs_variant)) {
      alert("Por favor selecciona las variantes faltantes en los productos marcados en rojo en el carrito.");
      return;
    }
    setIsShippingModalOpen(true);
  };

  const confirmLocalPayment = () => {
    let change = 0;
    if (localPaymentMethod === 'Efectivo') {
        const received = parseFloat(amountReceived) || 0;
        if (received < total) {
            alert("El monto recibido es menor al total.");
            return;
        }
        change = received - total;
    }
    submitSale('local', {
        payment_method: localPaymentMethod,
        amount_received: localPaymentMethod === 'Efectivo' ? parseFloat(amountReceived) : total,
        change: change,
        payment_status: 'Pagado'
    });
  };

  const confirmShipping = () => {
    if(!shippingAddress || !shippingPhone) {
        alert("La dirección y el teléfono son obligatorios para enviar.");
        return;
    }
    submitSale('shipping', {
        shipping_address: shippingAddress,
        shipping_phone: shippingPhone,
        shipping_cost: parseFloat(shippingCost) || 0,
        payment_status: shippingPaymentStatus
    });
  };

  const submitSale = async (type, extraData = {}) => {
    const payload = {
      customer_id: selectedCustomer?.id || null,
      customer_name: customerName,
      customer_phone: shippingPhone,
      sale_type: type,
      items: cart.map(item => ({
        variant_id: item.variant_id,
        quantity: item.qty,
        price: item.price
      })),
      ...extraData
    };

    const targetRoute = type === 'shipping' ? route('sales.storeDelivery') : route('sales.store');

    try {
      await router.post(targetRoute, payload, {
        onSuccess: (page) => {
          setCart([]);
          setCustomerName('');
          setIsLocalPaymentModalOpen(false);
          setIsShippingModalOpen(false);
          
          if(page.props.flash && page.props.flash.sale) {
              setLastSaleData(page.props.flash.sale);
              setReceiptPhone(type === 'shipping' ? shippingPhone : '');
              setIsReceiptModalOpen(true);
          }
        }
      });
    } catch (error) {
      console.error(error);
    }
  };

  const enviarTicketWhatsApp = () => {
    if (!receiptPhone) {
      alert("Por favor ingresa un número de teléfono.");
      return;
    }
    if (!lastSaleData) return;

    let text = '';
    const name = lastSaleData.customer_name || 'Cliente';

    if (lastSaleData.sale_type === 'shipping') {
        let itemsText = lastSaleData.details.map(detail => {
          const v = detail.product_variant || {};
          const p = v.product || {};
          const desc = `${p.name || 'Producto'} ${v.size ? v.size : ''} ${v.color ? v.color : ''}`.trim();
          const subtotal = (parseFloat(detail.selling_price) * detail.quantity).toFixed(2);
          return `- ${detail.quantity}x ${desc} ... Q ${subtotal}`;
        }).join('\n');

        const shippingCost = parseFloat(lastSaleData.shipping_cost || 0);
        const cartTotal = parseFloat(lastSaleData.total) - shippingCost; // Because in Delivery the total includes shipping
        const totalText = parseFloat(lastSaleData.total).toFixed(2);
        
        text = `*¡Hola ${name}! Hemos recibido tu pedido* 📦
-----------------------------------
*Orden No:* ${lastSaleData.id.toString().padStart(6, '0')}
*Dirección:* ${lastSaleData.shipping_address}

*Detalle:*
${itemsText}
*Envío:* Q ${shippingCost.toFixed(2)}
-----------------------------------
*TOTAL A PAGAR AL RECIBIR:* Q ${totalText}
*Estado:* Empacando / Agendado ⏳`;

    } else {
        let itemsText = lastSaleData.details.map(detail => {
          const v = detail.product_variant || {};
          const p = v.product || {};
          const desc = `${p.name || 'Producto'} ${v.size ? v.size : ''} ${v.color ? v.color : ''}`.trim();
          const subtotal = (parseFloat(detail.selling_price) * detail.quantity).toFixed(2);
          return `- ${detail.quantity}x ${desc} ... Q ${subtotal}`;
        }).join('\n');

        let totalText = parseFloat(lastSaleData.total).toFixed(2);
        
        text = `*¡Gracias por tu compra en VariedadesPOS!* 🛍️\n-----------------------------------\n*Ticket No:* ${lastSaleData.id.toString().padStart(6, '0')}\n*Fecha:* ${new Date(lastSaleData.created_at).toLocaleString()}\n\n*Detalle:*\n${itemsText}\n-----------------------------------\n*TOTAL PAGADO:* Q ${totalText}`;
    }

    const encodedText = encodeURIComponent(text);
    const numericPhone = receiptPhone.replace(/\D/g, '');
    const url = `https://wa.me/502${numericPhone}?text=${encodedText}`;

    window.open(url, '_blank');
  };

  const updateQty = (cartItemId, delta) => {
    setCart(cart.map(item => {
      if (item.cartItemId === cartItemId) {
        const newQty = Math.max(1, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6">
      {/* PANEL IZQUIERDO: CATÁLOGO DE PRODUCTOS */}
      <div className="w-full lg:w-[65%] bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col relative z-0">
        <h2 className="text-lg font-bold text-slate-800 mb-3">Catálogo de Productos</h2>
        <div className="relative mb-4">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Escanear código o buscar..." className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:border-indigo-500 text-sm outline-none transition-all" />
        </div>
        
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 overflow-y-auto pr-2 pb-4">
          {inventory.map(item => {
            const totalStock = item.variants ? item.variants.reduce((sum, v) => sum + v.stock, 0) : item.stock || 0;
            return (
              <div key={item.id} onClick={() => handleProductClick(item)} className="border border-slate-200 rounded-lg p-2 cursor-pointer hover:border-indigo-500 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group bg-white flex flex-col">
                <div className="w-full aspect-square mb-2 text-center bg-slate-50 rounded flex items-center justify-center overflow-hidden">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-6 h-6 text-slate-300" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-700 text-xs leading-tight mb-1 line-clamp-2">{item.name}</h3>
                </div>
                <div className="flex flex-col gap-1 mt-1">
                  <p className="text-indigo-600 font-extrabold text-xs">Desde Q {Math.min(...(item.variants?.length ? item.variants.map(v => parseFloat(v.selling_price)) : [parseFloat(item.price || 0)])).toFixed(2)}</p>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full self-start ${totalStock > 3 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    Stk: {totalStock}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* PANEL DERECHO: CARRITO Y ASISTENTE IA */}
      <div className="w-full lg:w-[35%] flex flex-col gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-inner relative z-10">
        
        {/* ASISTENTE DM */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl shadow-lg p-4 relative overflow-hidden shrink-0 text-white">
          <Sparkles className="absolute -right-4 -bottom-4 w-20 h-20 text-indigo-400 opacity-20" />
          <h3 className="font-bold mb-1 flex items-center relative z-10 text-sm text-white">
            <MessageCircle className="w-4 h-4 mr-2 text-indigo-200" /> Venta IA
          </h3>
          <div className="relative z-10">
            <textarea 
              value={dmText} onChange={(e) => setDmText(e.target.value)}
              placeholder="Ej. 'Mio lino talla m negra, a nombre de luis gt'" 
              className="w-full text-xs border border-indigo-400/30 rounded-lg p-2 bg-white/10 text-white placeholder-indigo-200 focus:bg-white/20 focus:ring-1 focus:ring-white outline-none resize-none h-14 mb-2 backdrop-blur-sm"
            />
            <button 
              onClick={handleAnalyzeDM} disabled={isAnalyzing || !dmText}
              className="w-full bg-white hover:bg-slate-100 disabled:bg-white/50 disabled:text-indigo-400 text-indigo-700 text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center shadow-md"
            >
              {isAnalyzing ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Sparkles className="w-3 h-3 mr-2" />}
              {isAnalyzing ? 'Analizando...' : 'Armar Pedido'}
            </button>
          </div>
        </div>

        {/* CARRITO */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col flex-1 min-h-[300px]">
          <h3 className="font-bold text-slate-800 mb-3 flex items-center border-b border-slate-100 pb-2 text-sm">
            <ShoppingCart className="w-4 h-4 mr-2 text-indigo-500" /> Orden Actual
          </h3>
          
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
               <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cliente</label>
               <button 
                onClick={() => setIsQuickCustomerModalOpen(true)}
                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center bg-indigo-50 px-2 py-0.5 rounded transition-colors"
               >
                 <Plus className="w-2.5 h-2.5 mr-1" /> NUEVO
               </button>
            </div>
            <div className="relative">
              <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <CustomerAutocomplete 
                onSelect={(customer) => {
                  setCustomerName(customer.full_name);
                  // Guardamos el objeto cliente para el modal de logística
                  setSelectedCustomer(customer);
                }} 
                initialValue={customerName}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 mb-3 pr-1">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                <ShoppingCart className="w-10 h-10 mb-2 text-slate-300" />
                <p className="text-xs font-medium">Vacío</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.cartItemId} className={`flex flex-col bg-white p-2 rounded-lg border-2 ${item.needs_variant ? 'border-red-300 bg-red-50/30' : 'border-slate-100'} shadow-sm relative group`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-2">
                       <p className="text-xs font-bold text-slate-800 leading-tight mb-0.5">{item.name}</p>
                       {item.variant_details && (
                         <div className="mb-1.5"><small className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">{item.variant_details}</small></div>
                       )}
                       
                       <div className="flex items-center gap-2">
                          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50 shadow-sm">
                            <button onClick={() => updateQty(item.cartItemId, -1)} className="px-3 py-1 hover:bg-slate-200 text-slate-500 transition-colors font-bold text-sm">-</button>
                            <input 
                              type="number" 
                              min="1" 
                              value={item.qty} 
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 1;
                                setCart(cart.map(c => c.cartItemId === item.cartItemId ? { ...c, qty: Math.max(1, val) } : c));
                              }}
                              className="w-12 px-1 py-1 bg-white text-sm font-black text-slate-800 text-center border-x border-slate-200 outline-none focus:bg-indigo-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <button onClick={() => updateQty(item.cartItemId, 1)} className="px-3 py-1 hover:bg-slate-200 text-slate-500 transition-colors font-bold text-sm">+</button>
                          </div>
                          
                          {!item.needs_variant && (
                            <span className="text-xs text-slate-500 font-medium">Q {item.price.toFixed(2)}</span>
                          )}
                       </div>

                        {item.needs_variant && (
                          <div className="mt-1.5">
                            <span className="inline-flex items-center text-[9px] font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded border border-red-200 animate-pulse">
                              ¡Falta Variante!
                            </span>
                            <button onClick={() => openVariantSelectorForCartItem(item)} className="block mt-0.5 text-[10px] text-indigo-600 font-bold hover:underline">Elegir &rarr;</button>
                          </div>
                        )}
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <p className="text-xs font-black text-slate-800">Q {(item.price * item.qty).toFixed(2)}</p>
                      <button onClick={() => removeFromCart(item.cartItemId)} className="text-slate-300 hover:text-red-500 mt-2 p-1 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-3 border-t border-slate-200 mt-auto shrink-0 bg-white">
            <div className="flex justify-between items-center mb-3">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Total</span>
              <span className="text-xl font-black text-indigo-600">Q {total.toFixed(2)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={openLocalPaymentModal} disabled={cart.length===0} className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-2 rounded-lg flex justify-center items-center h-10 text-xs transition-all shadow-md shadow-indigo-100">
                <Store className="w-3.5 h-3.5 mr-1.5" /> Cobrar Local
              </button>
              <button onClick={openShippingModal} disabled={cart.length===0} className="bg-white border-2 border-indigo-600 hover:bg-indigo-50 disabled:border-slate-200 disabled:text-slate-400 text-indigo-700 font-bold py-2 rounded-lg flex justify-center items-center h-10 text-xs transition-all">
                <Truck className="w-3.5 h-3.5 mr-1.5" /> Enviar Pedido
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* --- MODAL DE SELECCIÓN DE VARIANTE --- */}
      {selectedProductForVariant && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden" onClick={() => setSelectedProductForVariant(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col transform scale-100 transition-transform" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-base">Elegir Variante</h3>
              <button onClick={() => setSelectedProductForVariant(null)} className="text-slate-400 hover:text-slate-600 bg-white shadow-sm p-1 rounded-full text-xs">✕</button>
            </div>
            <div className="p-5 overflow-y-auto max-h-[60vh]">
              <div className="flex items-center mb-4">
                 <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mr-3 shrink-0">
                   {selectedProductForVariant.image_url ? <img src={selectedProductForVariant.image_url} className="w-full h-full object-cover rounded-lg" /> : <Package className="w-6 h-6 text-slate-300" />}
                 </div>
                 <div>
                   <h4 className="font-bold text-slate-800 text-sm">{selectedProductForVariant.name}</h4>
                   <p className="text-[10px] text-slate-500">Selecciona talla o color:</p>
                 </div>
              </div>
              
              <div className="space-y-2">
                {selectedProductForVariant.variants && selectedProductForVariant.variants.filter(v => v.stock > 0).map(v => (
                  <div key={v.id} onClick={() => addToCartVariant(selectedProductForVariant, v)} className="border-2 border-slate-100 hover:border-indigo-500 rounded-lg p-2.5 flex justify-between items-center cursor-pointer transition-all hover:bg-indigo-50/30 group">
                    <div>
                      <p className="font-bold text-slate-700 text-xs group-hover:text-indigo-800">{v.size || 'N/A'} - {v.color || 'N/A'}</p>
                      <p className="text-[9px] text-slate-400 font-mono">SKU: {v.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-indigo-600 text-sm">Q {parseFloat(v.selling_price).toFixed(2)}</p>
                      <p className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded inline-block mt-0.5">Stock: {v.stock}</p>
                    </div>
                  </div>
                ))}
                {selectedProductForVariant.variants && selectedProductForVariant.variants.filter(v => v.stock > 0).length === 0 && (
                   <div className="text-center p-4 bg-red-50 rounded-lg border border-red-100">
                     <p className="font-bold text-red-600 text-xs">Agotado</p>
                   </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DE COBRO LOCAL --- */}
      {isLocalPaymentModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="px-5 py-4 bg-indigo-600 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center"><Store className="w-5 h-5 mr-2" /> Procesar Pago</h3>
              <button onClick={() => setIsLocalPaymentModalOpen(false)} className="text-indigo-200 hover:text-white"><Plus className="w-5 h-5 rotate-45" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase">Total a Cobrar</p>
                <p className="text-3xl font-black text-indigo-700">Q {total.toFixed(2)}</p>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Método de Pago</label>
                <select value={localPaymentMethod} onChange={e => setLocalPaymentMethod(e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg p-3 outline-none focus:border-indigo-500 shadow-sm font-medium text-slate-700">
                  <option value="Efectivo">Efectivo 💵</option>
                  <option value="Tarjeta">Tarjeta de Crédito/Débito 💳</option>
                  <option value="Transferencia">Transferencia Bancaria 🏦</option>
                </select>
              </div>

              {localPaymentMethod === 'Efectivo' && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Monto Recibido</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">Q</span>
                    <input 
                      type="number" 
                      min={total}
                      step="0.01"
                      value={amountReceived} 
                      onChange={e => setAmountReceived(e.target.value)}
                      placeholder="0.00" 
                      className="w-full pl-9 pr-4 py-3 border border-slate-300 rounded-lg bg-white outline-none focus:border-indigo-500 text-lg font-bold shadow-sm"
                    />
                  </div>
                  {(parseFloat(amountReceived) > total) && (
                    <div className="mt-3 flex justify-between items-center bg-emerald-50 text-emerald-700 p-3 rounded-lg border border-emerald-200">
                      <span className="text-xs font-bold uppercase">Su Cambio:</span>
                      <span className="text-lg font-black">Q {(parseFloat(amountReceived) - total).toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )}

              <button 
                onClick={confirmLocalPayment}
                disabled={localPaymentMethod === 'Efectivo' && (!amountReceived || parseFloat(amountReceived) < total)}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold py-3.5 rounded-xl shadow-md transition-colors flex justify-center items-center text-sm"
              >
                <CheckCircle2 className="w-5 h-5 mr-2" /> Confirmar Pago
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DE ENVIAR PEDIDO --- */}
      {isShippingModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-5 py-4 bg-indigo-600 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center"><Truck className="w-5 h-5 mr-2" /> Datos de Envío</h3>
              <button onClick={() => setIsShippingModalOpen(false)} className="text-indigo-200 hover:text-white"><Plus className="w-5 h-5 rotate-45" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-indigo-50 p-3 rounded-lg text-center border border-indigo-100 mb-2">
                <span className="text-sm font-bold text-indigo-700">Subtotal: Q {total.toFixed(2)}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre</label>
                  <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none shadow-sm text-sm" placeholder="Opcional" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Teléfono</label>
                  <input type="text" maxLength="8" value={shippingPhone} onChange={e => setShippingPhone(e.target.value.replace(/\D/g, ''))} className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none shadow-sm text-sm" placeholder="Ej. 55551111" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Dirección de Entrega</label>
                <textarea rows="2" value={shippingAddress} onChange={e => setShippingAddress(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none resize-none shadow-sm text-sm" placeholder="Avenida, Zona, Municipio..."></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Estado de Pago</label>
                  <select value={shippingPaymentStatus} onChange={e => setShippingPaymentStatus(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none shadow-sm text-sm font-medium">
                    <option value="Pago Contra Entrega">Contra Entrega</option>
                    <option value="Pagado">Ya Pagado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Costo Envío (Q)</label>
                  <input type="number" step="0.01" value={shippingCost} onChange={e => setShippingCost(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none shadow-sm text-sm font-bold text-indigo-700" placeholder="0.00" />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="font-bold text-slate-600">Total a Cobrar:</span>
                <span className="text-2xl font-black text-indigo-700">Q {(total + (parseFloat(shippingCost) || 0)).toFixed(2)}</span>
              </div>

              <button 
                onClick={confirmShipping}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-colors flex justify-center items-center text-sm mt-4"
              >
                <Truck className="w-5 h-5 mr-2" /> Confirmar Envío
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DE RECIBO / TICKET (TÉRMICA) --- */}
      {isReceiptModalOpen && lastSaleData && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-dashed border-slate-300 print:hidden bg-slate-100">
              <h3 className="font-bold text-slate-700">Ticket Generado</h3>
              <button onClick={() => setIsReceiptModalOpen(false)} className="text-slate-500 hover:text-slate-800"><Plus className="w-6 h-6 rotate-45" /></button>
            </div>
            
            {/* AREA DE IMPRESIÓN */}
            <div id="ticket-imprimible" className="bg-white p-6 w-[80mm] min-h-[100mm] mx-auto overflow-y-auto max-h-[60vh] text-black font-mono text-sm leading-tight border-b-2 border-r-2 border-slate-200" style={{ textRendering: 'geometricPrecision', WebkitFontSmoothing: 'none' }}>
              <div className="text-center mb-4">
                <h2 className="font-bold text-xl uppercase mb-1">Variedades POS</h2>
                <p className="text-xs">Tienda y Boutiqué Múltiple</p>
                <p className="text-xs">Tel: 1234-5678</p>
                <div className="border-t border-b border-black py-1 my-2">
                  <p className="font-bold text-sm">TICKET #{lastSaleData.id.toString().padStart(6, '0')}</p>
                  <p className="text-xs">{new Date(lastSaleData.created_at).toLocaleString()}</p>
                </div>
              </div>

              <div className="mb-3 text-xs">
                <p><strong>Cliente:</strong> {lastSaleData.customer_name || 'Venta de Mostrador'}</p>
                <p><strong>Tipo:</strong> {lastSaleData.sale_type === 'local' ? 'Local' : 'Envio'}</p>
                {lastSaleData.sale_type === 'shipping' && (
                   <>
                     <p><strong>Tel Envío:</strong> {lastSaleData.shipping_phone}</p>
                     <p><strong>Dirección:</strong> {lastSaleData.shipping_address}</p>
                   </>
                )}
              </div>

              <div className="border-t border-black border-dashed pt-2 mb-2">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-black">
                      <th className="text-left py-1">Cant</th>
                      <th className="text-left py-1">Descripción</th>
                      <th className="text-right py-1">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lastSaleData.details.map(detail => {
                       const v = detail.product_variant || {};
                       const p = v.product || {};
                       const desc = `${p.name || 'Producto'} ${v.size ? v.size : ''} ${v.color ? v.color : ''}`;
                       return (
                        <tr key={detail.id} className="border-b border-dotted border-slate-300">
                          <td className="py-2 align-top text-center">{detail.quantity}</td>
                          <td className="py-2 pr-2">{desc}</td>
                          <td className="py-2 text-right align-top">{(parseFloat(detail.selling_price) * detail.quantity).toFixed(2)}</td>
                        </tr>
                       )
                    })}
                  </tbody>
                </table>
              </div>

              <div className="space-y-1 text-sm font-bold text-right py-2">
                 <div className="flex justify-between">
                   <span>Subtotal:</span>
                   <span>Q {parseFloat(lastSaleData.total).toFixed(2)}</span>
                 </div>
                 {lastSaleData.sale_type === 'shipping' && (
                   <div className="flex justify-between">
                     <span>Envío:</span>
                     <span>Q {parseFloat(lastSaleData.shipping_cost || 0).toFixed(2)}</span>
                   </div>
                 )}
                 <div className="flex justify-between text-base border-t border-black pt-1">
                   <span>TOTAL:</span>
                   <span>Q {(parseFloat(lastSaleData.total) + parseFloat(lastSaleData.shipping_cost || 0)).toFixed(2)}</span>
                 </div>
              </div>

              <div className="border-t border-black border-dashed py-2 text-xs">
                 <p className="flex justify-between"><span>Pago vía:</span> <span>{lastSaleData.payment_method || (lastSaleData.sale_type === 'shipping' ? lastSaleData.payment_status : 'N/A')}</span></p>
                 {lastSaleData.amount_received > 0 && (
                   <>
                     <p className="flex justify-between"><span>Su Pago:</span> <span>Q {parseFloat(lastSaleData.amount_received).toFixed(2)}</span></p>
                     <p className="flex justify-between"><span>Cambio:</span> <span>Q {parseFloat(lastSaleData.change || 0).toFixed(2)}</span></p>
                   </>
                 )}
              </div>

              <div className="text-center mt-6 text-xs italic">
                 <p>¡Gracias por su compra!</p>
                 <p>Conserve su ticket para garantías</p>
              </div>
            </div>
            
            <div className="p-4 bg-slate-100 border-t border-slate-300 print:hidden flex flex-col gap-3">
              <div className="flex gap-2">
                <input 
                  type="tel" 
                  maxLength="8"
                  value={receiptPhone}
                  onChange={e => setReceiptPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="Número cliente (ej. 55551111)" 
                  className="w-1/3 border border-slate-300 text-slate-700 rounded-lg px-3 outline-none focus:border-green-500 text-sm"
                />
                <button 
                  onClick={enviarTicketWhatsApp}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg flex justify-center items-center shadow-md transition-colors text-base"
                >
                  📱 Enviar por WhatsApp
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => {
                  const printContent = document.getElementById('ticket-imprimible').innerHTML;
                  const originalContent = document.body.innerHTML;
                  document.title = "Ticket " + lastSaleData.id;
                  document.body.innerHTML = `<div style="width: 80mm; font-family: monospace; color: black; background: white; margin: 0; padding: 0;">${printContent}</div>`;
                  window.print();
                  document.body.innerHTML = originalContent;
                  window.location.reload(); 
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex justify-center items-center shadow-md transition-colors text-base"
              >
                🖨️ Imprimir Ticket
              </button>
              <button 
                onClick={() => setIsReceiptModalOpen(false)}
                className="bg-slate-200 hover:bg-slate-300 border border-slate-300 text-slate-700 font-bold py-3 rounded-lg transition-colors text-base"
              >
                Nueva Venta
              </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* --- MODAL DE CLIENTE RÁPIDO --- */}
      {isQuickCustomerModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="px-5 py-4 bg-indigo-600 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center"><UserPlus className="w-5 h-5 mr-2" /> Nuevo Cliente Rápido</h3>
              <button onClick={() => setIsQuickCustomerModalOpen(false)} className="text-indigo-200 hover:text-white"><Plus className="w-5 h-5 rotate-45" /></button>
            </div>
            <form onSubmit={handleQuickCustomerSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre Completo</label>
                <input 
                  type="text" 
                  required
                  value={quickCustomerData.full_name} 
                  onChange={e => setQuickCustomerData({...quickCustomerData, full_name: e.target.value})} 
                  placeholder="Ej. Juan Pérez" 
                  className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none shadow-sm text-sm" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Red Social</label>
                  <input 
                    type="text" 
                    value={quickCustomerData.social_handle} 
                    onChange={e => setQuickCustomerData({...quickCustomerData, social_handle: e.target.value})} 
                    placeholder="@usuario" 
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none shadow-sm text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Teléfono</label>
                  <input 
                    type="tel" 
                    maxLength="8"
                    value={quickCustomerData.phone} 
                    onChange={e => setQuickCustomerData({...quickCustomerData, phone: e.target.value.replace(/\D/g, '')})} 
                    placeholder="88887777" 
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none shadow-sm text-sm" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Dirección de Envío</label>
                <textarea 
                  rows="2" 
                  value={quickCustomerData.default_address} 
                  onChange={e => setQuickCustomerData({...quickCustomerData, default_address: e.target.value})} 
                  placeholder="Ciudad, Zona, etc..." 
                  className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none resize-none shadow-sm text-sm"
                ></textarea>
              </div>
              
              <button 
                type="submit"
                disabled={isSavingQuickCustomer}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl shadow-md transition-colors flex justify-center items-center text-sm"
              >
                {isSavingQuickCustomer ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <UserPlus className="w-5 h-5 mr-2" />}
                Guardar y Seleccionar
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// 5. CLIENTES VIEW
function CustomersView({ customers }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const customerForm = useForm({
    full_name: '',
    social_handle: '',
    phone: '',
    email: '',
    default_address: '',
    notes: ''
  });
  const { data, setData, post, put, processing, reset } = customerForm;
  const destroy = customerForm.delete;

  const filteredCustomers = customers.filter(c => 
    c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (c.social_handle && c.social_handle.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (c.phone && c.phone.includes(searchQuery))
  );

  const openAddModal = () => { setEditingCustomer(null); reset(); setIsModalOpen(true); };
  
  const openEditModal = (customer) => {
    setEditingCustomer(customer);
    setData({
      full_name: customer.full_name,
      social_handle: customer.social_handle || '',
      phone: customer.phone || '',
      email: customer.email || '',
      default_address: customer.default_address || '',
      notes: customer.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingCustomer) {
      put(route('customers.update', editingCustomer.id), { onSuccess: () => setIsModalOpen(false) });
    } else {
      post(route('customers.store'), { onSuccess: () => { setIsModalOpen(false); reset(); } });
    }
  };

  const handleDelete = (id) => {
    if (confirm('¿Estás seguro de eliminar este cliente?')) destroy(route('customers.destroy', id));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
      <div className="p-6 border-b border-slate-200 flex flex-wrap gap-4 justify-between items-center bg-slate-50 rounded-t-xl">
        <div className="flex space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Buscar cliente..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:border-indigo-500 outline-none w-64 shadow-sm transition-all" />
          </div>
        </div>
        <button onClick={openAddModal} className="flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> Nuevo Cliente
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-500 text-sm border-b border-slate-200">
              <th className="px-6 py-4 font-medium">Cliente</th>
              <th className="px-6 py-4 font-medium">Contacto</th>
              <th className="px-6 py-4 font-medium">Dirección</th>
              <th className="px-6 py-4 font-medium text-center">Compras</th>
              <th className="px-6 py-4 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredCustomers.map(customer => (
              <tr key={customer.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold mr-3">
                      {customer.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{customer.full_name}</p>
                      {customer.social_handle && <p className="text-xs text-indigo-500 font-medium">{customer.social_handle}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  <p>{customer.phone || 'S/N'}</p>
                  <p className="text-xs text-slate-400">{customer.email || ''}</p>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">
                  {customer.default_address || 'S/D'}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded text-xs font-bold">
                    {customer.sales_count || 0}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEditModal(customer)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(customer.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredCustomers.length === 0 && (
              <tr>
                <td colSpan="5" className="py-12 text-center text-slate-400">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No se encontraron clientes.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-slate-800 text-lg">{editingCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><Plus className="w-6 h-6 rotate-45" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[80vh]">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nombre Completo</label>
                <input type="text" value={data.full_name} onChange={e => setData('full_name', e.target.value)} required placeholder="Ej. Juan Pérez" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white focus:border-indigo-500 outline-none" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Usuario / Social</label>
                  <input type="text" value={data.social_handle} onChange={e => setData('social_handle', e.target.value)} placeholder="Ej. @juanito" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Teléfono</label>
                  <input 
                    type="tel" 
                    maxLength="8"
                    value={data.phone} 
                    onChange={e => setData('phone', e.target.value.replace(/\D/g, ''))} 
                    placeholder="88887777" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white focus:border-indigo-500 outline-none" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Email</label>
                <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} placeholder="ejemplo@correo.com" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white focus:border-indigo-500 outline-none" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Dirección Predeterminada</label>
                <textarea rows="2" value={data.default_address} onChange={e => setData('default_address', e.target.value)} placeholder="Zona 1, Ciudad..." className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white focus:border-indigo-500 outline-none resize-none" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Notas / Preferencias</label>
                <textarea rows="2" value={data.notes} onChange={e => setData('notes', e.target.value)} placeholder="Talla S, siempre pide envío..." className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white focus:border-indigo-500 outline-none resize-none" />
              </div>

              <div className="pt-4 flex space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50">Cancelar</button>
                <button type="submit" disabled={processing} className="flex-1 px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700">Guardar Cliente</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// 6. COMPONENTE AUTOCOMPLETE
function CustomerAutocomplete({ onSelect, initialValue = '' }) {
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  const handleSearch = async (val) => {
    setQuery(val);
    if (val.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/customers/search?q=${encodeURIComponent(val)}`);
      const data = await response.json();
      setResults(data);
      setShowResults(true);
    } catch (error) {
      console.error("Error searching customers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full">
      <input 
        type="text" 
        value={query} 
        onChange={e => handleSearch(e.target.value)} 
        onFocus={() => query.length >= 2 && setShowResults(true)}
        placeholder="Nombre o @usuario" 
        className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-indigo-500 transition-all" 
      />
      {isLoading && <Loader2 className="w-3 h-3 absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-slate-400" />}
      
      {showResults && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
          {results.map(c => (
            <div 
              key={c.id} 
              onClick={() => {
                onSelect(c);
                setQuery(c.full_name);
                setShowResults(false);
              }}
              className="p-2 hover:bg-indigo-50 cursor-pointer border-b border-slate-100 last:border-0"
            >
              <p className="font-bold text-xs text-slate-800">{c.full_name}</p>
              <p className="text-[10px] text-slate-500">{c.social_handle || c.phone || ''}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 7. PROVEEDORES VIEW
function SuppliersView({ suppliers }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const supplierForm = useForm({
    name: '',
    nit: '',
    phone: '',
    email: '',
    address: '',
    contact_info: ''
  });
  const { data, setData, post, put, processing, reset } = supplierForm;
  const destroy = supplierForm.delete;

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (s.contact_info && s.contact_info.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const openAddModal = () => { setEditingSupplier(null); reset(); setIsModalOpen(true); };
  
  const openEditModal = (supplier) => {
    setEditingSupplier(supplier);
    setData({
      name: supplier.name,
      nit: supplier.nit || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
      contact_info: supplier.contact_info || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingSupplier) {
      put(route('suppliers.update', editingSupplier.id), { onSuccess: () => setIsModalOpen(false) });
    } else {
      post(route('suppliers.store'), { onSuccess: () => { setIsModalOpen(false); reset(); } });
    }
  };

  const handleDelete = (id) => {
    if (confirm('¿Estás seguro de eliminar este proveedor?')) destroy(route('suppliers.destroy', id));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
      <div className="p-6 border-b border-slate-200 flex flex-wrap gap-4 justify-between items-center bg-slate-50 rounded-t-xl">
        <div className="flex space-x-3 items-center">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Buscar proveedor..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:border-indigo-500 outline-none w-64 shadow-sm transition-all" />
          </div>
          <div className="flex items-center space-x-2 ml-4">
             <a 
               href={route('suppliers.export-pdf')} 
               target="_blank"
               className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
               title="Exportar PDF"
             >
               <Printer className="w-5 h-5" />
             </a>
             <a 
               href={route('suppliers.export-excel')} 
               target="_blank"
               className="p-2 bg-white border border-slate-200 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors shadow-sm"
               title="Exportar Excel"
             >
               <FileSpreadsheet className="w-5 h-5" />
             </a>
          </div>
        </div>
        <button onClick={openAddModal} className="flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> Nuevo Proveedor
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSuppliers.map(supplier => (
            <div key={supplier.id} className="border border-slate-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-md transition-all bg-white group flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 font-bold text-xl mr-4 shrink-0 shadow-inner">
                    {supplier.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg leading-tight">{supplier.name}</h3>
                    <div className="mt-2 space-y-1">
                      {supplier.nit && <p className="text-xs font-medium text-slate-500 flex items-center"><span className="font-bold text-indigo-500 mr-1">NIT:</span> {supplier.nit}</p>}
                      {supplier.phone && <p className="text-xs font-medium text-slate-500 flex items-center"><span className="font-bold text-indigo-500 mr-1">TEL:</span> {supplier.phone}</p>}
                      {supplier.email && <p className="text-xs font-medium text-slate-500 flex items-center"><span className="font-bold text-indigo-500 mr-1">@:</span> {supplier.email}</p>}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEditModal(supplier)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(supplier.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
          {filteredSuppliers.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400 flex flex-col items-center">
              <Store className="w-12 h-12 mb-3 opacity-20" />
              <p>No se encontraron proveedores.</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-slate-800 text-lg">{editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><Plus className="w-6 h-6 rotate-45" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nombre Comercial / Razón Social</label>
                <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} required placeholder="Ej. Distribuidora Central" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white focus:border-indigo-500 outline-none" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">NIT</label>
                  <input type="text" value={data.nit} onChange={e => setData('nit', e.target.value)} placeholder="Ej. 1234567-8" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Teléfono / WhatsApp</label>
                  <input type="tel" value={data.phone} onChange={e => setData('phone', e.target.value)} placeholder="Ej. 5555-5555" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white focus:border-indigo-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Correo Electrónico</label>
                <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} placeholder="ejemplo@correo.com" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white focus:border-indigo-500 outline-none" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Dirección Física</label>
                <textarea rows="3" value={data.address} onChange={e => setData('address', e.target.value)} placeholder="Calle 1-23, Zona 1..." className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white focus:border-indigo-500 outline-none resize-none" />
              </div>
              <div className="pt-4 flex space-x-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50">Cancelar</button>
                <button type="submit" disabled={processing} className="flex-1 px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700">Guardar Detalles</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// 6. REPORTES VIEW
function ReportsView() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [metrics, setMetrics] = useState({
    ingresos: 0,
    costos: 0,
    gastos: 0,
    utilidad: 0,
    utilidad_neta: 0,
    top_products: [],
    top_customers: [],
    logistics: {
      delivered: 0,
      failed: 0,
      total: 0,
      success_rate: 100
    },
    mes: 'Cargando...'
  });
  const [loading, setLoading] = useState(true);

  const months = [
    { value: 1, label: 'Enero' }, { value: 2, label: 'Febrero' }, { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' }, { value: 5, label: 'Mayo' }, { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' }, { value: 8, label: 'Agosto' }, { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' }, { value: 11, label: 'Noviembre' }, { value: 12, label: 'Diciembre' }
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  useEffect(() => {
    setLoading(true);
    fetch(route('reports.metrics', { month: selectedMonth, year: selectedYear }))
      .then(res => res.json())
      .then(data => {
        setMetrics(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching metrics:", err);
        setLoading(false);
      });
  }, [selectedMonth, selectedYear]);

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Panel de Control de Negocio</h2>
          <p className="text-slate-500">Métricas correspondientes a: <span className="font-bold text-slate-700 capitalize">{metrics.mes}</span></p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
            <Filter className="w-4 h-4 text-slate-400 mr-2" />
            <select 
              value={selectedMonth} 
              onChange={e => setSelectedMonth(e.target.value)}
              className="bg-transparent border-none text-sm font-medium focus:ring-0"
            >
              {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <select 
              value={selectedYear} 
              onChange={e => setSelectedYear(e.target.value)}
              className="bg-transparent border-none text-sm font-medium focus:ring-0 ml-1 border-l border-slate-200"
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <button onClick={() => window.location.reload()} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">
            <Loader2 className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Row 1: Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Ingresos Card */}
        <div className="bg-white rounded-xl shadow-sm border border-emerald-100 overflow-hidden relative lg:col-span-1">
          <div className="p-5">
            <h3 className="text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-2">Total Ingresos</h3>
            <div className="text-2xl font-black text-emerald-600">
              Q <span className={loading ? "animate-pulse" : ""}>{parseFloat(metrics.ingresos).toLocaleString()}</span>
            </div>
            <p className="text-[10px] text-emerald-700 mt-1">Bruto mensual</p>
          </div>
        </div>

        {/* Costos Card */}
        <div className="bg-white rounded-xl shadow-sm border border-rose-100 overflow-hidden lg:col-span-1">
          <div className="p-5">
            <h3 className="text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-2">Costo Inventario</h3>
            <div className="text-2xl font-black text-rose-600">
              Q <span className={loading ? "animate-pulse" : ""}>{parseFloat(metrics.costos).toLocaleString()}</span>
            </div>
            <p className="text-[10px] text-rose-700 mt-1">Costo de ventas (PMP)</p>
          </div>
        </div>

        {/* Utilidad Bruta */}
        <div className="bg-white rounded-xl shadow-sm border border-indigo-100 overflow-hidden lg:col-span-1">
          <div className="p-5">
            <h3 className="text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-2">Utilidad Bruta</h3>
            <div className="text-2xl font-black text-indigo-600">
              Q <span className={loading ? "animate-pulse" : ""}>{parseFloat(metrics.utilidad).toLocaleString()}</span>
            </div>
            <p className="text-[10px] text-indigo-700 mt-1">Ingresos - Costos</p>
          </div>
        </div>

        {/* Gastos Operativos */}
        <div className="bg-white rounded-xl shadow-sm border-2 border-red-50 overflow-hidden lg:col-span-1">
          <div className="p-5 bg-red-50/30">
            <h3 className="text-red-800 font-bold uppercase tracking-wider text-[10px] mb-2">Gastos Operativos</h3>
            <div className="text-2xl font-black text-red-600">
              Q <span className={loading ? "animate-pulse" : ""}>{parseFloat(metrics.gastos).toLocaleString()}</span>
            </div>
            <p className="text-[10px] text-red-700 mt-1">Suma de egresos</p>
          </div>
        </div>

        {/* Utilidad Neta (Destacada) */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl shadow-lg border-2 border-indigo-400 overflow-hidden lg:col-span-1 text-white">
          <div className="p-5 relative overflow-hidden">
            <ArrowUpRight className="absolute -right-2 -top-2 w-16 h-16 opacity-10" />
            <h3 className="text-indigo-100 font-bold uppercase tracking-wider text-[10px] mb-2">UTILIDAD NETA</h3>
            <div className="text-2xl font-black text-white">
              Q <span className={loading ? "animate-pulse" : ""}>{parseFloat(metrics.utilidad_neta).toLocaleString()}</span>
            </div>
            <p className="text-[10px] text-indigo-200 mt-1">Balance final real</p>
          </div>
        </div>
      </div>

      {/* Row 2: Top Products and Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center">
              <Package className="w-4 h-4 mr-2 text-indigo-500" />
              Productos Más Vendidos
            </h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Top 5</span>
          </div>
          <div className="p-0">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400">
                  <th className="px-6 py-3">Producto / Variante</th>
                  <th className="px-6 py-3 text-right">Cantidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {metrics.top_products?.map((p, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">{p.name}</td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-indigo-600">{p.quantity} uds</td>
                  </tr>
                ))}
                {!loading && metrics.top_products?.length === 0 && (
                  <tr><td colSpan="2" className="px-6 py-10 text-center text-slate-400 italic text-sm">No hay datos de ventas este mes</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center">
              <Users className="w-4 h-4 mr-2 text-emerald-500" />
              Mejores Clientes (VIP)
            </h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Top 5</span>
          </div>
          <div className="p-0">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400">
                  <th className="px-6 py-3">Cliente / Usuario</th>
                  <th className="px-6 py-3 text-right">Inversión Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {metrics.top_customers?.map((c, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">{c.name}</td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-emerald-600">Q {parseFloat(c.total).toLocaleString()}</td>
                  </tr>
                ))}
                {!loading && metrics.top_customers?.length === 0 && (
                  <tr><td colSpan="2" className="px-6 py-10 text-center text-slate-400 italic text-sm">No hay datos de clientes este mes</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Row 3: Logistics Performance */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h3 className="font-bold text-slate-800 text-lg flex items-center">
              <Truck className="w-5 h-5 mr-3 text-slate-800" />
              Efectividad Logística
            </h3>
            <p className="text-sm text-slate-500">Rendimiento de entregas y devoluciones del mes actual.</p>
          </div>
          <div className="bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 flex items-baseline gap-2">
            <span className="text-sm font-bold text-slate-400 uppercase">Éxito:</span>
            <span className={`text-3xl font-black ${metrics.logistics.success_rate >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {metrics.logistics.success_rate}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="flex justify-between items-end mb-1">
              <span className="text-sm font-bold text-slate-700">Tasa de Entrega Exitosa</span>
              <span className="text-xs font-bold text-emerald-600">{metrics.logistics.delivered} / {metrics.logistics.total}</span>
            </div>
            <div className="h-4 bg-slate-100 rounded-full overflow-hidden shadow-inner">
              <div 
                className="h-full bg-emerald-500 transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.3)]" 
                style={{ width: metrics.logistics.success_rate + '%' }}
              ></div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed italic">
              * Porcentaje basado en pedidos con estado 'Entregado' vs Fallidos (Devueltos/Cancelados).
            </p>
          </div>

          <div className="flex items-center justify-center border-x border-slate-100 px-8">
            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="text-center p-4 bg-emerald-50 rounded-xl">
                <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Entregados</p>
                <p className="text-2xl font-black text-emerald-700">{metrics.logistics.delivered}</p>
              </div>
              <div className="text-center p-4 bg-rose-50 rounded-xl">
                <p className="text-[10px] font-bold text-rose-600 uppercase mb-1">Fallidos</p>
                <p className="text-2xl font-black text-rose-700">{metrics.logistics.failed}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center">
              <div className="bg-slate-900 rounded-xl p-5 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-indigo-400 text-xs font-bold uppercase tracking-tighter mb-1">Volumen Total</p>
                  <p className="text-3xl font-black">{metrics.logistics.total}</p>
                  <p className="text-[10px] text-slate-400 mt-2">Envíos gestionados vía logística</p>
                </div>
                <Truck className="absolute -right-4 -bottom-4 w-20 h-20 text-white/5 rotate-12" />
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================
   COMPONENTES AUXILIARES (UI)
   ========================================= */

function NavItem({ id, label, icon, activeTab, setActiveTab, badge }) {
  const isActive = activeTab === id;
  return (
    <button 
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
        isActive 
          ? 'bg-indigo-600 text-white shadow-md' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
      }`}
    >
      <div className="flex items-center">
        <span className={`mr-3 ${isActive ? 'text-white' : 'text-slate-500'}`}>{icon}</span>
        <span className="font-medium text-sm">{label}</span>
      </div>
      {badge && (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
          isActive ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-700 text-slate-300'
        } ${badge === 'EN VIVO' ? 'bg-red-500/20 text-red-500' : ''}`}>
          {badge}
        </span>
      )}
    </button>
  );
}


function ExpensesView() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  
  const categories = ['Publicidad', 'Alquiler', 'Servicios', 'Suministros', 'Transporte', 'Otros'];
  
  const { data, setData, post, put, delete: destroy, processing, reset } = useForm({
    description: '',
    amount: '',
    category: 'Otros',
    expense_date: new Date().toISOString().split('T')[0]
  });

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const response = await axios.get(route('expenses.api.index'));
      setExpenses(response.data);
    } catch (error) {
      console.error("Error loading expenses", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const openEditModal = (expense) => {
    setEditingExpense(expense);
    setData({
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      expense_date: expense.expense_date
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar este gasto?')) {
      router.delete(route('expenses.destroy', id), {
        onSuccess: () => loadExpenses()
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingExpense) {
      router.put(route('expenses.update', editingExpense.id), data, {
        onSuccess: () => {
          setIsModalOpen(false);
          reset();
          loadExpenses();
          Swal.fire('¡Éxito!', 'Gasto actualizado correctamente', 'success');
        }
      });
    } else {
      router.post(route('expenses.store'), data, {
        onSuccess: () => {
          setIsModalOpen(false);
          reset();
          loadExpenses();
          Swal.fire('¡Éxito!', 'Gasto registrado correctamente', 'success');
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Control de Gastos Operativos</h2>
          <p className="text-slate-500">Registra y administra todos los egresos de la tienda</p>
        </div>
        <button 
          onClick={() => { setEditingExpense(null); reset(); setIsModalOpen(true); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center shadow-lg shadow-indigo-200 transition-all"
        >
          <PlusCircle className="w-5 h-5 mr-2" /> Nuevo Gasto
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Descripción</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Monto</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500" /></td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No hay gastos registrados en este mes.</p>
                  </td>
                </tr>
              ) : (
                expenses.map(expense => (
                  <tr key={expense.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(expense.expense_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">{expense.description}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-rose-600">
                      Q {parseFloat(expense.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(expense)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(expense.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-slate-100 border-b border-slate-200 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-slate-800 text-lg">{editingExpense ? 'Editar Gasto' : 'Registrar Nuevo Gasto'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-1 rounded-full"><XCircle className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1 tracking-wider">Descripción del Gasto</label>
                <input 
                  type="text" 
                  value={data.description} 
                  onChange={e => setData('description', e.target.value)} 
                  required 
                  placeholder="Ej. Publicidad Facebook, Bolsas, etc." 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 focus:bg-white focus:border-indigo-500 outline-none shadow-sm transition-all" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1 tracking-wider">Monto (Q)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">Q</span>
                    <input 
                      type="number" 
                      step="0.01" 
                      min="0"
                      value={data.amount} 
                      onChange={e => setData('amount', e.target.value)} 
                      required
                      placeholder="0.00" 
                      className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-rose-500 outline-none font-bold text-rose-600 shadow-sm transition-all" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1 tracking-wider">Fecha</label>
                  <input 
                    type="date" 
                    value={data.expense_date} 
                    onChange={e => setData('expense_date', e.target.value)} 
                    required 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 focus:bg-white focus:border-indigo-500 outline-none shadow-sm transition-all" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1 tracking-wider">Categoría</label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setData('category', cat)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                        data.category === cat 
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105' 
                          : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6 flex space-x-3 mt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-medium transition-colors">Cancelar</button>
                <button type="submit" disabled={processing} className="flex-1 px-6 py-2.5 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center justify-center">
                  {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : editingExpense ? 'Actualizar Gasto' : 'Confirmar Gasto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function NavExternalLink({ href, label, icon }) {
  return (
    <Link 
      href={href}
      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all duration-200"
    >
      <div className="flex items-center">
        <span className="mr-3 text-slate-500">{icon}</span>
        <span className="font-medium text-sm">{label}</span>
      </div>
      <ChevronRight size={14} className="text-slate-600 opacity-60" />
    </Link>
  );
}

// End of components
