import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Truck, Send, ExternalLink, Eye, ArrowRight, Package, User, CheckCircle } from './Icons';

export default function ViajeDetailView({
  viajes,
  pedidos,
  onAsignarPedido,
  onDesasignarPedido,
  onDeleteViaje
}) {
  const { id } = useParams();
  const navigate = useNavigate();

  const viajeId = parseInt(id);
  const viaje = viajes.find(v => v.id === viajeId);

  if (!viaje) {
    return (
      <div className="v0-card" style={{ padding: '40px', textAlign: 'center', background: '#ffffff' }}>
        <h3 style={{ fontSize: '1.2rem', color: '#dc2626', marginBottom: '12px' }}>Hoja de Ruta no encontrada</h3>
        <p style={{ color: 'rgba(23, 59, 45, 0.65)', marginBottom: '20px' }}>
          La Hoja de Ruta con ID #{id} no existe o fue eliminada.
        </p>
        <button className="btn-v0-outline" onClick={() => navigate('/viajes')}>
          Volver a la Lista de Viajes
        </button>
      </div>
    );
  }

  const pedidosAprobadosSinViaje = pedidos.filter(p => p.estado_nombre === 'Aprobado' && !p.id_viaje);
  const estadoClass = viaje.estado_nombre ? viaje.estado_nombre.toLowerCase().replace(' ', '-') : 'creado';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
      
      {/* Botón Volver */}
      <div>
        <button
          className="btn-v0-outline"
          style={{ fontSize: '0.85rem', padding: '6px 14px' }}
          onClick={() => navigate('/viajes')}
        >
          ← Volver a Viajes
        </button>
      </div>

      {/* Header del Viaje */}
      <div className="v0-card" style={{ padding: '24px', background: '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
              <span style={{
                fontFamily: 'monospace',
                fontSize: '1.4rem',
                fontWeight: 800,
                background: '#ecfdf5',
                color: '#047857',
                padding: '4px 12px',
                borderRadius: '8px',
                border: '1px solid #a7f3d0'
              }}>
                {viaje.codigo_viaje}
              </span>
              <span className={`badge-v0 badge-${estadoClass}`}>
                {viaje.estado_nombre}
              </span>
            </div>
            <div style={{ fontSize: '0.88rem', color: 'rgba(23, 59, 45, 0.65)' }}>
              Creado el: {viaje.fecha_creacion || 'Reciente'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {viaje.whatsapp_link && (
              <a
                href={viaje.whatsapp_link}
                target="_blank"
                rel="noreferrer"
                className="btn-v0-primary"
                style={{ fontSize: '0.85rem', padding: '8px 14px', background: '#128c7e' }}
              >
                <Send size={16} /> Compartir por WhatsApp
              </a>
            )}

            <button
              className="btn-v0-outline"
              style={{ fontSize: '0.85rem', padding: '8px 12px', color: '#dc2626', borderColor: '#fca5a5' }}
              onClick={() => {
                if (window.confirm("¿Seguro que deseas eliminar este Viaje?")) {
                  onDeleteViaje(viaje.id);
                  navigate('/viajes');
                }
              }}
            >
              Eliminar Viaje
            </button>
          </div>
        </div>
      </div>

      {/* Datos del Chofer y Vehículo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        <div className="v0-card" style={{ padding: '20px', background: '#ffffff' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#064e3b', marginBottom: '12px', borderBottom: '1px solid rgba(6, 95, 70, 0.1)', paddingBottom: '6px' }}>
            Chofer y Conductor Asignado
          </h4>
          <div style={{ fontSize: '0.9rem', color: '#173b2d', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div><strong>Nombre:</strong> {viaje.chofer_nombre || 'Sin chofer asignado'}</div>
            <div><strong>DNI:</strong> {viaje.chofer_dni || 'N/D'}</div>
            <div><strong>Celular:</strong> {viaje.chofer_celular || 'N/D'}</div>
          </div>
        </div>

        <div className="v0-card" style={{ padding: '20px', background: '#ffffff' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#064e3b', marginBottom: '12px', borderBottom: '1px solid rgba(6, 95, 70, 0.1)', paddingBottom: '6px' }}>
            Vehículo de la Flota
          </h4>
          <div style={{ fontSize: '0.9rem', color: '#173b2d', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div><strong>Modelo:</strong> {viaje.vehiculo_descripcion || 'Sin vehículo asignado'}</div>
            <div><strong>Dominio / Patente:</strong> {viaje.vehiculo_patente || 'N/D'}</div>
            {viaje.notas && (
              <div style={{ fontStyle: 'italic', color: '#78350f', background: '#fef3c7', padding: '6px 10px', borderRadius: '6px', marginTop: '4px', fontSize: '0.82rem' }}>
                <strong>Notas:</strong> "{viaje.notas}"
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Lista de Pedidos Asignados en esta Hoja de Ruta */}
      <div className="v0-card" style={{ padding: '24px', background: '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#064e3b' }}>
            Paradas y Pedidos en esta Hoja de Ruta ({viaje.pedidos?.length || 0})
          </h4>

          {/* Selector para asignar pedidos aprobados a este viaje */}
          {pedidosAprobadosSinViaje.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <select
                className="v0-input"
                style={{ padding: '6px 10px', fontSize: '0.85rem', width: '250px' }}
                onChange={(e) => {
                  if (e.target.value) {
                    onAsignarPedido(viaje.id, parseInt(e.target.value));
                    e.target.value = '';
                  }
                }}
              >
                <option value="">+ Asignar pedido aprobado...</option>
                {pedidosAprobadosSinViaje.map(p => (
                  <option key={p.id} value={p.id}>
                    #{p.id} - {p.cliente_nombre} ({p.lugar_entrega || 'Sin loc.'})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {(!viaje.pedidos || viaje.pedidos.length === 0) ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'rgba(23, 59, 45, 0.5)', fontStyle: 'italic' }}>
            No hay pedidos asignados a este viaje aún. Utiliza el selector superior para agregar un pedido aprobado.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {viaje.pedidos.map((p, idx) => (
              <div key={p.id} style={{
                background: '#f8faf6',
                border: '1px solid rgba(6, 95, 70, 0.12)',
                borderRadius: '10px',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#064e3b', marginBottom: '4px' }}>
                      Parada #{idx + 1}: {p.cliente_nombre} — Pedido #{p.id}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#173b2d' }}>
                      <strong>Lugar de Entrega:</strong> {p.lugar_entrega || 'A coordinar'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(23, 59, 45, 0.7)', marginTop: '4px' }}>
                      <strong>Insumos:</strong> {p.items?.map(i => `${i.cantidad} ${i.unidad_abreviatura || ''} ${i.producto_nombre}`).join(', ')}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      className="btn-v0-outline"
                      style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                      onClick={() => navigate(`/pedidos/${p.id}`)}
                    >
                      <Eye size={14} /> Ver Pedido
                    </button>

                    {p.link_google_maps && (
                      <a
                        href={p.link_google_maps}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-v0-outline"
                        style={{ padding: '6px 10px', fontSize: '0.78rem', background: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <ExternalLink size={12} /> GPS
                      </a>
                    )}

                    <button
                      className="btn-v0-outline"
                      style={{ padding: '6px 10px', fontSize: '0.78rem', color: '#dc2626', borderColor: '#fca5a5' }}
                      onClick={() => onDesasignarPedido(viaje.id, p.id)}
                    >
                      Desasignar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
