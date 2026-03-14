const fs = require('fs');
const filePath = 'c:/Users/nosde/OneDrive/Documentos/PROYECTOS/Control de Inventario/resources/js/Pages/POSDashboard.jsx';

let content = fs.readFileSync(filePath, 'utf8');

// Agregar importaciones
content = content.replace("import { \n  LayoutDashboard,", "import { \n  ChevronRight,\n  ChevronDown,\n  LayoutDashboard,");

// Actualizar props en POSDashboard y en renderizado de InventoryView
content = content.replace("export default function POSDashboard({ products, categories }) {", "export default function POSDashboard({ products, categories, suppliers }) {");
content = content.replace("<InventoryView products={products} categories={categories} />", "<InventoryView products={products} categories={categories} suppliers={suppliers} />");

const oldInventoryStart = "\n// 3. INVENTARIO VIEW\nfunction InventoryView({ products, categories }) {";
const oldInventoryEnd = "\n// 4. PEDIDOS Y LOGÍSTICA VIEW\n";

const newInventoryView = `
// 3. INVENTARIO VIEW
function InventoryView({ products, categories, suppliers }) {
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = (id) => setExpandedRows(prev => ({...prev, [id]: !prev[id]}));

  const emptyVariant = { sku: '', size: '', color: '', selling_price: '' };

  const { data, setData, post, put, delete: destroy, processing, reset } = useForm({
    name: '', description: '', category_id: '', image_url: '', variants: [{ ...emptyVariant }]
  });

  const generateRandomSKU = () => 'VAR-' + Math.random().toString(36).substr(2, 6).toUpperCase();

  const handleAddVariantRow = () => setData('variants', [...data.variants, { ...emptyVariant }]);
  const handleRemoveVariantRow = (index) => {
    const newVariants = [...data.variants]; newVariants.splice(index, 1); setData('variants', newVariants);
  };
  const updateVariantRow = (index, field, value) => {
    const newVariants = [...data.variants]; newVariants[index][field] = value; setData('variants', newVariants);
  };

  const purchaseForm = useForm({
    supplier_id: '', invoice_number: '', details: [{ product_variant_id: '', quantity: 1, unit_cost: '' }]
  });

  const handleAddPurchaseDetail = () => purchaseForm.setData('details', [...purchaseForm.data.details, { product_variant_id: '', quantity: 1, unit_cost: '' }]);
  const updatePurchaseDetail = (index, field, value) => {
    const newDetails = [...purchaseForm.data.details]; newDetails[index][field] = value; purchaseForm.setData('details', newDetails);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === '' || p.category_id === parseInt(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const allVariants = products.flatMap(p => (p.variants || []).map(v => ({...v, product_name: p.name})));

  const openAddModal = () => { setEditingProduct(null); reset(); setIsModalOpen(true); };
  const openEditModal = (product) => {
    setEditingProduct(product);
    setData({
      name: product.name, description: product.description || '', category_id: product.category_id || '',
      image_url: product.image_url || '', variants: product.variants || []
    });
    setIsModalOpen(true);
  };

  const handleProductSubmit = (e) => {
    e.preventDefault();
    if (editingProduct) {
      put(route('products.update', editingProduct.id), { onSuccess: () => setIsModalOpen(false) });
    } else {
      post(route('products.store'), { onSuccess: () => { setIsModalOpen(false); reset(); } });
    }
  };

  const handlePurchaseSubmit = (e) => {
    e.preventDefault();
    purchaseForm.post(route('purchase-entries.store'), {
       onSuccess: () => { setIsPurchaseModalOpen(false); purchaseForm.reset(); }
    });
  };

  const handleDelete = (id) => {
    if (confirm('¿Estás seguro de eliminar este producto y todas sus variantes?')) destroy(route('products.destroy', id));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
      <div className="p-6 border-b border-slate-200 flex flex-wrap gap-4 justify-between items-center bg-slate-50 rounded-t-xl">
        <div className="flex space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Buscar por código o nombre..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:border-indigo-500 outline-none w-64 shadow-sm transition-all" />
          </div>
        </div>
        <div className="flex space-x-3">
           <button onClick={() => setIsPurchaseModalOpen(true)} className="flex items-center px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">
             <PlusCircle className="w-4 h-4 mr-2" /> Ingresar Compra
           </button>
           <button onClick={openAddModal} className="flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
             <Plus className="w-4 h-4 mr-2" /> Nuevo Producto
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-500 text-sm border-b border-slate-200">
              <th className="px-6 py-4 font-medium w-10"></th>
              <th className="px-6 py-4 font-medium">Producto Padre</th>
              <th className="px-6 py-4 font-medium">Categoría</th>
              <th className="px-6 py-4 font-medium text-center">Variantes</th>
              <th className="px-6 py-4 font-medium text-center">Stock Total</th>
              <th className="px-6 py-4 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProducts.map(p => {
               const totalStock = p.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
               return (
                <React.Fragment key={p.id}>
                  <tr className="hover:bg-slate-50 transition-colors cursor-pointer group" onClick={() => toggleRow(p.id)}>
                    <td className="px-6 py-4">{expandedRows[p.id] ? <ChevronDown className="w-5 h-5 text-indigo-500" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}</td>
                    <td className="px-6 py-4"><div className="flex items-center"><div className="w-10 h-10 bg-slate-200 rounded-lg mr-3 flex items-center justify-center text-slate-400 overflow-hidden"><Package className="w-5 h-5" /></div><p className="font-bold text-slate-800">{p.name}</p></div></td>
                    <td className="px-6 py-4 text-sm text-slate-600">{p.category?.name || 'S/C'}</td>
                    <td className="px-6 py-4 text-center"><span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-xs font-bold">{p.variants?.length || 0}</span></td>
                    <td className="px-6 py-4 text-center"><span className={\`text-lg font-bold \${totalStock <= 0 ? 'text-red-500' : 'text-slate-800'}\`}>{totalStock}</span></td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={(e) => { e.stopPropagation(); openEditModal(p); }} className="text-slate-400 hover:text-indigo-600 p-1 ml-2"><Edit className="w-4 h-4" /></button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }} className="text-slate-400 hover:text-red-600 p-1 ml-2"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                  
                  {expandedRows[p.id] && p.variants && (
                    <tr className="bg-slate-50/50">
                      <td colSpan="6" className="p-0 border-b border-indigo-100">
                         <div className="px-14 py-4 bg-indigo-50/30">
                           <table className="w-full text-sm text-left">
                             <thead><tr className="text-slate-500 border-b border-slate-200"><th className="pb-2 font-medium">SKU</th><th className="pb-2 font-medium">Variante (Talla/Color)</th><th className="pb-2 font-medium text-right">Precio Venta (Q)</th><th className="pb-2 font-medium text-right">Costo Promedio (Q)</th><th className="pb-2 font-medium text-center">Stock</th><th className="pb-2 font-medium text-center">Apartados</th></tr></thead>
                             <tbody>
                               {p.variants.map(v => (
                                 <tr key={v.id} className="border-b border-slate-100 last:border-0 hover:bg-white">
                                   <td className="py-2 font-mono text-xs text-slate-600">{v.sku}</td>
                                   <td className="py-2"><span className="font-medium text-slate-800">{v.size || 'N/A'}</span> / <span className="text-slate-600">{v.color || 'N/A'}</span></td>
                                   <td className="py-2 text-right font-bold text-indigo-600">{parseFloat(v.selling_price).toFixed(2)}</td>
                                   <td className="py-2 text-right text-slate-500">{parseFloat(v.average_cost).toFixed(2)}</td>
                                   <td className="py-2 text-center">{v.stock <= 0 ? <span className="text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded text-xs">Ag.</span> : <span className="font-bold">{v.stock}</span>}</td>
                                   <td className="py-2 text-center text-amber-600">{v.reserved}</td>
                                 </tr>
                               ))}
                             </tbody>
                           </table>
                         </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
               );
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-slate-800 text-lg">Nuevo Producto con Variantes</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><Plus className="w-6 h-6 rotate-45" /></button>
            </div>
            <form onSubmit={handleProductSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-bold text-indigo-800 border-b pb-2">Información General</h4>
                  <div><label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nombre</label><input type="text" value={data.name} onChange={e => setData('name', e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:bg-white focus:border-indigo-500 outline-none" /></div>
                  <div><label className="block text-xs font-bold text-slate-400 uppercase mb-1">Categoría</label><select value={data.category_id} onChange={e => setData('category_id', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:bg-white focus:border-indigo-500 outline-none"><option value="">Sin Categoría</option>{categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                  <div><label className="block text-xs font-bold text-slate-400 uppercase mb-1">Descripción</label><textarea value={data.description} onChange={e => setData('description', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:bg-white focus:border-indigo-500 outline-none h-20" /></div>
                </div>
                <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-center border-b pb-2"><h4 className="font-bold text-indigo-800">Variantes</h4><button type="button" onClick={handleAddVariantRow} className="text-indigo-600 hover:text-indigo-800 text-sm font-bold flex items-center"><Plus className="w-4 h-4 mr-1"/> Agregar Variante</button></div>
                  <div className="max-h-[300px] overflow-y-auto pr-2 space-y-3">
                    {data.variants.map((variant, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm relative group">
                        {data.variants.length > 1 && (<button type="button" onClick={() => handleRemoveVariantRow(idx)} className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><Plus className="w-3 h-3 rotate-45" /></button>)}
                        <div className="grid grid-cols-2 gap-3 mb-2">
                          <div><label className="text-[10px] font-bold text-slate-400 uppercase">Talla</label><input placeholder="Ej. L" type="text" value={variant.size} onChange={e => updateVariantRow(idx, 'size', e.target.value)} className="w-full border-b border-slate-200 text-sm py-1 outline-none focus:border-indigo-500" /></div>
                          <div><label className="text-[10px] font-bold text-slate-400 uppercase">Color</label><input placeholder="Ej. Rojo" type="text" value={variant.color} onChange={e => updateVariantRow(idx, 'color', e.target.value)} className="w-full border-b border-slate-200 text-sm py-1 outline-none focus:border-indigo-500" /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div><label className="text-[10px] items-center flex justify-between font-bold text-slate-400 uppercase">SKU<span onClick={() => updateVariantRow(idx, 'sku', generateRandomSKU())} className="text-indigo-500 cursor-pointer font-normal hover:underline">Autogenerar</span></label><input type="text" value={variant.sku} onChange={e => updateVariantRow(idx, 'sku', e.target.value)} required className="w-full border-b border-slate-200 text-sm py-1 outline-none focus:border-indigo-500 font-mono text-slate-600" /></div>
                          <div><label className="text-[10px] font-bold text-slate-400 uppercase">Precio Venta (Q)</label><input type="number" step="0.01" value={variant.selling_price} onChange={e => updateVariantRow(idx, 'selling_price', e.target.value)} required className="w-full border-b border-slate-200 font-bold text-indigo-600 text-sm py-1 outline-none focus:border-indigo-500" /></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="pt-4 flex space-x-3 border-t"><button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50">Cancelar</button><button type="submit" disabled={processing} className="flex-1 px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700">Guardar</button></div>
            </form>
          </div>
        </div>
      )}

      {isPurchaseModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-emerald-600 text-white flex justify-between items-center shrink-0">
              <h3 className="font-bold text-lg flex items-center"><Truck className="w-5 h-5 mr-2"/> Registro de Entrada por Compra</h3>
              <button onClick={() => setIsPurchaseModalOpen(false)} className="text-emerald-200 hover:text-white"><Plus className="w-6 h-6 rotate-45" /></button>
            </div>
            <form onSubmit={handlePurchaseSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-slate-400 uppercase mb-1">Proveedor</label><select required value={purchaseForm.data.supplier_id} onChange={e => purchaseForm.setData('supplier_id', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 outline-none"><option value="">Seleccione Proveedor</option>{suppliers?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                <div><label className="block text-xs font-bold text-slate-400 uppercase mb-1">No. Factura / Recibo</label><input required type="text" value={purchaseForm.data.invoice_number} onChange={e => purchaseForm.setData('invoice_number', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 outline-none"/></div>
              </div>
              <div>
                <div className="flex justify-between items-end border-b pb-2 mb-4"><h4 className="font-bold text-slate-800">Detalles de la Compra</h4><button type="button" onClick={handleAddPurchaseDetail} className="text-emerald-600 hover:text-emerald-800 text-sm font-bold flex items-center"><Plus className="w-4 h-4 mr-1"/> Añadir Fila</button></div>
                <div className="space-y-3">
                  {purchaseForm.data.details.map((detail, idx) => (
                    <div key={idx} className="flex gap-3 items-start bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <div className="flex-1"><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Producto / Variante</label><select required value={detail.product_variant_id} onChange={e => updatePurchaseDetail(idx, 'product_variant_id', e.target.value)} className="w-full border border-slate-200 rounded text-sm py-1.5 px-2 outline-none focus:border-emerald-500 shrink-0"><option value="">Buscar Variante...</option>{allVariants.map(v => (<option key={v.id} value={v.id}>{v.product_name} - {v.size} {v.color} ({v.sku})</option>))}</select></div>
                      <div className="w-24"><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Cantidad</label><input required type="number" min="1" value={detail.quantity} onChange={e => updatePurchaseDetail(idx, 'quantity', e.target.value)} className="w-full border border-slate-200 rounded text-sm py-1.5 px-2 outline-none focus:border-emerald-500 text-center" /></div>
                      <div className="w-32"><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Costo Unit. (Q)</label><input required type="number" step="0.01" value={detail.unit_cost} onChange={e => updatePurchaseDetail(idx, 'unit_cost', e.target.value)} className="w-full border border-slate-200 rounded text-sm py-1.5 px-2 outline-none focus:border-emerald-500 text-right font-medium text-emerald-700" /></div>
                      {purchaseForm.data.details.length > 1 && (<div className="pt-5"><button type="button" onClick={() => { const nd = [...purchaseForm.data.details]; nd.splice(idx,1); purchaseForm.setData('details', nd); }} className="text-red-400 hover:text-red-600 mt-1"><Trash2 className="w-5 h-5"/></button></div>)}
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-4 mt-6 border-t flex space-x-3"><button type="button" onClick={() => setIsPurchaseModalOpen(false)} className="px-6 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50">Cancelar</button><button type="submit" disabled={purchaseForm.processing} className="flex-1 px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700">{purchaseForm.processing ? 'Guardando...' : 'Completar Compra'}</button></div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
\n// 4. PEDIDOS Y LOGÍSTICA VIEW\n`;

const startIndex = content.indexOf(oldInventoryStart);
const endIndex = content.indexOf(oldInventoryEnd);

if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + newInventoryView + content.substring(endIndex + oldInventoryEnd.length - "\n// 4. PEDIDOS Y LOGÍSTICA VIEW\n".length);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Inventario modificado correctamente.");
} else {
  console.error("No se pudo encontrar el componente InventoryView en el archivo.");
}
