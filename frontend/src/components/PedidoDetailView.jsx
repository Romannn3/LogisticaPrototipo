import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ClipboardList, ArrowRight, MapPin, ExternalLink, Package, User, Truck, CheckCircle, XCircle } from './Icons';

export default function PedidoDetailView({ pedidos, viajes, onResponderPedido }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const pedidoId = parseInt(id);
  const pedido = pedidos.find(p => p.id === pedidoId);

  if (!pedido) {
    return (
      <div className="v0-card" style={{ padding: '40px', textAlign: 'center', background: '#ffffff' }}>
        <h3 style={{ fontSize: '1.2rem', color: '#dc2626', marginBottom: '12px' }}>Pedido no encontrado</h3>
        <p style={{ color: 'rgba(23, 59, 45, 0.65)', marginBottom: '20px' }}>
          El pedido con ID #{id} no existe o fue eliminado.
        </p>
        <button className="btn-v0-outline" onClick={() => navigate('/pedidos')}>
          Volver al Listado de Pedidos
        </button>
      </div>
    );
  }

  const viajeAsignado = viajes?.find(v => v.id === pedido.id_viaje);
  const estadoClass = pedido.estado_nombre ? pedido.estado_nombre.toLowerCase().replace(' ', '-') : 'solicitado';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
      
      {/* Botón Volver */}
      <div>
        <button
          className="btn-v0-outline"
          style={{ fontSize: '0.85rem', padding: '6px 14px' }}
          onClick={() => navigate(-1)}
        >
          ← Volver
        </button>
      </div>

      {/* Header del Pedido */}
      <div className="v0-card" style={{ padding: '24px', background: '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#064e3b' }}>
                Pedido #{pedido.id}
              </span>
              <span className={`badge-v0 badge-${estadoClass}`}>
                {pedido.estado_nombre}
              </span>
            </div>
            <div style={{ fontSize: '0.88rem', color: 'rgba(23, 59, 45, 0.65)' }}>
              Registrado el: {pedido.fecha_creacion || 'Reciente'}
            </div>
          </div>

          {pedido.estado_nombre === 'Solicitado' && onResponderPedido && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn-v0-primary"
                onClick={() => onResponderPedido(pedido.id, true, 'Aprobado')}
              >
                <CheckCircle size={18} /> Aprobar Pedido
              </button>
              <button
                className="btn-v0-outline"
                style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                onClick={() => onResponderPedido(pedido.id, false, 'Rechazado')}
              >
                <XCircle size={18} /> Rechazar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Grid de Información Principal */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
        
        {/* Card 1: Cliente & Entrega */}
        <div className="v0-card" style={{ padding: '20px', background: '#ffffff' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#064e3b', marginBottom: '14px', borderBottom: '1px solid rgba(6, 95, 70, 0.1)', paddingBottom: '8px' }}>
            Información del Cliente y Destino
          </h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
            <div>
              <span style={{ color: 'rgba(23, 59, 45, 0.6)', fontWeight: 600 }}>Cliente:</span>{' '}
              <strong style={{ color: '#064e3b' }}>{pedido.cliente_nombre}</strong>
            </div>

            <div>
              <span style={{ color: 'rgba(23, 59, 45, 0.6)', fontWeight: 600 }}>Vendedor:</span>{' '}
              <span style={{ color: '#173b2d' }}>{pedido.vendedor_nombre || 'Venta directa'}</span>
            </div>

            <div>
              <span style={{ color: 'rgba(23, 59, 45, 0.6)', fontWeight: 600 }}>Lugar de Entrega:</span>{' '}
              <span style={{ color: '#173b2d' }}>{pedido.lugar_entrega || 'A coordinar'}</span>
            </div>

            {pedido.link_google_maps && (
              <div style={{ marginTop: '6px' }}>
                <a
                  href={pedido.link_google_maps}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-v0-outline"
                  style={{ fontSize: '0.78rem', padding: '6px 12px', background: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <ExternalLink size={14} /> Abrir Coordenadas GPS en Google Maps
                </a>
              </div>
            )}

            {pedido.comentarios && (
              <div style={{ background: '#f8faf6', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(6, 95, 70, 0.1)', marginTop: '6px', fontStyle: 'italic', color: '#78350f' }}>
                <strong>Comentarios:</strong> "{pedido.comentarios}"
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Hoja de Ruta & Logística */}
        <div className="v0-card" style={{ padding: '20px', background: '#ffffff' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#064e3b', marginBottom: '14px', borderBottom: '1px solid rgba(6, 95, 70, 0.1)', paddingBottom: '8px' }}>
            Asignación de Logística y Transporte
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
            <div>
              <span style={{ color: 'rgba(23, 59, 45, 0.6)', fontWeight: 600 }}>Hoja de Ruta:</span>{' '}
              {pedido.codigo_viaje ? (
                <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#047857', background: '#ecfdf5', padding: '3px 8px', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
                  {pedido.codigo_viaje}
                </span>
              ) : (
                <span style={{ color: 'rgba(23, 59, 45, 0.5)', fontStyle: 'italic' }}>Pendiente de asignación a viaje</span>
              )}
            </div>

            {viajeAsignado && (
              <>
                <div>
                  <span style={{ color: 'rgba(23, 59, 45, 0.6)', fontWeight: 600 }}>Chofer Asignado:</span>{' '}
                  <strong style={{ color: '#064e3b' }}>{viajeAsignado.chofer_nombre || 'No asignado'}</strong>
                </div>

                <div>
                  <span style={{ color: 'rgba(23, 59, 45, 0.6)', fontWeight: 600 }}>Vehículo / Dominio:</span>{' '}
                  <span style={{ color: '#173b2d' }}>{viajeAsignado.vehiculo_descripcion || 'No asignado'}</span>
                </div>

                <div>
                  <span style={{ color: 'rgba(23, 59, 45, 0.6)', fontWeight: 600 }}>Estado del Viaje:</span>{' '}
                  <span className={`badge-v0 badge-${viajeAsignado.estado_nombre?.toLowerCase().replace(' ', '-')}`}>
                    {viajeAsignado.estado_nombre}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

      </div>

      {/* Card 3: Productos e Insumos */}
      <div className="v0-card" style={{ padding: '20px', background: '#ffffff' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#064e3b', marginBottom: '14px' }}>
          Items e Insumos Solicitados
        </h4>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#f8faf6', borderBottom: '1px solid rgba(6, 95, 70, 0.12)', color: '#064e3b' }}>
                <th style={{ padding: '10px 14px', fontWeight: 700 }}>Item</th>
                <th style={{ padding: '10px 14px', fontWeight: 700 }}>Producto / Insumo</th>
                <th style={{ padding: '10px 14px', fontWeight: 700 }}>Cantidad</th>
                <th style={{ padding: '10px 14px', fontWeight: 700 }}>Unidad de Medida</th>
              </tr>
            </thead>
            <tbody>
              {pedido.items && pedido.items.length > 0 ? (
                pedido.items.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(6, 95, 70, 0.08)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 600, color: '#047857' }}>#{idx + 1}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#064e3b' }}>{item.producto_nombre}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#173b2d' }}>{item.cantidad}</td>
                    <td style={{ padding: '10px 14px', color: 'rgba(23, 59, 45, 0.8)' }}>{item.unidad_nombre || item.unidad_abreviatura || 'Unidad'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: 'rgba(23, 59, 45, 0.5)' }}>
                    Sin items registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
