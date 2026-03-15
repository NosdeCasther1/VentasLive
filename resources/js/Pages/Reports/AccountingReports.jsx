import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  BookOpen, 
  ArrowUpRight, 
  ArrowDownCircle, 
  FileText, 
  TrendingUp, 
  ChevronRight, 
  ChevronDown,
  Printer,
  Download,
  Search,
  Loader2,
  CheckCircle2,
  DollarSign,
  Sparkles
} from 'lucide-react';
import axios from 'axios';

export default function AccountingReports() {
  const [activeSubTab, setActiveSubTab] = useState('diario');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [diarioEntries, setDiarioEntries] = useState([]);
  const [mayorLedger, setMayorLedger] = useState([]);
  const [incomeStatement, setIncomeStatement] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { start_date: startDate, end_date: endDate };
      
      const [diarioRes, mayorRes, erRes] = await Promise.all([
        axios.get(route('api.accounting.diario'), { params }),
        axios.get(route('api.accounting.mayor'), { params }),
        axios.get(route('api.accounting.estado-resultados'), { params })
      ]);

      setDiarioEntries(diarioRes.data);
      setMayorLedger(mayorRes.data);
      setIncomeStatement(erRes.data);
    } catch (error) {
      console.error("Error fetching accounting data:", error);
      alert("Error al cargar los datos contables.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPdf = (type = activeSubTab) => {
    window.location.href = route('api.accounting.export.pdf', { 
      type, 
      start_date: startDate, 
      end_date: endDate 
    });
  };

  const handleExportExcel = (type = activeSubTab) => {
    if (type === 'resultados') {
      alert("La exportación a Excel solo está disponible para Libro Diario y Libro Mayor.");
      return;
    }
    window.location.href = route('api.accounting.export.excel', { 
      type, 
      start_date: startDate, 
      end_date: endDate 
    });
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center">
            <BookOpen className="w-6 h-6 mr-2 text-indigo-600" /> Libros Contables
          </h2>
          <p className="text-slate-500 text-sm">Registro formal de operaciones operativas.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
            <Calendar className="w-4 h-4 text-slate-400 mr-2" />
            <input 
              type="date" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)} 
              className="bg-transparent border-none text-sm outline-none font-medium text-slate-700 focus:ring-0 p-0" 
            />
            <span className="mx-2 text-slate-400">-</span>
            <input 
              type="date" 
              value={endDate} 
              onChange={e => setEndDate(e.target.value)} 
              className="bg-transparent border-none text-sm outline-none font-medium text-slate-700 focus:ring-0 p-0" 
            />
          </div>
          <button 
            onClick={fetchData}
            disabled={loading}
            className="p-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md disabled:bg-slate-300"
            title="Sincronizar Datos"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </button>
          
          <div className="h-8 w-px bg-slate-200 mx-1"></div>

          <a 
            href={activeSubTab !== 'resultados' ? route('api.accounting.export.excel', { type: activeSubTab, start_date: startDate, end_date: endDate }) : '#'}
            target="_blank"
            rel="noopener noreferrer"
            download
            onClick={e => {
              if (activeSubTab === 'resultados') {
                e.preventDefault();
                alert("La exportación a Excel solo está disponible para Libro Diario y Libro Mayor.");
              }
            }}
            className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm font-bold text-sm"
          >
            <Download className="w-4 h-4 mr-2" /> Excel
          </a>
          <a 
            href={route('api.accounting.export.pdf', { type: activeSubTab, start_date: startDate, end_date: endDate })}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="flex items-center px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors shadow-sm font-bold text-sm"
          >
            <FileText className="w-4 h-4 mr-2" /> PDF
          </a>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl w-fit">
        <button 
          onClick={() => setActiveSubTab('diario')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeSubTab === 'diario' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Libro Diario
        </button>
        <button 
          onClick={() => setActiveSubTab('mayor')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeSubTab === 'mayor' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Libro Mayor
        </button>
        <button 
          onClick={() => setActiveSubTab('resultados')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeSubTab === 'resultados' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Estado de Resultados
        </button>
      </div>

      <div className="min-h-[500px]">
        {activeSubTab === 'diario' && <DiarioView entries={diarioEntries} loading={loading} />}
        {activeSubTab === 'mayor' && <MayorView ledger={mayorLedger} loading={loading} />}
        {activeSubTab === 'resultados' && (
          <ResultadosView 
            data={incomeStatement} 
            loading={loading} 
            startDate={startDate} 
            endDate={endDate} 
            onExportPdf={() => handleExportPdf('resultados')}
          />
        )}
      </div>
    </div>
  );
}

function DiarioView({ entries, loading }) {
  const totalDebit = entries.reduce((sum, e) => sum + parseFloat(e.debit), 0);
  const totalCredit = entries.reduce((sum, e) => sum + parseFloat(e.credit), 0);
  const balanced = Math.abs(totalDebit - totalCredit) < 0.01;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-2 duration-300">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h3 className="font-bold text-slate-700">Asientos Contables Cronológicos</h3>
        {!loading && (
          <div className={`flex items-center px-3 py-1 rounded-full text-xs font-bold ${balanced ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700 animate-pulse'}`}>
            {balanced ? <CheckCircle2 className="w-3 h-3 mr-1" /> : null}
            {balanced ? 'Cuadrado Perfecto' : 'Descuadrado'}
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <th className="px-6 py-3">Fecha</th>
              <th className="px-6 py-3">Concepto</th>
              <th className="px-6 py-3">Cuenta</th>
              <th className="px-6 py-3 text-right">Debe</th>
              <th className="px-6 py-3 text-right">Haber</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="5" className="px-6 py-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-indigo-300" /></td></tr>
            ) : entries.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-20 text-center text-slate-400">No hay movimientos en este rango.</td></tr>
            ) : (
              entries.map((entry, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3 text-xs text-slate-500 font-mono">{entry.date}</td>
                  <td className="px-6 py-3 text-sm font-medium text-slate-700">{entry.concept}</td>
                  <td className="px-6 py-3 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${entry.debit > 0 ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                      {entry.account}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right font-bold text-slate-700">{entry.debit > 0 ? `Q ${parseFloat(entry.debit).toFixed(2)}` : ''}</td>
                  <td className="px-6 py-3 text-right font-bold text-slate-700">{entry.credit > 0 ? `Q ${parseFloat(entry.credit).toFixed(2)}` : ''}</td>
                </tr>
              ))
            )}
          </tbody>
          {!loading && entries.length > 0 && (
            <tfoot className="bg-slate-50 border-t-2 border-slate-200">
              <tr className="font-black text-slate-800">
                <td colSpan="3" className="px-6 py-4 text-right uppercase text-xs tracking-widest">Totales de Control</td>
                <td className="px-6 py-4 text-right text-indigo-700">Q {totalDebit.toFixed(2)}</td>
                <td className="px-6 py-4 text-right text-indigo-700">Q {totalCredit.toFixed(2)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}

function MayorView({ ledger, loading }) {
  const [expandedAccount, setExpandedAccount] = useState(null);

  return (
    <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
      {loading ? (
        <div className="bg-white p-20 rounded-xl border border-slate-200 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-indigo-300" /></div>
      ) : ledger.length === 0 ? (
          <div className="bg-white p-20 rounded-xl border border-slate-200 text-center text-slate-400">Inicia una búsqueda para ver los mayores.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ledger.map((acc, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              <div 
                className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => setExpandedAccount(expandedAccount === idx ? null : idx)}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <h3 className="font-black text-slate-800">{acc.account}</h3>
                </div>
                {expandedAccount === idx ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </div>
              
              <div className="p-5 grid grid-cols-2 gap-4 border-b border-slate-100">
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Saldo Inicial</p>
                  <p className="text-lg font-bold text-slate-700">Q {parseFloat(acc.initial_balance).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Saldo Final</p>
                  <p className="text-xl font-black text-indigo-700">Q {parseFloat(acc.final_balance).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mb-1 flex items-center">
                    <ArrowUpRight className="w-3 h-3 mr-1" /> Cargos (+)
                  </p>
                  <p className="font-bold text-emerald-600">Q {parseFloat(acc.total_debits).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-rose-500 font-black uppercase tracking-widest mb-1 flex items-center">
                    <ArrowDownCircle className="w-3 h-3 mr-1" /> Abonos (-)
                  </p>
                  <p className="font-bold text-rose-600">Q {parseFloat(acc.total_credits).toFixed(2)}</p>
                </div>
              </div>

              {expandedAccount === idx && (
                <div className="flex-1 overflow-auto max-h-60 bg-slate-50/50">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-slate-100 text-slate-500">
                      <tr>
                        <th className="px-4 py-2 border-b">Fecha</th>
                        <th className="px-4 py-2 border-b">Concepto</th>
                        <th className="px-4 py-2 border-b text-right">Monto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {acc.entries.map((e, eidx) => (
                        <tr key={eidx}>
                          <td className="px-4 py-2 font-mono">{e.date}</td>
                          <td className="px-4 py-2 text-slate-600">{e.concept}</td>
                          <td className={`px-4 py-2 text-right font-bold ${e.debit > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {e.debit > 0 ? `+Q ${parseFloat(e.debit).toFixed(2)}` : `-Q ${parseFloat(e.credit).toFixed(2)}`}
                          </td>
                        </tr>
                      ))}
                      {acc.entries.length === 0 && (
                        <tr><td colSpan="3" className="px-4 py-6 text-center text-slate-400">Sin movimientos en el periodo.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ResultadosView({ data, loading, startDate, endDate, onExportPdf }) {
  if (loading) return <div className="bg-white p-20 rounded-xl border border-slate-200 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-indigo-300" /></div>;
  if (!data) return <div className="bg-white p-20 rounded-xl border border-slate-200 text-center text-slate-400">No hay datos suficientes para el reporte.</div>;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-2xl mx-auto overflow-hidden animate-in zoom-in-95 duration-300">
      <div className="bg-slate-900 text-white p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <TrendingUp className="w-64 h-64 -ml-20 -mt-20" />
        </div>
        <h3 className="text-2xl font-black uppercase tracking-tighter relative z-10">Estado de Resultados</h3>
        <p className="text-slate-400 text-sm mt-1 relative z-10">Periodo: {startDate} al {endDate}</p>
      </div>

      <div className="p-8 space-y-6">
        {/* Ventas */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div className="flex items-center">
             <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg mr-4"><TrendingUp className="w-5 h-5" /></div>
             <div>
               <p className="font-bold text-slate-800">(+) Ingresos por Ventas</p>
               <p className="text-xs text-slate-400">Facturación bruta total</p>
             </div>
          </div>
          <p className="text-xl font-bold text-slate-800">Q {parseFloat(data.ventas).toFixed(2)}</p>
        </div>

        {/* Costo de Ventas */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div className="flex items-center">
             <div className="p-2 bg-rose-50 text-rose-600 rounded-lg mr-4"><FileText className="w-5 h-5" /></div>
             <div>
               <p className="font-bold text-slate-800">(-) Costo de Ventas</p>
               <p className="text-xs text-slate-400">Costo de inventario vendido (PMP)</p>
             </div>
          </div>
          <p className="text-xl font-bold text-rose-600">- Q {parseFloat(data.costo_ventas).toFixed(2)}</p>
        </div>

        {/* Utilidad Bruta */}
        <div className="flex justify-between items-center p-4 bg-indigo-50 rounded-xl border border-indigo-100">
          <p className="font-black text-indigo-900 uppercase tracking-wider">(=) Utilidad Bruta</p>
          <p className="text-2xl font-black text-indigo-700">Q {parseFloat(data.utilidad_bruta).toFixed(2)}</p>
        </div>

        {/* Gastos Operativos */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 pt-4">
          <div className="flex items-center">
             <div className="p-2 bg-orange-50 text-orange-600 rounded-lg mr-4"><DollarSign className="w-5 h-5" /></div>
             <div>
               <p className="font-bold text-slate-800">(-) Gastos Operativos</p>
               <p className="text-xs text-slate-400">Administrativos, Marketing, Servicios</p>
             </div>
          </div>
          <p className="text-xl font-bold text-rose-600">- Q {parseFloat(data.gastos_operativos).toFixed(2)}</p>
        </div>

        {/* Utilidad Neta */}
        <div className="mt-8 p-6 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-lg relative overflow-hidden">
          <Sparkles className="absolute -right-4 -bottom-4 w-24 h-24 text-white opacity-10" />
          <div className="flex justify-between items-center relative z-10">
            <div>
              <p className="text-indigo-100 font-bold uppercase tracking-widest text-xs">Resultado del Ejercicio</p>
              <p className="text-white text-3xl font-black mt-1">Utilidad Neta</p>
            </div>
            <div className="text-right">
              <p className="text-white text-4xl font-black">Q {parseFloat(data.utilidad_neta).toFixed(2)}</p>
              <div className="mt-2 inline-flex items-center bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                <span className="text-white text-xs font-bold">Margin: {parseFloat(data.ventas) > 0 ? ((parseFloat(data.utilidad_neta) / parseFloat(data.ventas)) * 100).toFixed(1) : 0}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 flex justify-center space-x-4">
          <button 
            onClick={() => window.print()}
            className="flex items-center text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors"
          >
            <Printer className="w-4 h-4 mr-1" /> Imprimir Reporte
          </button>
          <a 
            href={route('api.accounting.export.pdf', { type: 'resultados', start_date: startDate, end_date: endDate })}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="flex items-center text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors"
          >
            <Download className="w-4 h-4 mr-1" /> Exportar PDF
          </a>
        </div>
      </div>
    </div>
  );
}
