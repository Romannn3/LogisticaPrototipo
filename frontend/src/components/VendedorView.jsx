import React, { useState } from 'react';
import { ClipboardList, Plus, Package, MapPin, CheckCircle, Clock, Eye, Truck, User, XCircle, AlertTriangle } from './Icons';

export default function VendedorView({
  pedidos,
  clientes,
  productos,
  unidades,
  onCreatePedido,
  mode = 'nuevo' // 'nuevo' | 'pedidos'
}) {
  // State Form Solicitar Pedido
  const [selectedCliente, setSelectedCliente] = useState('');
  const [lugarEntrega, setLugarEntrega] = useState('');
  const [comentarios, setComentarios] = useState('');
  const [items, setItems] = useState([{ id_producto: '', cantidad: 1, id_unidad: '' }]);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // State Modal Detalle de Pedido
  const [pedidoModal, setPedidoModal] = useState(null);

  const handleAddItem = () => {
    setItems([...items, { id_producto: '', cantidad: 1, id_unidad: '' }]);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!selectedCliente) {
      setValidationError('Debe seleccionar un cliente registrado.');
      return;
    }

    if (!lugarEntrega.trim()) {
      setValidationError('Debe ingresar el lugar de entrega o dirección rural.');
      return;
    }

    const itemsValidos = items.filter(i => i.id_producto && parseFloat(i.cantidad) > 0);
    if (itemsValidos.length === 0) {
      setValidationError('Debe agregar al menos un insumo con cantidad mayor a 0.');
      return;
    }

    setSubmitting(true);
    setSubmitSuccess(false);

    try {
      const itemsPayload = itemsValidos.map(i => ({
        id_producto: parseInt(i.id_producto),
        cantidad: parseFloat(i.cantidad),
        id_unidad: i.id_unidad ? parseInt(i.id_unidad) : null
      }));

      await onCreatePedido({
        id_cliente: parseInt(selectedCliente),
        lugar_entrega: lugarEntrega.trim(),
        comentarios: comentarios,
        items: itemsPayload
      });

      setSubmitSuccess(true);
      setSelectedCliente('');
      setLugarEntrega('');
      setComentarios('');
      setItems([{ id_producto: '', cantidad: 1, id_unidad: '' }]);
    } catch (err) {
      console.error("Error al crear solicitud de pedido:", err);
      setValidationError("Ocurrió un error al enviar la solicitud de pedido.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
      
      {/* VISTA 1: SOLICITAR NUEVO PEDIDO */}
      {mode === 'nuevo' && (
        <div className="v0-card" style={{ padding: '28px', background: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <ClipboardList size={24} color="#047857" />
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#064e3b' }}>
                Solicitar Nuevo Pedido de Venta
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'rgba(23, 59, 45, 0.65)' }}>
                Ingresa los datos del cliente e insumos requeridos para enviar la solicitud al área de logística.
              </p>
            </div>
          </div>

          <style>{`
            @keyframes bounceInSuccess {
              0% { opacity: 0; transform: scale(0.85); }
              50% { opacity: 1; transform: scale(1.03); }
              100% { opacity: 1; transform: scale(1); }
            }
          `}</style>

          {submitSuccess && (
            <div style={{
              animation: 'bounceInSuccess 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
              background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
              border: '2px solid #4ade80',
              color: '#14532d',
              padding: '20px',
              borderRadius: '14px',
              marginBottom: '20px',
              textAlign: 'center',
              boxShadow: '0 10px 25px rgba(22, 163, 74, 0.15)'
            }}>
              <div style={{ display: 'inline-flex', padding: '10px', background: '#22c55e', borderRadius: '50%', color: '#ffffff', marginBottom: '8px' }}>
                <CheckCircle size={28} />
              </div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#14532d', margin: '4px 0' }}>
                ¡Solicitud de Pedido Enviada a Logística!
              </h4>
              <p style={{ fontSize: '0.88rem', color: '#166534', margin: '4px 0 0 0' }}>
                El equipo de coordinación revisará y aprobará el pedido a la brevedad.
              </p>
            </div>
          )}

          {validationError && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} color="#dc2626" />
              <span>{validationError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#173b2d', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                Seleccionar Cliente *
              </label>
              <select
                className="v0-input"
                required
                value={selectedCliente}
                onChange={(e) => {
                  setSelectedCliente(e.target.value);
                  setSubmitSuccess(false);
                }}
              >
                <option value="">-- Seleccionar cliente --</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre} ({c.tipo_descripcion})</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: '#173b2d', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                Lugar de Entrega / Dirección Rural
              </label>
              <input
                type="text"
                className="v0-input"
                placeholder="Ej: Estancia San Pedro, Ruta 11 Km 15"
                value={lugarEntrega}
                onChange={(e) => setLugarEntrega(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: '#173b2d', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                Comentarios / Observaciones para Logística
              </label>
              <input
                type="text"
                className="v0-input"
                placeholder="Ej: Recibe el capataz después de las 14hs"
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
              />
            </div>

            {/* Items del Pedido */}
            <div style={{ background: '#f8faf6', padding: '16px', borderRadius: '12px', border: '1px solid rgba(6, 95, 70, 0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#064e3b' }}>Insumos / Productos del Pedido</span>
                <button
                  type="button"
                  className="btn-v0-outline"
                  style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                  onClick={handleAddItem}
                >
                  + Agregar Producto
                </button>
              </div>

              {items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <select
                    className="v0-input"
                    style={{ flex: 2, fontSize: '0.85rem' }}
                    value={item.id_producto}
                    onChange={(e) => handleItemChange(idx, 'id_producto', e.target.value)}
                  >
                    <option value="">Seleccionar insumo...</option>
                    {productos.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>

                  <input
                    type="number"
                    className="v0-input"
                    style={{ flex: 1, fontSize: '0.85rem' }}
                    placeholder="Cant."
                    min="0.1"
                    step="any"
                    value={item.cantidad}
                    onChange={(e) => handleItemChange(idx, 'cantidad', e.target.value)}
                  />

                  <select
                    className="v0-input"
                    style={{ flex: 1, fontSize: '0.85rem' }}
                    value={item.id_unidad}
                    onChange={(e) => handleItemChange(idx, 'id_unidad', e.target.value)}
                  >
                    <option value="">Unidad...</option>
                    {unidades.map(u => (
                      <option key={u.id} value={u.id}>{u.abreviatura || u.nombre}</option>
                    ))}
                  </select>

                  {items.length > 1 && (
                    <button
                      type="button"
                      className="btn-v0-outline"
                      style={{ color: '#dc2626', borderColor: '#fca5a5', padding: '4px 8px' }}
                      onClick={() => handleRemoveItem(idx)}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="submit"
              className="btn-v0-primary"
              style={{ padding: '14px', marginTop: '10px', justifyContent: 'center', fontSize: '0.95rem' }}
              disabled={submitting || !selectedCliente}
            >
              <Plus size={18} /> {submitting ? 'Enviando Solicitud...' : 'Enviar Solicitud a Logística'}
            </button>
          </form>
        </div>
      )}

      {/* VISTA 2: MIS PEDIDOS (SOLO CONSULTA CON DETALLE) */}
      {mode === 'pedidos' && (
        <div className="v0-card" style={{ padding: '24px', background: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#064e3b' }}>
                Mis Pedidos y Seguimiento de Estado
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'rgba(23, 59, 45, 0.65)' }}>
                Consulta el estado de aprobación y asignación de transporte de tus solicitudes de venta.
              </p>
            </div>
            <span className="badge-v0 badge-aprobado">{pedidos.length} solicitudes</span>
          </div>

          {/* Tabla de Mis Pedidos */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#f8faf6', borderBottom: '1px solid rgba(6, 95, 70, 0.12)', color: '#064e3b' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>ID</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Cliente</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Lugar de Entrega</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Insumos</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Estado</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Hoja de Ruta</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Detalle</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: 'rgba(23, 59, 45, 0.5)' }}>
                      No tienes pedidos registrados aún.
                    </td>
                  </tr>
                ) : (
                  pedidos.map(p => {
                    const estadoClass = p.estado_nombre ? p.estado_nombre.toLowerCase().replace(' ', '-') : 'solicitado';

                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid rgba(6, 95, 70, 0.08)' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 700, color: '#047857' }}>
                          #{p.id}
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 700, color: '#064e3b' }}>
                          {p.cliente_nombre}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#173b2d' }}>
                          {p.lugar_entrega || 'A coordinar'}
                        </td>
                        <td style={{ padding: '12px 16px', color: 'rgba(23, 59, 45, 0.8)' }}>
                          {p.items?.map(i => `${i.cantidad} ${i.unidad_abreviatura || ''} ${i.producto_nombre}`).join(', ')}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span className={`badge-v0 badge-${estadoClass}`}>
                            {p.estado_nombre}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {p.codigo_viaje ? (
                            <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#047857', background: '#ecfdf5', padding: '2px 8px', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
                              {p.codigo_viaje}
                            </span>
                          ) : (
                            <span style={{ color: 'rgba(23, 59, 45, 0.4)', fontStyle: 'italic', fontSize: '0.8rem' }}>
                              Sin asignar
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <button
                            className="btn-v0-outline"
                            style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                            onClick={() => setPedidoModal(p)}
                          >
                            <Eye size={14} /> Ver Detalle
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL CONSULTA DE DETALLE PARA EL VENDEDOR */}
      {pedidoModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(23, 59, 45, 0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="v0-card" style={{ width: '100%', maxWidth: '540px', padding: '24px', background: '#ffffff', border: '1px solid rgba(6, 95, 70, 0.2)', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(6, 95, 70, 0.1)', paddingBottom: '10px' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#064e3b' }}>
                  Detalle del Pedido #{pedidoModal.id}
                </h3>
                <span className={`badge-v0 badge-${pedidoModal.estado_nombre?.toLowerCase().replace(' ', '-')}`}>
                  {pedidoModal.estado_nombre}
                </span>
              </div>
              <button onClick={() => setPedidoModal(null)} style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'rgba(23, 59, 45, 0.5)' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem' }}>
              <div><strong>Cliente:</strong> {pedidoModal.cliente_nombre}</div>
              <div><strong>Lugar de Entrega:</strong> {pedidoModal.lugar_entrega || 'A coordinar'}</div>
              {pedidoModal.comentarios && <div><strong>Comentarios:</strong> "{pedidoModal.comentarios}"</div>}

              <div style={{ background: '#f8faf6', padding: '12px', borderRadius: '8px', border: '1px solid rgba(6, 95, 70, 0.1)' }}>
                <strong>Insumos Solicitados:</strong>
                <ul style={{ paddingLeft: '18px', marginTop: '6px' }}>
                  {pedidoModal.items?.map((item, idx) => (
                    <li key={idx}>
                      {item.cantidad} {item.unidad_abreviatura || item.unidad_nombre || ''} — <strong>{item.producto_nombre}</strong>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Información de Transporte si está asignado */}
              <div style={{ background: '#ecfdf5', padding: '12px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                <strong style={{ color: '#047857' }}>Estado de Transporte / Hoja de Ruta:</strong>
                {pedidoModal.codigo_viaje ? (
                  <div style={{ marginTop: '4px', color: '#064e3b' }}>
                    <div>Código Viaje: <strong>{pedidoModal.codigo_viaje}</strong></div>
                  </div>
                ) : (
                  <div style={{ color: 'rgba(23, 59, 45, 0.65)', marginTop: '4px', fontStyle: 'italic' }}>
                    Pendiente de asignación a Hoja de Ruta por el equipo de logística.
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button className="btn-v0-outline" onClick={() => setPedidoModal(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
