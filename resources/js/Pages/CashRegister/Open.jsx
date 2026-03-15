import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Store, ArrowRight, Wallet } from 'lucide-react';

export default function Open({ auth }) {
    const denominations = {
        bills: [200, 100, 50, 20, 10, 5],
        coins: [1, 0.50, 0.25]
    };

    const { data, setData, post, processing, errors } = useForm({
        opening_amount: 0,
        opening_details: {
            200: 0, 100: 0, 50: 0, 20: 0, 10: 0, 5: 0,
            1: 0, 0.50: 0, 0.25: 0
        },
    });

    const calculateTotal = (details) => {
        let total = 0;
        Object.keys(details).forEach(denom => {
            total += parseFloat(denom) * (details[denom] || 0);
        });
        return total;
    };

    const handleQuantityChange = (denom, qty) => {
        const newDetails = { ...data.opening_details, [denom]: parseInt(qty) || 0 };
        const newTotal = calculateTotal(newDetails);
        setData(prev => ({
            ...prev,
            opening_details: newDetails,
            opening_amount: newTotal
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('cash-register.store'));
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(val);
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <Head title="Apertura de Caja" />
            
            <div className="max-w-4xl w-full">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-500 rounded-3xl shadow-2xl shadow-indigo-500/20 mb-6 rotate-3 hover:rotate-0 transition-transform duration-300">
                        <Store className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">¡Buen día, {auth?.user?.name?.split(' ')[0] || 'Usuario'}!</h1>
                    <p className="text-slate-400 mt-2">Inicia el turno realizando el arqueo de caja inicial.</p>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl mb-8">
                    <div className="text-center mb-10">
                        <p className="text-slate-400 text-sm uppercase tracking-widest font-bold mb-2">Total en Caja</p>
                        <h2 className="text-6xl font-black text-white tracking-tighter">
                            {formatCurrency(data.opening_amount)}
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {/* Billetes */}
                            <div className="space-y-4">
                                <h3 className="text-indigo-400 font-bold uppercase tracking-widest text-sm flex items-center">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></div>
                                    Billetes (Denominación)
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {denominations.bills.map(denom => (
                                        <div key={denom} className="bg-slate-900/40 p-3 rounded-2xl border border-slate-700/50 flex flex-col items-center">
                                            <span className="text-slate-500 text-xs font-bold mb-1">Q {denom}</span>
                                            <input
                                                type="number"
                                                min="0"
                                                value={data.opening_details[denom]}
                                                onChange={e => handleQuantityChange(denom, e.target.value)}
                                                className="w-full bg-transparent border-none text-center text-xl font-bold text-white focus:ring-0 p-0"
                                                placeholder="0"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Monedas */}
                            <div className="space-y-4">
                                <h3 className="text-emerald-400 font-bold uppercase tracking-widest text-sm flex items-center">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div>
                                    Monedas (Denominación)
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {denominations.coins.map(denom => (
                                        <div key={denom} className="bg-slate-900/40 p-3 rounded-2xl border border-slate-700/50 flex flex-col items-center">
                                            <span className="text-slate-500 text-xs font-bold mb-1">Q {denom.toFixed(2)}</span>
                                            <input
                                                type="number"
                                                min="0"
                                                value={data.opening_details[denom]}
                                                onChange={e => handleQuantityChange(denom, e.target.value)}
                                                className="w-full bg-transparent border-none text-center text-xl font-bold text-white focus:ring-0 p-0"
                                                placeholder="0"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-700/50 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="text-slate-400 text-sm max-w-sm">
                                Al abrir caja, confirmas que el monto arriba indicado coincide con el efectivo físico disponible en la gaveta.
                            </div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full md:w-auto bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold px-10 py-5 rounded-2xl shadow-lg shadow-indigo-600/20 flex items-center justify-center space-x-3 transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                <span className="text-lg">Abrir Caja y Continuar</span>
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </form>
                </div>
                
                <p className="text-center mt-8 text-slate-500 text-xs uppercase tracking-widest font-bold">
                    VariedadesPOS • Control de Caja
                </p>
            </div>
        </div>
    );
}
