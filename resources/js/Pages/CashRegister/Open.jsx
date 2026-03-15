import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Store, ArrowRight, Wallet } from 'lucide-react';

export default function Open({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        opening_amount: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('cash-register.store'));
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <Head title="Apertura de Caja" />
            
            <div className="max-w-md w-full">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-500 rounded-3xl shadow-2xl shadow-indigo-500/20 mb-6 rotate-3 hover:rotate-0 transition-transform duration-300">
                        <Store className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">¡Buen día, {auth?.user?.name?.split(' ')[0] || 'Usuario'}!</h1>
                    <p className="text-slate-400 mt-2">Inicia el turno para comenzar a vender.</p>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-3 ml-1 uppercase tracking-wider">
                                ¿Con cuánto efectivo inicias el turno?
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-indigo-400 group-focus-within:text-indigo-300 transition-colors">
                                    <span className="text-2xl font-bold">Q</span>
                                </div>
                                <input
                                    type="number"
                                    step="0.01"
                                    autoFocus
                                    required
                                    value={data.opening_amount}
                                    onChange={e => setData('opening_amount', e.target.value)}
                                    placeholder="0.00"
                                    className="block w-full pl-14 pr-6 py-5 bg-slate-900/50 border-2 border-slate-700 rounded-2xl text-3xl font-bold text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                />
                            </div>
                            {errors.opening_amount && (
                                <p className="mt-2 text-red-400 text-sm font-medium animate-pulse">{errors.opening_amount}</p>
                            )}
                        </div>

                        <div className="pt-2">
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center text-slate-400 text-sm">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-3"></div>
                                    Se registrará la fecha y hora de apertura.
                                </li>
                                <li className="flex items-center text-slate-400 text-sm">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-3"></div>
                                    Habilitará el sistema de POS y Logística.
                                </li>
                            </ul>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-5 rounded-2xl shadow-lg shadow-indigo-600/20 flex items-center justify-center space-x-3 transition-all active:scale-[0.98] disabled:opacity-50"
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
