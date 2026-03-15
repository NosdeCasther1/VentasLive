import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { 
  Calculator, 
  ArrowRight, 
  Printer, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  AlertCircle,
  ShoppingBag,
  Truck,
  CreditCard,
  Wallet,
  History
} from 'lucide-react';
import axios from 'axios';

export default function Close({ auth, history = [] }) {
    const [activeTab, setActiveTab] = useState('current'); // 'current' or 'history'
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [realCash, setRealCash] = useState('');
    
    const { data, setData, post, processing, errors } = useForm({
        actual_amount: '',
        notes: '',
    });

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const response = await axios.get(route('cash-register.summary'));
                setSummary(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching summary:", error);
            }
        };
        fetchSummary();
    }, []);

    const expected = summary ? parseFloat(summary.expected_amount) : 0;
    const actual = realCash ? parseFloat(realCash) : 0;
    const difference = actual - expected;

    const getDiffColor = () => {
        if (!realCash) return 'text-slate-400';
        if (Math.abs(difference) < 0.01) return 'text-emerald-400';
        if (difference > 0) return 'text-amber-400';
        return 'text-red-400';
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setData('actual_amount', actual);
        post(route('cash-register.close'));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 flex flex-col items-center">
            <Head title="Cierre de Caja" />
            
            <div className="max-w-4xl w-full">
                {/* TABS SELECTOR */}
                <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 mb-8 self-center w-fit mx-auto shadow-2xl">
                    <button 
                        onClick={() => setActiveTab('current')}
                        className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'current' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <Wallet className="w-4 h-4" />
                        <span>Cierre de Turno</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('history')}
                        className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <History className="w-4 h-4" />
                        <span>Historial de Cierres</span>
                    </button>
                </div>

                {activeTab === 'current' ? (
                    <>
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h1 className="text-3xl font-extrabold tracking-tight">Cierre de Caja (Corte Z)</h1>
                                <p className="text-slate-400">Resumen del turno de {auth?.user?.name || 'Cajero'}</p>
                            </div>
                            <div className="bg-slate-900 px-4 py-2 rounded-xl border border-slate-800">
                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Iniciado hace</p>
                                <p className="text-sm font-mono">{new Date(summary.opened_at).toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <SummaryCard title="Ventas Mostrador" amount={summary.cash_sales} icon={<ShoppingBag className="w-5 h-5" />} color="indigo" />
                            <SummaryCard title="Entregas (COD)" amount={summary.delivery_sales} icon={<Truck className="w-5 h-5" />} color="blue" />
                            <SummaryCard title="Gastos Registrados" amount={summary.cash_expenses} icon={<CreditCard className="w-5 h-5" />} color="red" />
                        </div>

                        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl mb-8">
                            <div className="p-8 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="space-y-1">
                                    <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Esperado en Caja</p>
                                    <div className="flex items-baseline space-x-2">
                                        <span className="text-4xl font-extrabold">Q {expected.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                    <p className="text-xs text-slate-500">Monto Inicial (Q {summary.opening_amount}) + Ventas - Gastos</p>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <div className="text-right hidden md:block">
                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Diferencia</p>
                                        <p className={`text-2xl font-black ${getDiffColor()}`}>
                                            {difference > 0 ? '+' : ''}{difference.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                    <div className={`p-4 rounded-2xl ${getDiffColor() === 'text-emerald-400' ? 'bg-emerald-500/10' : (difference < 0 ? 'bg-red-500/10' : 'bg-amber-500/10')}`}>
                                        {difference === 0 ? <CheckCircle2 className="w-8 h-8" /> : (difference < 0 ? <TrendingDown className="w-8 h-8" /> : <TrendingUp className="w-8 h-8" />)}
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-8">
                                <div>
                                    <label className="block text-xl font-bold mb-4 flex items-center">
                                        <Calculator className="w-6 h-6 mr-3 text-indigo-400" />
                                        Efectivo Real en Caja
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-8 flex items-center pointer-events-none text-indigo-400 group-focus-within:text-indigo-300">
                                            <span className="text-4xl font-black">Q</span>
                                        </div>
                                        <input
                                            type="number" step="0.01" required autoFocus
                                            value={realCash}
                                            onChange={e => { setRealCash(e.target.value); setData('actual_amount', e.target.value); }}
                                            placeholder="0.00"
                                            className="block w-full pl-20 pr-8 py-8 bg-slate-950 border-3 border-slate-800 rounded-3xl text-6xl font-black text-white focus:outline-none focus:border-indigo-500 focus:ring-8 focus:ring-indigo-500/10 transition-all placeholder-slate-900"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-400 mb-2 ml-1">NOTAS O COMENTARIOS (OPCIONAL)</label>
                                    <textarea
                                        value={data.notes}
                                        onChange={e => setData('notes', e.target.value)}
                                        className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl p-4 text-white focus:outline-none focus:border-indigo-500 min-h-[100px]"
                                        placeholder="Indica si hubo alguna anomalía o descuadre..."
                                    ></textarea>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button type="button" onClick={() => router.get(route('products.index'))} className="py-5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-colors flex items-center justify-center">
                                        <ArrowRight className="w-5 h-5 mr-2 rotate-180" />
                                        Cancelar y Volver
                                    </button>
                                    <button type="submit" disabled={processing || !realCash} className="py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center space-x-3 disabled:opacity-50">
                                        <Printer className="w-6 h-6" />
                                        <span className="text-lg">Cerrar Turno e Imprimir</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl min-h-[500px]">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black text-white flex items-center">
                                <History className="w-6 h-6 mr-3 text-indigo-500" />
                                Historial de Cierres
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-800/50">
                                        <th className="pb-4 px-4">Fecha Cierre</th>
                                        <th className="pb-4 px-4">Cajero</th>
                                        <th className="pb-4 px-4 text-right">Esperado</th>
                                        <th className="pb-4 px-4 text-right">Real</th>
                                        <th className="pb-4 px-4 text-right">Diferencia</th>
                                        <th className="pb-4 px-4 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {history.length === 0 ? (
                                        <tr><td colSpan="6" className="py-12 text-center text-slate-500">No hay registros de cierres históricos.</td></tr>
                                    ) : (
                                        history.map(reg => (
                                            <tr key={reg.id} className="text-sm text-slate-300 hover:bg-slate-800/50 transition-colors">
                                                <td className="py-5 px-4 font-bold text-white">
                                                    {new Date(reg.closed_at).toLocaleDateString()}
                                                    <span className="block text-xs text-slate-500 font-normal">{new Date(reg.closed_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                </td>
                                                <td className="py-5 px-4">{reg.user?.name}</td>
                                                <td className="py-5 px-4 text-right font-mono text-xs">Q {parseFloat(reg.expected_amount).toFixed(2)}</td>
                                                <td className="py-5 px-4 text-right font-mono font-bold text-white">Q {parseFloat(reg.actual_amount).toFixed(2)}</td>
                                                <td className={`py-5 px-4 text-right font-bold ${reg.difference < 0 ? 'text-red-400' : (reg.difference > 0 ? 'text-amber-400' : 'text-emerald-400')}`}>
                                                    Q {parseFloat(reg.difference).toFixed(2)}
                                                </td>
                                                <td className="py-5 px-4 text-right">
                                                    <a href={route('cash-register.print', reg.id)} target="_blank" className="inline-flex items-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-bold transition-all shadow-sm">
                                                        <Printer className="w-3.5 h-3.5 mr-2" />
                                                        Reimprimir Z
                                                    </a>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function SummaryCard({ title, amount, icon, color }) {
    const colorClasses = {
        indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
        blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        red: 'bg-red-500/10 text-red-400 border-red-500/20',
    };
    return (
        <div className={`p-4 rounded-2xl border ${colorClasses[color]} flex items-center space-x-4 h-full`}>
            <div className={`p-3 rounded-xl bg-white/5`}>{icon}</div>
            <div>
                <p className="text-[10px] uppercase font-bold tracking-widest opacity-60">{title}</p>
                <p className="text-lg font-mono font-bold">Q {parseFloat(amount).toFixed(2)}</p>
            </div>
        </div>
    );
}


function SummaryCard({ title, amount, icon, color }) {
    const colorClasses = {
        indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
        blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        red: 'bg-red-500/10 text-red-400 border-red-500/20',
    };

    return (
        <div className={`p-4 rounded-2xl border ${colorClasses[color]} flex items-center space-x-4 h-full`}>
            <div className={`p-3 rounded-xl bg-white/5`}>
                {icon}
            </div>
            <div>
                <p className="text-[10px] uppercase font-bold tracking-widest opacity-60">{title}</p>
                <p className="text-lg font-mono font-bold">Q {parseFloat(amount).toFixed(2)}</p>
            </div>
        </div>
    );
}
