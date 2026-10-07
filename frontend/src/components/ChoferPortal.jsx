import React, { useState } from 'react';
import { Truck, Navigation, Phone, MessageSquare, ExternalLink, CheckCircle, MapPin, Package, Eye, ClipboardList } from './Icons';

export default function ChoferPortal({ viajesChofer, mode = 'actual', onFinalizarViaje }) {
  const [selectedViajeModal, setSelectedViajeModal] = useState(null);

  const viajesNoFinalizados = viajesChofer.filter(v => v.estado_nombre !== 'Finalizado' && v.estado_nombre !== 'Cancelado');
  const viajeEnCurso = viajesNoFinalizados.find(v => v.estado_nombre === 'En Curso') || viajesNoFinalizados.find(v => v.estado_nombre === 'Pendiente') || (viajesNoFinalizados.length > 0 ? viajesNoFinalizados[0] : null);

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Driver Header Banner */}
      <div className="v0-card" style={{
        padding: '24px',
        background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)',
        borderColor: '#a7f3d0',
        textAlign: 'center'
      }}>
        <div style={{
          width: '52px', height: '52px', borderRadius: '50%', background: '#047857',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto',
          boxShadow: '0 4px 14px rgba(4, 120, 87, 0.3)'
        }}>
          <Truck size={26} color="#fff" />
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#064e3b' }}>
          Portal del Chofer — {mode === 'actual' ? 'Viaje en Curso' : 'Mis Viajes (Historial)'}
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'rgba(23, 59, 45, 0.7)' }}>
          {mode === 'actual'
            ? 'Consulta tus paradas asignadas, rutas en Google Maps y notifica el cierre de la Hoja de Ruta.'
            : 'Historial completo de Hojas de Ruta asignadas para consulta de paradas y entregas.'}
        </p>
      </div>

      {/* VISTA 1: VIAJE EN CURSO */}
      {mode === 'actual' && (
        !viajeEnCurso ? (
          <div className="v0-card" style={{ padding: '40px 20px', textAlign: 'center', background: '#ffffff', color: 'rgba(23, 59, 45, 0.6)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#064e3b', marginBottom: '8px' }}>
              No tienes viajes en curso en este momento
            </h3>
            <p style={{ fontSize: '0.85rem' }}>
              Cuando la coordinación de logística te asigne una Hoja de Ruta, aparecerá disponible aquí automáticamente.
            </p>
          </div>
        ) : (
          <div className="v0-card" style={{ padding: '24px', background: '#ffffff' }}>
            
            {/* Header del Viaje */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(6, 95, 70, 0.12)', paddingBottom: '14px' }}>
              <div>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#047857', fontFamily: 'monospace' }}>
                  {viajeEnCurso.codigo_viaje}
                </span>
                <div style={{ fontSize: '0.82rem', color: 'rgba(23, 59, 45, 0.65)', marginTop: '2px' }}>
                  Vehículo: {viajeEnCurso.vehiculo_descripcion || 'No asignado'}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                <span className={`badge-v0 badge-${viajeEnCurso.estado_nombre?.toLowerCase().replace(' ', '-')}`}>
                  {viajeEnCurso.estado_nombre}
                </span>

                {onFinalizarViaje && (
                  <button
                    className="btn-v0-primary"
                    style={{ fontSize: '0.78rem', padding: '6px 10px', background: '#059669' }}
                    onClick={() => onFinalizarViaje(viajeEnCurso.id)}
                  >
                    <CheckCircle size={14} /> Notificar Conclusión de Viaje
                  </button>
                )}
              </div>
            </div>

            {viajeEnCurso.notas && (
              <div style={{ background: '#fef3c7', border: '1px solid #fde68a', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px', color: '#78350f' }}>
                <strong>Notas del Coordinador:</strong> "{viajeEnCurso.notas}"
              </div>
            )}

            {/* Paradas del Viaje en Curso */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'rgba(23, 59, 45, 0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                PARADAS Y ENTREGAS ASIGNADAS ({viajeEnCurso.pedidos.length})
              </h3>

              {viajeEnCurso.pedidos.map((p, idx) => {
                const whatsappArrivalText = encodeURIComponent(`Hola ${p.cliente_nombre}! Soy el chofer de AgroLogística y estoy en camino/llegando con tu pedido.`);
                
                return (
                  <div key={p.id} style={{
                    background: '#ffffff',
                    border: '1px solid rgba(6, 95, 70, 0.15)',
                    borderRadius: '12px',
                    padding: '16px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{
                        background: '#047857', color: '#fff', fontSize: '0.75rem', fontWeight: 800,
                        padding: '2px 8px', borderRadius: '6px'
                      }}>
                        PARADA #{idx + 1}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'rgba(23, 59, 45, 0.5)' }}>
                        Pedido #{p.id}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#064e3b', marginBottom: '4px' }}>
                      {p.cliente_nombre}
                    </h4>

                    <div style={{ fontSize: '0.85rem', color: 'rgba(23, 59, 45, 0.7)', marginBottom: '12px' }}>
                      <strong>Lugar de Entrega:</strong> {p.lugar_entrega || 'Dirección de cliente'}
                    </div>

                    {/* Detalle de items */}
                    <div style={{ background: '#f8faf6', padding: '10px 12px', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '14px', border: '1px solid rgba(6, 95, 70, 0.08)' }}>
                      <strong>Carga a entregar:</strong>
                      <ul style={{ paddingLeft: '18px', marginTop: '4px' }}>
                        {p.items?.map((item, iIdx) => (
                          <li key={iIdx}>
                            <strong>{item.cantidad} {item.unidad_abreviatura || ''}</strong> — {item.producto_nombre}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Botones de Acción Móvil */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {p.link_google_maps ? (
                        <a
                          href={p.link_google_maps}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-v0-outline"
                          style={{ padding: '10px', fontSize: '0.85rem', background: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe', justifyContent: 'center' }}
                        >
                          <Navigation size={16} /> Abrir GPS (Maps)
                        </a>
                      ) : (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.lugar_entrega || p.cliente_nombre)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-v0-outline"
                          style={{ padding: '10px', fontSize: '0.85rem', background: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe', justifyContent: 'center' }}
                        >
                          <Navigation size={16} /> Buscar en Maps
                        </a>
                      )}

                      {p.cliente_celular && (
                        <a
                          href={`https://wa.me/${p.cliente_celular.replace(/\D/g, '')}?text=${whatsappArrivalText}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-v0-primary"
                          style={{ padding: '10px', fontSize: '0.85rem', background: '#128c7e', justifyContent: 'center' }}
                        >
                          <MessageSquare size={16} /> Notificar Llegada
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )
      )}

      {/* VISTA 2: MIS VIAJES (HISTORIAL COMPLETO DE CONSULTA) */}
      {mode === 'historial' && (
        <div className="v0-card" style={{ padding: '24px', background: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#064e3b' }}>
              Historial de Hojas de Ruta Asignadas ({viajesChofer.length})
            </h3>
            <span className="badge-v0 badge-aprobado">{viajesChofer.length} viajes</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {viajesChofer.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'rgba(23, 59, 45, 0.5)' }}>
                No tienes viajes registrados en el historial.
              </div>
            ) : (
              viajesChofer.map(v => (
                <div key={v.id} style={{
                  background: '#f8faf6',
                  border: '1px solid rgba(6, 95, 70, 0.12)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#047857', fontSize: '1rem' }}>
                        {v.codigo_viaje}
                      </span>
                      <span className={`badge-v0 badge-${v.estado_nombre?.toLowerCase().replace(' ', '-')}`}>
                        {v.estado_nombre}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.83rem', color: 'rgba(23, 59, 45, 0.7)' }}>
                      Vehículo: {v.vehiculo_descripcion || 'No asignado'} | Pedidos: {v.pedidos?.length || 0}
                    </div>
                  </div>

                  <button
                    className="btn-v0-outline"
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                    onClick={() => setSelectedViajeModal(v)}
                  >
                    <Eye size={14} /> Ver Paradas
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL DETALLE DE VIAJE HISTÓRICO PARA CHOFER */}
      {selectedViajeModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(23, 59, 45, 0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="v0-card" style={{ width: '100%', maxWidth: '520px', padding: '24px', background: '#ffffff', border: '1px solid rgba(6, 95, 70, 0.2)', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(6, 95, 70, 0.1)', paddingBottom: '10px' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#064e3b', fontFamily: 'monospace' }}>
                  {selectedViajeModal.codigo_viaje}
                </h3>
                <span className={`badge-v0 badge-${selectedViajeModal.estado_nombre?.toLowerCase().replace(' ', '-')}`}>
                  {selectedViajeModal.estado_nombre}
                </span>
              </div>
              <button onClick={() => setSelectedViajeModal(null)} style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'rgba(23, 59, 45, 0.5)' }}>✕</button>
            </div>

            <div style={{ fontSize: '0.88rem', color: '#173b2d', marginBottom: '14px' }}>
              <div><strong>Vehículo:</strong> {selectedViajeModal.vehiculo_descripcion || 'No asignado'}</div>
              {selectedViajeModal.notas && <div style={{ marginTop: '4px' }}><strong>Notas:</strong> "{selectedViajeModal.notas}"</div>}
            </div>

            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#064e3b', marginBottom: '10px' }}>
              PARADAS DEL VIAJE ({selectedViajeModal.pedidos?.length || 0})
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {selectedViajeModal.pedidos?.map((p, idx) => (
                <div key={p.id} style={{ background: '#f8faf6', border: '1px solid rgba(6, 95, 70, 0.1)', padding: '12px', borderRadius: '8px', fontSize: '0.85rem' }}>
                  <strong style={{ color: '#047857' }}>Parada #{idx + 1}: {p.cliente_nombre}</strong>
                  <div>Lugar: {p.lugar_entrega || 'Dirección de cliente'}</div>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(23, 59, 45, 0.7)', marginTop: '2px' }}>
                    Insumos: {p.items?.map(i => `${i.cantidad} ${i.unidad_abreviatura || ''} ${i.producto_nombre}`).join(', ')}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button className="btn-v0-outline" onClick={() => setSelectedViajeModal(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
