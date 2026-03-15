import React, { useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Printer, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function Report({ register }) {
    useEffect(() => {
        // Automatically open print dialog if desired
        // window.print();
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-slate-100 p-4 md:p-8 print:p-0 print:bg-white">
            <Head title={`Corte de Caja #${register.id}`} />
            
            {/* Action Bar (Hidden on print) */}
            <div className="max-w-[400px] mx-auto mb-6 flex justify-between items-center print:hidden">
                <Link 
                    href={route('products.index')}
                    className="flex items-center text-slate-600 hover:text-slate-900 font-medium"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver al POS
                </Link>
                <button 
                    onClick={() => window.print()}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold flex items-center shadow-lg shadow-indigo-200"
                >
                    <Printer className="w-4 h-4 mr-2" />
                    Imprimir Ticket
                </button>
            </div>

            {/* Ticket Container */}
            <div className="max-w-[80mm] mx-auto bg-white p-6 shadow-xl print:shadow-none print:max-w-full font-mono text-sm text-slate-800 leading-tight">
                <div className="text-center mb-6">
                    <h1 className="text-xl font-black uppercase tracking-tighter">Variedades Nosde</h1>
                    <p className="text-xs">Control de Inventario y POS</p>
                    <div className="h-px bg-slate-200 my-4 border-t border-dashed border-slate-400"></div>
                    <h2 className="font-bold text-lg">REPORTE DE CIERRE</h2>
                    <p className="text-xs">Corte Z #{register.id}</p>
                </div>

                <div className="space-y-2 mb-6 text-[12px]">
                    <div className="flex justify-between">
                        <span className="text-slate-500">Cajero:</span>
                        <span className="font-bold">{register.user.name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">Apertura:</span>
                        <span className="text-right">{formatDate(register.opened_at)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">Cierre:</span>
                        <span className="text-right">{formatDate(register.closed_at)}</span>
                    </div>
                </div>

                <div className="h-px bg-slate-200 my-4 border-t border-dashed border-slate-400"></div>

                <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center text-lg font-bold">
                        <span>(+) Monto Inicial:</span>
                        <span>Q {parseFloat(register.opening_amount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span>(+) Ventas POS:</span>
                        <span>Q {parseFloat(register.cash_sales).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center flex-col items-end">
                        <div className="w-full flex justify-between">
                            <span>(+) Entregas COD:</span>
                            <span>Q {parseFloat(register.delivery_sales).toFixed(2)}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 italic">(Confirmadas por Motoristas)</span>
                    </div>
                    <div className="flex justify-between items-center text-red-600 font-bold">
                        <span>(-) Gastos de Hoy:</span>
                        <span>Q {parseFloat(register.cash_expenses).toFixed(2)}</span>
                    </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 font-black">
                    <div className="flex justify-between items-center text-lg uppercase tracking-tight">
                        <span>Total Esperado:</span>
                        <span>Q {parseFloat(register.expected_amount).toFixed(2)}</span>
                    </div>
                </div>

                <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center font-bold">
                        <span>Efectivo Real:</span>
                        <span className="text-lg">Q {parseFloat(register.actual_amount).toFixed(2)}</span>
                    </div>
                    <div className={`p-3 rounded flex justify-between items-center font-black ${parseFloat(register.difference) === 0 ? 'bg-emerald-50 text-emerald-700' : (parseFloat(register.difference) < 0 ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700')}`}>
                        <span>Diferencia:</span>
                        <span>{parseFloat(register.difference) > 0 ? '+' : ''}{parseFloat(register.difference).toFixed(2)}</span>
                    </div>
                </div>

                {register.notes && (
                    <div className="mb-8 p-3 bg-slate-100 rounded text-[11px] italic">
                        <p className="font-bold uppercase not-italic mb-1 opacity-50">Notas:</p>
                        {register.notes}
                    </div>
                )}

                <div className="text-center mt-12 space-y-8">
                    <div className="border-t border-slate-400 pt-2 w-48 mx-auto">
                        <p className="text-[10px] uppercase font-bold tracking-widest">Firma Cajero</p>
                    </div>
                    <div className="border-t border-slate-400 pt-2 w-48 mx-auto">
                        <p className="text-[10px] uppercase font-bold tracking-widest">Firma Supervisor</p>
                    </div>
                    
                    <div className="pt-8">
                        <p className="text-[10px] text-slate-400 uppercase tracking-tighter">VariedadesPOS - Generado el {new Date().toLocaleString()}</p>
                    </div>
                </div>
            </div>
            
            {/* Success Toast (Hidden on preview/print) */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white px-6 py-4 rounded-full shadow-2xl border border-emerald-100 flex items-center space-x-3 print:hidden">
                <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                    <p className="font-bold text-slate-800">¡Caja cerrada exitosamente!</p>
                    <p className="text-xs text-slate-500">Corte Z generado correctamente.</p>
                </div>
            </div>
        </div>
    );
}
