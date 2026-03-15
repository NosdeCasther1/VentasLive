import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { 
  Building2, 
  Users, 
  Settings as SettingsIcon, 
  Save, 
  UserPlus, 
  Trash2, 
  Edit,
  Key,
  Truck,
  Printer,
  FileText,
  Phone,
  MapPin,
  Fingerprint,
  Mail,
  ShieldCheck
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function SettingsIndex({ settings, users }) {
  const [activeTab, setActiveTab] = useState('empresa');
  const { auth } = usePage().props;

  // Form for Settings
  const settingsForm = useForm({
    app_name: settings.app_name || '',
    company_nit: settings.company_nit || '',
    company_phone: settings.company_phone || '',
    company_address: settings.company_address || '',
    ticket_footer: settings.ticket_footer || '',
    default_shipping_cost: settings.default_shipping_cost || '0',
    gemini_api_key: settings.gemini_api_key || '',
    printer_size: settings.printer_size || '80mm',
  });

  // Form for User (Create/Edit)
  const [editingUser, setEditingUser] = useState(null);
  const userForm = useForm({
    name: '',
    email: '',
    password: '',
    role: 'cashier',
  });

  const handleSettingsSubmit = (e) => {
    e.preventDefault();
    settingsForm.post(route('settings.update'), {
      onSuccess: () => Swal.fire('Éxito', 'Configuración actualizada', 'success'),
    });
  };

  const handleUserSubmit = (e) => {
    e.preventDefault();
    if (editingUser) {
      userForm.put(route('users.update', editingUser.id), {
        onSuccess: () => {
          setEditingUser(null);
          userForm.reset();
          Swal.fire('Éxito', 'Usuario actualizado', 'success');
        },
      });
    } else {
      userForm.post(route('users.store'), {
        preserveScroll: true,
        preserveState: true,
        onSuccess: () => {
          userForm.reset();
          Swal.fire('Éxito', 'Usuario creado correctamente', 'success');
        },
        onError: (errors) => {
          console.log(errors);
          Swal.fire('Error', 'Por favor verifica los datos ingresados', 'error');
        }
      });
    }
  };

  const deleteUser = (id) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción no se puede deshacer",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        userForm.delete(route('users.destroy', id), {
          onSuccess: () => Swal.fire('Eliminado', 'El usuario ha sido eliminado', 'success'),
        });
      }
    });
  };

  const startEdit = (user) => {
    setEditingUser(user);
    userForm.setData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <Head title="Configuración del Sistema" />
      
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center space-x-4 mb-8">
            <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-lg">
              <SettingsIcon size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Panel de Configuración</h1>
              <p className="text-slate-500">Administra los parámetros globales y usuarios del sistema</p>
            </div>
          </div>

          {/* TABS NAVIGATION */}
          <div className="flex space-x-1 bg-slate-200/50 p-1 rounded-xl mb-8 w-fit">
            <button 
              onClick={() => setActiveTab('empresa')}
              className={`flex items-center px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'empresa' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
            >
              <Building2 size={18} className="mr-2" /> Datos de la Empresa
            </button>
            <button 
              onClick={() => setActiveTab('usuarios')}
              className={`flex items-center px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'usuarios' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
            >
              <Users size={18} className="mr-2" /> Usuarios y Roles
            </button>
            <button 
              onClick={() => setActiveTab('preferencias')}
              className={`flex items-center px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'preferencias' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
            >
              <SettingsIcon size={18} className="mr-2" /> Preferencias y API
            </button>
          </div>

          {/* TAB CONTENT */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            
            {/* TAB 1: EMPRESA */}
            {activeTab === 'empresa' && (
              <form onSubmit={handleSettingsSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center"><FileText size={16} className="mr-2 text-indigo-500" /> Nombre de la Aplicación</label>
                    <input 
                      type="text" 
                      value={settingsForm.data.app_name}
                      onChange={e => settingsForm.setData('app_name', e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center"><Fingerprint size={16} className="mr-2 text-indigo-500" /> NIT / Identificación Fiscal</label>
                    <input 
                      type="text" 
                      value={settingsForm.data.company_nit}
                      onChange={e => settingsForm.setData('company_nit', e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center"><Phone size={16} className="mr-2 text-indigo-500" /> Teléfono de Contacto</label>
                    <input 
                      type="text" 
                      value={settingsForm.data.company_phone}
                      onChange={e => settingsForm.setData('company_phone', e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center"><MapPin size={16} className="mr-2 text-indigo-500" /> Dirección Física</label>
                    <input 
                      type="text" 
                      value={settingsForm.data.company_address}
                      onChange={e => settingsForm.setData('company_address', e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center"><FileText size={16} className="mr-2 text-indigo-500" /> Mensaje al pie del Ticket</label>
                  <textarea 
                    rows="3"
                    value={settingsForm.data.ticket_footer}
                    onChange={e => settingsForm.setData('ticket_footer', e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                  ></textarea>
                </div>
                <div className="pt-4 flex justify-end">
                  <button 
                    disabled={settingsForm.processing}
                    type="submit" 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center"
                  >
                    <Save size={18} className="mr-2" /> Guardar Cambios
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: USUARIOS */}
            {activeTab === 'usuarios' && (
              <div className="p-8">
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Formulario de Usuario */}
                  <div className="lg:w-1/3 p-6 bg-slate-50 rounded-2xl border border-slate-100 h-fit">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                      {editingUser ? <Edit size={18} className="mr-2 text-amber-500" /> : <UserPlus size={18} className="mr-2 text-emerald-500" />}
                      {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                    </h3>
                    <form onSubmit={handleUserSubmit} className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Nombre Completo</label>
                        <input 
                          type="text" 
                          required
                          value={userForm.data.name}
                          onChange={e => userForm.setData('name', e.target.value)}
                          className={`w-full mt-1 border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none ${userForm.errors.name ? 'border-red-500 bg-red-50' : 'border-slate-200'}`}
                        />
                        {userForm.errors.name && <p className="text-red-500 text-[10px] mt-1 font-bold">{userForm.errors.name}</p>}
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Correo Electrónico</label>
                        <input 
                          type="email" 
                          required
                          value={userForm.data.email}
                          onChange={e => userForm.setData('email', e.target.value)}
                          className={`w-full mt-1 border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none ${userForm.errors.email ? 'border-red-500 bg-red-50' : 'border-slate-200'}`}
                        />
                        {userForm.errors.email && <p className="text-red-500 text-[10px] mt-1 font-bold">{userForm.errors.email}</p>}
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase flex justify-between">
                          <span>Contraseña {editingUser && '(Opcional)'}</span>
                          <span className="text-[10px] text-indigo-400 normal-case font-medium italic">Mínimo 8 caracteres</span>
                        </label>
                        <input 
                          type="password" 
                          required={!editingUser}
                          value={userForm.data.password}
                          onChange={e => userForm.setData('password', e.target.value)}
                          className={`w-full mt-1 border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none ${userForm.errors.password ? 'border-red-500 bg-red-50' : 'border-slate-200'}`}
                          placeholder="••••••••"
                        />
                        {userForm.errors.password && <p className="text-red-500 text-[10px] mt-1 font-bold">{userForm.errors.password}</p>}
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Rol / Permisos</label>
                        <select 
                          value={userForm.data.role}
                          onChange={e => userForm.setData('role', e.target.value)}
                          className={`w-full mt-1 border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none ${userForm.errors.role ? 'border-red-500 bg-red-50' : 'border-slate-200'}`}
                        >
                          <option value="cashier">Cajero (Ventas/Logística)</option>
                          <option value="admin">Administrador (Acceso Total)</option>
                          <option value="driver">Motorista (Sólo Entregas)</option>
                        </select>
                        {userForm.errors.role && <p className="text-red-500 text-[10px] mt-1 font-bold">{userForm.errors.role}</p>}
                      </div>
                      <div className="pt-2 flex space-x-2">
                        <button 
                          type="submit" 
                          disabled={userForm.processing}
                          className={`flex-1 py-2.5 rounded-lg text-sm font-bold text-white shadow-md transition-all ${editingUser ? 'bg-amber-500 hover:bg-amber-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                        >
                          {editingUser ? 'Actualizar' : 'Crear Usuario'}
                        </button>
                        {editingUser && (
                          <button 
                            type="button"
                            onClick={() => {
                              setEditingUser(null);
                              userForm.reset();
                            }}
                            className="px-4 py-2.5 rounded-lg text-sm font-bold text-slate-600 border border-slate-200 hover:bg-slate-100"
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </form>
                  </div>

                  {/* Tabla de Usuarios */}
                  <div className="flex-1 overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="text-left py-4 px-2 text-xs font-bold text-slate-400 uppercase">Usuario</th>
                          <th className="text-left py-4 px-2 text-xs font-bold text-slate-400 uppercase">Correo</th>
                          <th className="text-left py-4 px-2 text-xs font-bold text-slate-400 uppercase">Rol</th>
                          <th className="text-right py-4 px-2 text-xs font-bold text-slate-400 uppercase">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {users.map(user => (
                          <tr key={user.id} className="hover:bg-slate-50/50 group transition-colors">
                            <td className="py-4 px-2">
                              <p className="font-bold text-slate-800">{user.name}</p>
                              {user.id === auth?.user?.id && <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">Tú</span>}
                            </td>
                            <td className="py-4 px-2 text-sm text-slate-500">{user.email}</td>
                            <td className="py-4 px-2">
                              <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                                user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
                                user.role === 'driver' ? 'bg-blue-100 text-blue-700' : 
                                'bg-slate-100 text-slate-700'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="py-4 px-2 text-right">
                              <div className="flex justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => startEdit(user)} className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all"><Edit size={16} /></button>
                                <button onClick={() => deleteUser(user.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: PREFERENCIAS */}
            {activeTab === 'preferencias' && (
              <form onSubmit={handleSettingsSubmit} className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center"><Truck size={18} className="mr-2 text-indigo-500" /> Logística</h3>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600">Costo de envío por defecto (Q)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        value={settingsForm.data.default_shipping_cost}
                        onChange={e => settingsForm.setData('default_shipping_cost', e.target.value)}
                        className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center"><Printer size={18} className="mr-2 text-indigo-500" /> Impresión</h3>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600">Tamaño del Ticket</label>
                      <select 
                        value={settingsForm.data.printer_size}
                        onChange={e => settingsForm.setData('printer_size', e.target.value)}
                        className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      >
                        <option value="80mm">80mm (Estándar Térmico)</option>
                        <option value="58mm">58mm (Mini Impresora / Bluetooth)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4 md:col-span-2">
                    <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center"><Key size={18} className="mr-2 text-indigo-500" /> Integraciones e IA</h3>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600">Gemini Cloud API Key</label>
                      <div className="relative">
                        <Key className="absolute left-3 top-3.5 text-slate-300" size={18} />
                        <input 
                          type="password" 
                          placeholder="Introduce tu clave API de Google Gemini"
                          value={settingsForm.data.gemini_api_key}
                          onChange={e => settingsForm.setData('gemini_api_key', e.target.value)}
                          className="w-full border border-slate-200 rounded-xl p-3 pl-10 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                      </div>
                      <p className="text-xs text-slate-400">Esta clave se utiliza para el procesamiento de voz y texto en el Modo Live.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button 
                    disabled={settingsForm.processing}
                    type="submit" 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center"
                  >
                    <Save size={18} className="mr-2" /> Guardar Preferencias
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
