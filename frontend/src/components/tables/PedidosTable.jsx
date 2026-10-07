import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Search, Filter, Eye, CheckCircle, XCircle, PlusCircle } from '../Icons';

export default function PedidosTable({ pedidos, onResponderPedido }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('Todos');

  const filteredPedidos = pedidos.filter(p => {
    const matchesSearch = 
      p.id.toString().includes(searchQuery) ||
      (p.cliente_nombre && p.cliente_nombre.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.lugar_entrega && p.lugar_entrega.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.vendedor_nombre && p.vendedor_nombre.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesEstado = selectedEstado === 'Todos' || p.estado_nombre === selectedEstado;

    return matchesSearch && matchesEstado;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#064e3b', letterSpacing: '-0.5px' }}>
            Listado General de Pedidos
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'rgba(23, 59, 45, 0.65)' }}>
            Registro completo de solicitudes, estados de logística y asignaciones a Hojas de Ruta.
          </p>
        </div>

        <button
          className="btn-v0-primary"
          onClick={() => navigate('/nuevo-pedido')}
        >
          <PlusCircle size={18} /> Cargar Nuevo Pedido
        </button>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="v0-card" style={{ padding: '16px 20px', background: '#ffffff', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(23, 59, 45, 0.4)' }}>
            <Search size={16} />
          </div>
          <input
            type="text"
            className="v0-input"
            style={{ paddingLeft: '36px' }}
            placeholder="Buscar por cliente, dirección o id..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} color="rgba(23, 59, 45, 0.6)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#173b2d' }}>Estado:</span>
          <select
            className="v0-input"
            style={{ width: '180px', padding: '8px 12px' }}
            value={selectedEstado}
            onChange={(e) => setSelectedEstado(e.target.value)}
          >
            <option value="Todos">Todos ({pedidos.length})</option>
            <option value="Solicitado">Solicitado</option>
            <option value="Aprobado">Aprobado</option>
            <option value="En Tránsito">En Tránsito</option>
            <option value="Entregado">Entregado</option>
            <option value="Rechazado">Rechazado</option>
          </select>
        </div>
      </div>

      {/* Tabla de Pedidos */}
      <div className="v0-card" style={{ padding: 0, overflow: 'hidden', background: '#ffffff' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#f8faf6', borderBottom: '1px solid rgba(6, 95, 70, 0.12)', color: '#064e3b' }}>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>ID</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Cliente</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Lugar de Entrega</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Vendedor</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Insumos / Productos</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Estado</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Hoja de Ruta</th>
                <th style={{ padding: '14px 18px', fontWeight: 700, textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredPedidos.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: '30px', textAlign: 'center', color: 'rgba(23, 59, 45, 0.5)' }}>
                    No se encontraron pedidos que coincidan con los criterios de búsqueda.
                  </td>
                </tr>
              ) : (
                filteredPedidos.map(p => {
                  const estadoClass = p.estado_nombre ? p.estado_nombre.toLowerCase().replace(' ', '-') : 'solicitado';
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid rgba(6, 95, 70, 0.08)', transition: 'background 0.15s' }}>
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: '#047857' }}>
                        #{p.id}
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: '#064e3b' }}>
                        {p.cliente_nombre}
                      </td>
                      <td style={{ padding: '14px 18px', color: '#173b2d' }}>
                        {p.lugar_entrega || 'A coordinar'}
                      </td>
                      <td style={{ padding: '14px 18px', color: 'rgba(23, 59, 45, 0.75)' }}>
                        {p.vendedor_nombre || 'Directo'}
                      </td>
                      <td style={{ padding: '14px 18px', color: '#173b2d' }}>
                        {p.items?.map(i => `${i.cantidad} ${i.unidad_abreviatura || ''} ${i.producto_nombre}`).join(', ')}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span className={`badge-v0 badge-${estadoClass}`}>
                          {p.estado_nombre}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        {p.codigo_viaje ? (
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#047857', background: '#ecfdf5', padding: '2px 8px', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
                            {p.codigo_viaje}
                          </span>
                        ) : (
                          <span style={{ color: 'rgba(23, 59, 45, 0.4)', fontStyle: 'italic', fontSize: '0.8rem' }}>
                            Sin asignar
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button
                            className="btn-v0-outline"
                            style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                            onClick={() => navigate(`/pedidos/${p.id}`)}
                          >
                            <Eye size={14} /> Ver Detalle
                          </button>

                          {p.estado_nombre === 'Solicitado' && onResponderPedido && (
                            <>
                              <button
                                className="btn-v0-primary"
                                style={{ padding: '6px 8px', fontSize: '0.78rem' }}
                                onClick={() => onResponderPedido(p.id, true, 'Aprobado')}
                                title="Aprobar Pedido"
                              >
                                <CheckCircle size={14} />
                              </button>
                              <button
                                className="btn-v0-outline"
                                style={{ padding: '6px 8px', fontSize: '0.78rem', color: '#dc2626', borderColor: '#fca5a5' }}
                                onClick={() => onResponderPedido(p.id, false, 'Rechazado')}
                                title="Rechazar Pedido"
                              >
                                <XCircle size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
