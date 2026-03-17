import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  ShoppingBag, 
  CheckCircle2, 
  XCircle, 
  Users, 
  Printer, 
  Calendar,
  Filter,
  Loader2,
  ArrowUpRight
} from 'lucide-react';
import axios from 'axios';

export default function LiveReport() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    date: '',
    total_apartado: 0,
    total_confirmado: 0,
    total_huerfanas: 0,
    top_customers: []
  });

  const fetchMetrics = async (selectedDate) => {
    setLoading(true);
    try {
      const response = await axios.get(route('reports.live-summary', { date: selectedDate }));
      setMetrics(response.data);
    } catch (error) {
      console.error("Error fetching live summary metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics(date);
  }, [date]);

  const handlePrint = () => {
    window.open(route('reports.live-summary.pdf', { date: date }), '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Resumen del Live</h2>
          <p className="text-slate-500 text-sm">Rendimiento y métricas de la transmisión</p>
        </div>
        
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex-1 md:flex-initial">
            <Calendar className="w-4 h-4 text-slate-400 mr-2" />
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent border-none text-sm font-medium focus:ring-0 p-0"
            />
          </div>
          
          <button 
            onClick={handlePrint}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
          >
            <Printer className="w-4 h-4 mr-2" />
            Imprimir Resumen
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard 
          title="Total Apartado" 
          amount={`Q ${parseFloat(metrics.total_apartado).toLocaleString()}`} 
          subtitle="Ventas potenciales hoy"
          icon={<ShoppingBag />} 
          color="blue"
          loading={loading}
        />
        <MetricCard 
          title="Total Confirmado" 
          amount={`Q ${parseFloat(metrics.total_confirmado).toLocaleString()}`} 
          subtitle="Enviado a logística"
          icon={<CheckCircle2 />} 
          color="green"
          loading={loading}
        />
        <MetricCard 
          title="Bolsas Huérfanas" 
          amount={metrics.total_huerfanas} 
          subtitle="Pendientes de checkout"
          icon={<XCircle />} 
          color="orange"
          loading={loading}
        />
      </div>

      {/* Top Customers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 flex items-center">
            <Users className="w-4 h-4 mr-2 text-indigo-500" />
            Top 5 Clientes de la Noche
          </h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inversión Hoy</span>
        </div>
        <div className="p-0">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400">
                <th className="px-6 py-3">Cliente / Usuario</th>
                <th className="px-6 py-3 text-right">Monto Apartado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="2" className="px-6 py-10 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-500" />
                  </td>
                </tr>
              ) : metrics.top_customers.length > 0 ? (
                metrics.top_customers.map((customer, index) => (
                  <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-700 flex items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 text-[10px] font-bold ${
                        index === 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {index + 1}
                      </div>
                      {customer.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-indigo-600">
                      Q {parseFloat(customer.total).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" className="px-6 py-10 text-center text-slate-400 italic text-sm">
                    No se encontraron registros para esta fecha
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, amount, subtitle, icon, color, loading }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
  };

  const iconClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-emerald-100 text-emerald-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <div className={`bg-white p-6 rounded-xl shadow-sm border ${colorClasses[color] || 'border-slate-200'}`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${iconClasses[color] || 'bg-slate-100 text-slate-600'}`}>
          {icon}
        </div>
        <div className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-tighter">
          Rendimiento
          <ArrowUpRight className="w-3 h-3 ml-1" />
        </div>
      </div>
      <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</h3>
      <p className={`text-2xl font-black text-slate-800 ${loading ? 'animate-pulse opacity-50' : ''}`}>
        {amount}
      </p>
      {subtitle && <p className="text-[10px] text-slate-400 font-medium mt-1">{subtitle}</p>}
    </div>
  );
}
