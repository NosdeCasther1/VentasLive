import React, { useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { 
  User, 
  Mail, 
  Lock, 
  Save, 
  ArrowLeft,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function Edit({ auth, status }) {
    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: auth.user.name,
        email: auth.user.email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'), {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    title: '¡Perfil Actualizado!',
                    text: 'Tus cambios han sido guardados correctamente.',
                    icon: 'success',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000
                });
            }
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
            <Head title="Mi Perfil" />

            {/* Header */}
            <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 sticky top-0 z-10">
                <div className="flex items-center space-x-4">
                    <Link 
                        href="/" 
                        className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-xl font-bold text-slate-800">Mi Perfil</h1>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                        {auth.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-slate-600">{auth.user.name}</span>
                </div>
            </header>

            <main className="max-w-4xl mx-auto py-12 px-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="text-lg font-bold text-slate-800">Información de la Cuenta</h2>
                        <p className="text-sm text-slate-500">Actualiza tu información personal y contraseña.</p>
                    </div>

                    <form onSubmit={submit} className="p-8 space-y-8">
                        {/* Seccion Info Basica */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="flex items-center text-sm font-bold text-slate-700">
                                    <User className="w-4 h-4 mr-2 text-indigo-500" />
                                    Nombre Completo
                                </label>
                                <input 
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className={`w-full p-3 bg-slate-50 border ${errors.name ? 'border-red-300' : 'border-slate-200'} rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all`}
                                />
                                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center text-sm font-bold text-slate-700">
                                    <Mail className="w-4 h-4 mr-2 text-indigo-500" />
                                    Correo Electrónico
                                </label>
                                <input 
                                    type="email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    className={`w-full p-3 bg-slate-50 border ${errors.email ? 'border-red-300' : 'border-slate-200'} rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all`}
                                />
                                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                            </div>
                        </div>

                        <div className="h-px bg-slate-100 w-full"></div>

                        {/* Seccion Contraseña */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-bold text-slate-800 flex items-center">
                                    <Lock className="w-4 h-4 mr-2 text-amber-500" />
                                    Cambiar Contraseña
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">Deja estos campos en blanco si no deseas cambiar tu contraseña.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Nueva Contraseña</label>
                                    <input 
                                        type="password"
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                        placeholder="Min. 8 caracteres"
                                        className={`w-full p-3 bg-slate-50 border ${errors.password ? 'border-red-300' : 'border-slate-200'} rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all`}
                                    />
                                    {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Confirmar Contraseña</label>
                                    <input 
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={e => setData('password_confirmation', e.target.value)}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex items-center justify-between">
                            <div className="flex items-center">
                                {recentlySuccessful && (
                                    <span className="flex items-center text-emerald-600 text-sm font-medium animate-in fade-in duration-500">
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                        ¡Cambios guardados!
                                    </span>
                                )}
                            </div>
                            <button 
                                type="submit"
                                disabled={processing}
                                className="flex items-center px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {processing ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </form>
                </div>
                
                <div className="mt-8 bg-red-50 border border-red-100 rounded-2xl p-6 flex items-start space-x-4">
                    <div className="p-2 bg-white rounded-lg text-red-500 shadow-sm">
                        <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-red-900">Zona de Seguridad</h4>
                        <p className="text-xs text-red-700 mt-1">
                            Asegúrate de usar una contraseña robusta. Al cambiar tu contraseña, se cerrarán todas las demás sesiones activas por seguridad.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
