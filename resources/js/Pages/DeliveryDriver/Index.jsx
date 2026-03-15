import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';

export default function Index({ orders: initialOrders }) {
    const [orders, setOrders] = useState(initialOrders);

    const markAsDelivered = (orderId) => {
        if (confirm('¿Confirmar que la orden fue entregada?')) {
            router.patch(route('logistics.driver.delivered', orderId), {}, {
                onSuccess: () => {
                    setOrders(orders.filter(o => o.id !== orderId));
                },
                onError: (errors) => alert(errors.error || 'Error al procesar la entrega')
            });
        }
    };

    const markAsReturned = (orderId) => {
        const reason = prompt('Motivo de devolución:');
        if (reason) {
            router.patch(route('logistics.driver.returned', orderId), { return_reason: reason }, {
                onSuccess: () => {
                    setOrders(orders.filter(o => o.id !== orderId));
                },
                onError: (errors) => alert(errors.error || 'Error al procesar la devolución')
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <Head title="Módulo de Reparto" />
            
            <header className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">📦 Mis Entregas</h1>
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {orders.length} pendientes
                </span>
            </header>

            {orders.length === 0 ? (
                <div className="text-center py-20">
                    <div className="text-6xl mb-4">🎉</div>
                    <h2 className="text-xl font-semibold text-gray-600">¡Todo entregado!</h2>
                    <p className="text-gray-500">No hay órdenes en tránsito por ahora.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                            {/* Header de la tarjeta */}
                            <div className="p-4 border-b border-gray-100 bg-gray-50">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Orden #{order.id}</p>
                                        <h2 className="text-xl font-bold text-gray-900 leading-tight mt-1">{order.customer_name}</h2>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500 uppercase font-bold">Total a Cobrar</p>
                                        <p className="text-2xl font-black text-green-600">Q{order.total}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Cuerpo de la tarjeta */}
                            <div className="p-4 space-y-4">
                                <div>
                                    <div className="flex items-start space-x-2">
                                        <span className="text-xl">📍</span>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">{order.shipping_address || 'Sin dirección registrada'}</p>
                                            <p className="text-xs text-gray-500 mt-1 italic">{order.notes || 'Sin notas adicionales'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Botones de contacto rápido */}
                                <div className="grid grid-cols-2 gap-3">
                                    <a 
                                        href={`tel:${order.shipping_phone || order.customer_phone}`}
                                        className="flex items-center justify-center space-x-2 bg-blue-50 text-blue-700 py-3 rounded-xl font-bold border border-blue-200 active:bg-blue-100"
                                    >
                                        <span>📞</span>
                                        <span>Llamar</span>
                                    </a>
                                    <a 
                                        href={`https://wa.me/${(order.shipping_phone || order.customer_phone)?.replace(/\D/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center space-x-2 bg-green-50 text-green-700 py-3 rounded-xl font-bold border border-green-200 active:bg-green-100"
                                    >
                                        <span>💬</span>
                                        <span>WhatsApp</span>
                                    </a>
                                </div>

                                {/* Resumen de artículos (opcional pero útil) */}
                                <div className="bg-gray-50 p-2 rounded-lg">
                                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Artículos</p>
                                    <div className="text-xs text-gray-600">
                                        {order.details?.map(d => (
                                            <div key={d.id} className="flex justify-between">
                                                <span>{d.quantity}x {d.product_variant?.product?.name} ({d.product_variant?.size} {d.product_variant?.color})</span>
                                            </div>
                                        )) || 'No hay detalles'}
                                    </div>
                                </div>
                            </div>

                            {/* Botones de acción GIGANTES */}
                            <div className="grid grid-cols-2">
                                <button 
                                    onClick={() => markAsReturned(order.id)}
                                    className="bg-red-600 text-white py-6 text-lg font-black uppercase active:bg-red-700 flex flex-col items-center justify-center"
                                >
                                    <span>❌</span>
                                    <span>Rechazado</span>
                                </button>
                                <button 
                                    onClick={() => markAsDelivered(order.id)}
                                    className="bg-green-600 text-white py-6 text-lg font-black uppercase active:bg-green-700 flex flex-col items-center justify-center border-l border-white/20"
                                >
                                    <span>✅</span>
                                    <span>Entregado</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
