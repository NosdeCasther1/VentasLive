import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Lock, Mail, Store, ArrowRight } from 'lucide-react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <Head title="Iniciar Sesión" />
            
            <div className="max-w-md w-full">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-500 rounded-3xl shadow-2xl shadow-indigo-500/20 mb-6 rotate-3 hover:rotate-0 transition-transform duration-300">
                        <Store className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Bienvenido de nuevo</h1>
                    <p className="text-slate-400 mt-2">Ingresa tus credenciales para acceder al sistema.</p>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2 ml-1 uppercase tracking-wider">
                                Correo Electrónico
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    placeholder="usuario@ejemplo.com"
                                    className="block w-full pl-12 pr-4 py-4 bg-slate-900/50 border-2 border-slate-700 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-2 text-red-400 text-sm font-medium">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2 ml-1 uppercase tracking-wider">
                                Contraseña
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    className="block w-full pl-12 pr-4 py-4 bg-slate-900/50 border-2 border-slate-700 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                />
                            </div>
                            {errors.password && (
                                <p className="mt-2 text-red-400 text-sm font-medium">{errors.password}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-5 rounded-2xl shadow-lg shadow-indigo-600/20 flex items-center justify-center space-x-3 transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            <span className="text-lg">Iniciar Sesión</span>
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </form>
                </div>
                
                <p className="text-center mt-8 text-slate-500 text-xs uppercase tracking-widest font-bold">
                    VariedadesPOS • Gestión de Inventario
                </p>
            </div>
        </div>
    );
}
