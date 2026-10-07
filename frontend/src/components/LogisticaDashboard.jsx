import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, AlertTriangle, CheckCircle, XCircle, Plus, Eye, ExternalLink, Package, Users, ClipboardList } from './Icons';

export default function LogisticaDashboard({
  pedidos,
  viajes,
  choferes,
  vehiculos,
  alertas,
  onResponderPedido
}) {
  const navigate = useNavigate();

  const solicitudesPendientes = pedidos.filter(p => p.estado_nombre === 'Solicitado');
  const pedidosAprobadosSinViaje = pedidos.filter(p => p.estado_nombre === 'Aprobado' && !p.id_viaje);
  const viajesActivos = viajes.filter(v => v.estado_nombre !== 'Finalizado' && v.estado_nombre !== 'Cancelado');

  const totalAlertas = (alertas?.choferes_alertas?.length || 0) + (alertas?.vehiculos_alertas?.length || 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header del Dashboard */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#064e3b', letterSpacing: '-0.5px' }}>
            Tablero General de Operaciones
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'rgba(23, 59, 45, 0.65)' }}>
            Supervisión global de solicitudes, pedidos pendientes de asignación y alertas de flota.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn-v0-primary"
            onClick={() => navigate('/nuevo-pedido')}
          >
            <Plus size={18} /> Cargar Pedido
          </button>
          <button
            className="btn-v0-outline"
            onClick={() => navigate('/viajes')}
          >
            <Truck size={18} /> Gestionar Viajes
          </button>
        </div>
      </div>

      {/* Bar de Métricas Horizontal con Separadores Verticales (Estilo v0) */}
      <div className="v0-card" style={{ padding: '0', display: 'flex', flexWrap: 'wrap', background: '#ffffff', overflow: 'hidden' }}>
        
        {/* Métrica 1 */}
        <div style={{ flex: 1, minWidth: '200px', padding: '20px 24px', borderRight: '1px solid rgba(6, 95, 70, 0.12)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(23, 59, 45, 0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
            PEDIDOS REGISTRADOS
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#064e3b', lineHeight: 1.2 }}>
            {pedidos.length}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 600, marginTop: '4px' }}>
            {solicitudesPendientes.length} pendientes de aprobación
          </div>
        </div>

        {/* Métrica 2 */}
        <div style={{ flex: 1, minWidth: '200px', padding: '20px 24px', borderRight: '1px solid rgba(6, 95, 70, 0.12)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(23, 59, 45, 0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
            HOJAS DE RUTA ACTIVAS
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#064e3b', lineHeight: 1.2 }}>
            {viajesActivos.length}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 600, marginTop: '4px' }}>
            {pedidosAprobadosSinViaje.length} pedidos listos p/ asignar
          </div>
        </div>

        {/* Métrica 3 */}
        <div style={{ flex: 1, minWidth: '200px', padding: '20px 24px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(23, 59, 45, 0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
            ALERTAS DE CUMPLIMIENTO
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: totalAlertas > 0 ? '#dc2626' : '#047857', lineHeight: 1.2 }}>
            {totalAlertas}
          </div>
          <div style={{ fontSize: '0.78rem', color: totalAlertas > 0 ? '#dc2626' : '#059669', fontWeight: 600, marginTop: '4px' }}>
            {totalAlertas > 0 ? 'Documentación o RTO por regularizar' : 'Flota y choferes al día'}
          </div>
        </div>

      </div>

      {/* Alertas Banner si existen */}
      {totalAlertas > 0 && (
        <div className="v0-card" style={{ padding: '16px 20px', borderColor: '#fca5a5', background: '#fef2f2' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <AlertTriangle size={20} color="#dc2626" />
            <h3 style={{ fontSize: '0.95rem', color: '#991b1b', fontWeight: 700 }}>Alerta de Cumplimiento Logístico</h3>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.85rem' }}>
            {alertas.choferes_alertas?.map(c => (
              <div key={c.id} style={{ background: '#ffffff', border: '1px solid #fecaca', padding: '6px 12px', borderRadius: '8px', color: '#7f1d1d' }}>
                <strong>Chofer: {c.nombre_completo}:</strong> Vencimientos en {c.alertas_vencidas.concat(c.avisos_por_vencer).join(', ')}
              </div>
            ))}
            {alertas.vehiculos_alertas?.map(v => (
              <div key={v.id} style={{ background: '#ffffff', border: '1px solid #fecaca', padding: '6px 12px', borderRadius: '8px', color: '#7f1d1d' }}>
                <strong>Vehículo: {v.patente} ({v.modelo}):</strong> Vencimientos en {v.alertas_vencidas.concat(v.avisos_por_vencer).join(', ')}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sección 1: Solicitudes del Vendedor Pendientes de Aprobación */}
      <div className="v0-card" style={{ padding: '24px', background: '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#064e3b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={20} color="#d97706" /> Solicitudes del Vendedor Pendientes de Aprobación ({solicitudesPendientes.length})
          </h3>
          <span className="badge-v0 badge-solicitado">{solicitudesPendientes.length} pendientes</span>
        </div>

        {solicitudesPendientes.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'rgba(23, 59, 45, 0.5)', fontSize: '0.88rem' }}>
            No hay solicitudes de pedidos pendientes de aprobación en este momento.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {solicitudesPendientes.map(p => (
              <div key={p.id} style={{ background: '#fff9db', border: '1px solid #fde68a', borderRadius: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 700, color: '#92400e' }}>Pedido #{p.id} — {p.cliente_nombre}</span>
                  <span className="badge-v0 badge-solicitado">Solicitado</span>
                </div>
                
                <div style={{ fontSize: '0.85rem', color: '#78350f', marginBottom: '10px' }}>
                  <div><strong>Lugar:</strong> {p.lugar_entrega || 'A coordinar'}</div>
                  <div><strong>Vendedor:</strong> {p.vendedor_nombre || 'Directo'}</div>
                  {p.comentarios && <div style={{ fontStyle: 'italic', marginTop: '4px' }}>"{p.comentarios}"</div>}
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #fef3c7', padding: '8px 12px', borderRadius: '8px', marginBottom: '14px', fontSize: '0.85rem' }}>
                  <strong>Items ({p.items?.length || 0}):</strong>
                  <ul style={{ paddingLeft: '18px', marginTop: '4px' }}>
                    {p.items?.map((item, idx) => (
                      <li key={idx}>
                        {item.cantidad} {item.unidad_nombre || 'unid'} — <strong>{item.producto_nombre}</strong>
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn-v0-primary"
                    style={{ flex: 1, padding: '8px', fontSize: '0.85rem', justifyContent: 'center' }}
                    onClick={() => onResponderPedido(p.id, true, 'Aprobado por Logística')}
                  >
                    <CheckCircle size={16} /> Aprobar
                  </button>
                  <button
                    className="btn-v0-outline"
                    style={{ flex: 1, padding: '8px', fontSize: '0.85rem', justifyContent: 'center', color: '#dc2626', borderColor: '#fca5a5' }}
                    onClick={() => onResponderPedido(p.id, false, 'Rechazado por stock/agenda')}
                  >
                    <XCircle size={16} /> Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sección 2: Pedidos Aprobados Sin Viaje Asignado */}
      <div className="v0-card" style={{ padding: '24px', background: '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#064e3b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package size={20} color="#047857" /> Pedidos Aprobados Pendientes de Asignación a Viaje ({pedidosAprobadosSinViaje.length})
            </h3>
            <p style={{ fontSize: '0.83rem', color: 'rgba(23, 59, 45, 0.65)', marginTop: '2px' }}>
              Pedidos listos para ser despachados e integrados a una Hoja de Ruta.
            </p>
          </div>

          <button
            className="btn-v0-outline"
            style={{ fontSize: '0.85rem', padding: '6px 12px' }}
            onClick={() => navigate('/viajes')}
          >
            Ir a Módulo de Viajes →
          </button>
        </div>

        {pedidosAprobadosSinViaje.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'rgba(23, 59, 45, 0.5)', fontSize: '0.88rem' }}>
            No hay pedidos aprobados pendientes de viaje. Todos los pedidos están asignados o en proceso.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {pedidosAprobadosSinViaje.map(p => (
              <div key={p.id} style={{
                background: '#f8faf6',
                border: '1px solid rgba(6, 95, 70, 0.12)',
                borderRadius: '12px',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 700, color: '#064e3b' }}>Pedido #{p.id} — {p.cliente_nombre}</span>
                  <span className="badge-v0 badge-aprobado">Aprobado</span>
                </div>

                <div style={{ fontSize: '0.85rem', color: '#173b2d', marginBottom: '10px' }}>
                  <div><strong>Lugar de Entrega:</strong> {p.lugar_entrega || 'A coordinar'}</div>
                  <div><strong>Insumos:</strong> {p.items?.map(i => `${i.cantidad} ${i.unidad_abreviatura || ''} ${i.producto_nombre}`).join(', ')}</div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn-v0-outline"
                    style={{ flex: 1, padding: '6px', fontSize: '0.8rem', justifyContent: 'center' }}
                    onClick={() => navigate(`/pedidos/${p.id}`)}
                  >
                    <Eye size={14} /> Ver Detalle
                  </button>
                  <button
                    className="btn-v0-primary"
                    style={{ flex: 1, padding: '6px', fontSize: '0.8rem', justifyContent: 'center' }}
                    onClick={() => navigate('/viajes')}
                  >
                    <Truck size={14} /> Asignar a Viaje
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
