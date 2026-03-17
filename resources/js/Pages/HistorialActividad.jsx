import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { 
  ArrowLeft, 
  ShoppingBag, 
  CheckCircle2, 
  Clock, 
  User, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  Package,
  FileText,
  BarChart
} from 'lucide-react';

export default function HistorialActividad({ activities }) {
  const { data, links, meta } = activities;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <Head title="Historial de Actividad" />
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <Link 
              href="/" 
              className="flex items-center text-indigo-600 font-bold hover:text-indigo-700 transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Dashboard
            </Link>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              Historial de Actividad
            </h1>
            <p className="text-slate-500 font-medium">
              Registro completo de ventas y movimientos en el sistema.
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Registros</p>
              <p className="text-2xl font-black text-slate-800">{activities.total}</p>
            </div>
          </div>
        </div>

        {/* Timeline/Table Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Fecha y Hora</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Tipo</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Descripción</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Monto</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Usuario</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-300">
                        <Clock className="w-16 h-16 mb-4 opacity-20" />
                        <p className="text-xl font-bold">No hay actividad registrada</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.map((activity) => (
                    <tr key={activity.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${activity.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                            {activity.icon === 'ShoppingBag' ? <ShoppingBag className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-700">{activity.time}</p>
                            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">Hace un momento</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          activity.color === 'indigo' 
                            ? 'bg-indigo-50 text-indigo-600 border-indigo-100' 
                            : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>
                          {activity.type}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                          {activity.text}
                        </p>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <p className={`text-sm font-black ${
                          activity.color === 'indigo' ? 'text-indigo-600' : 'text-emerald-600'
                        }`}>
                          Q {parseFloat(activity.total).toFixed(2)}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center text-slate-500 font-medium">
                          <User className="w-3.5 h-3.5 mr-2 opacity-60" />
                          <span className="text-sm">{activity.user_name}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {activities.total > activities.per_page && (
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between">
              <p className="text-xs font-bold text-slate-400 tracking-wider">
                Mostrando <span className="text-slate-700">{activities.from}</span> a <span className="text-slate-700">{activities.to}</span> de <span className="text-slate-700">{activities.total}</span> resultados
              </p>
              
              <div className="flex space-x-2">
                {activities.links.map((link, i) => {
                  if (link.label.includes('Previous')) {
                    return (
                      <Link
                        key={i}
                        href={link.url}
                        className={`p-2 rounded-lg border border-slate-200 transition-all ${
                          !link.url ? 'opacity-40 cursor-not-allowed bg-slate-100' : 'bg-white hover:bg-indigo-50 hover:border-indigo-200 text-slate-600'
                        }`}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Link>
                    )
                  }
                  if (link.label.includes('Next')) {
                    return (
                      <Link
                        key={i}
                        href={link.url}
                        className={`p-2 rounded-lg border border-slate-200 transition-all ${
                          !link.url ? 'opacity-40 cursor-not-allowed bg-slate-100' : 'bg-white hover:bg-indigo-50 hover:border-indigo-200 text-slate-600'
                        }`}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    )
                  }
                  return (
                    <Link
                      key={i}
                      href={link.url}
                      className={`px-3 py-1 rounded-lg border text-sm font-bold transition-all ${
                        link.active 
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                          : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                      dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
           <div className="p-6 bg-slate-200/50 rounded-2xl border border-slate-300/50 flex items-start space-x-4">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                 <Package className="w-5 h-5 text-indigo-500" />
              </div>
              <div>
                 <p className="text-sm font-bold text-slate-700 mb-1">Exportar Reportes</p>
                 <p className="text-xs text-slate-500 leading-relaxed font-medium mb-3">
                    Puedes generar reportes detallados en PDF o Excel desde la sección central de reportes de contabilidad.
                 </p>
                 <div className="flex space-x-2">
                    <button 
                      onClick={() => window.open('/reportes/exportar/pdf', '_blank')}
                      className="flex items-center px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors border border-red-100 cursor-pointer"
                    >
                      <FileText className="w-3 h-3 mr-1.5" /> PDF
                    </button>
                    <button 
                      onClick={() => window.open('/reportes/exportar/excel', '_blank')}
                      className="flex items-center px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors border border-emerald-100 cursor-pointer"
                    >
                      <BarChart className="w-3 h-3 mr-1.5" /> Excel
                    </button>
                 </div>
              </div>
           </div>
           <a 
             href="https://wa.me/50233577478?text=Hola,%20necesito%20ayuda%20con%20un%20reporte%20personalizado%20en%20el%20sistema."
             target="_blank"
             rel="noopener noreferrer"
             className="p-6 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-200 text-white flex items-center justify-between group cursor-pointer hover:bg-indigo-700 transition-colors"
           >
              <div>
                 <p className="font-bold mb-1">¿Necesitas un reporte específico?</p>
                 <p className="text-xs text-indigo-100 font-medium">Contacta al equipo de soporte para personalizaciones.</p>
              </div>
              <div className="p-3 bg-indigo-500 rounded-xl group-hover:scale-110 transition-transform">
                 <ChevronRight className="w-5 h-5" />
              </div>
           </a>
        </div>
      </div>
    </div>
  );
}
