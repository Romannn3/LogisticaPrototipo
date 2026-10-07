import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Plus, Send, ExternalLink, Eye, Search, Filter, AlertTriangle } from './Icons';

export default function ViajesView({
  viajes,
  pedidos,
  choferes,
  vehiculos,
  onCreateViaje,
  onAsignarPedido,
  onDesasignarPedido,
  onDeleteViaje
}) {
  const navigate = useNavigate();
  const [showCreateViajeModal, setShowCreateViajeModal] = useState(false);
  const [selectedChofer, setSelectedChofer] = useState('');
  const [selectedVehiculo, setSelectedVehiculo] = useState('');
  const [notasViaje, setNotasViaje] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('Todos');

  const viajesActivos = viajes.filter(v => v.estado_nombre !== 'Finalizado' && v.estado_nombre !== 'Cancelado');
  const pedidosAprobadosSinViaje = pedidos.filter(p => p.estado_nombre === 'Aprobado' && !p.id_viaje);

  const filteredViajesTable = viajes.filter(v => {
    const query = searchQuery.toLowerCase();
    const matchesQuery = 
      v.codigo_viaje?.toLowerCase().includes(query) ||
      v.chofer_nombre?.toLowerCase().includes(query) ||
      v.vehiculo_descripcion?.toLowerCase().includes(query);

    const matchesEstado = selectedEstado === 'Todos' || v.estado_nombre === selectedEstado;

    return matchesQuery && matchesEstado;
  });

  const [modalValidationError, setModalValidationError] = useState('');

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    setModalValidationError('');

    if (!selectedChofer) {
      setModalValidationError('Debe seleccionar un chofer para la Hoja de Ruta.');
      return;
    }

    if (!selectedVehiculo) {
      setModalValidationError('Debe seleccionar un vehículo para la Hoja de Ruta.');
      return;
    }

    onCreateViaje({
      id_chofer: parseInt(selectedChofer),
      id_vehiculo: parseInt(selectedVehiculo),
      notas: notasViaje
    });
    setShowCreateViajeModal(false);
    setSelectedChofer('');
    setSelectedVehiculo('');
    setNotasViaje('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header del Módulo */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#064e3b', letterSpacing: '-0.5px' }}>
            Gestión de Hojas de Ruta y Viajes
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'rgba(23, 59, 45, 0.65)' }}>
            Supervisión de viajes activos, asignación de pedidos aprobados e historial general de despachos.
          </p>
        </div>

        <button
          className="btn-v0-primary"
          onClick={() => setShowCreateViajeModal(true)}
        >
          <Plus size={18} /> Nueva Hoja de Ruta
        </button>
      </div>

      {/* Modal Crear Hoja de Ruta */}
      {showCreateViajeModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(23, 59, 45, 0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="v0-card" style={{ width: '100%', maxWidth: '520px', padding: '28px', background: '#ffffff', border: '1px solid rgba(6, 95, 70, 0.2)', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#064e3b' }}>Crear Nueva Hoja de Ruta</h3>
              <button onClick={() => setShowCreateViajeModal(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'rgba(23, 59, 45, 0.5)' }}>✕</button>
            </div>
            
            {modalValidationError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={16} color="#dc2626" />
                <span>{modalValidationError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#173b2d', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                  Seleccionar Chofer Asignado
                </label>
                <select
                  className="v0-input"
                  value={selectedChofer}
                  onChange={(e) => setSelectedChofer(e.target.value)}
                  style={{ background: '#ffffff', color: '#173b2d' }}
                >
                  <option value="">-- Sin chofer asignado inicialmente --</option>
                  {choferes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nombre_completo} {c.estado_documentacion?.global_status === 'danger' ? '(Alerta Licencia)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: '#173b2d', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                  Seleccionar Vehículo
                </label>
                <select
                  className="v0-input"
                  value={selectedVehiculo}
                  onChange={(e) => setSelectedVehiculo(e.target.value)}
                  style={{ background: '#ffffff', color: '#173b2d' }}
                >
                  <option value="">-- Sin vehículo asignado --</option>
                  {vehiculos.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.modelo} ({v.patente}) {v.estado_documentacion?.global_status === 'danger' ? '(Alerta RTO)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: '#173b2d', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                  Notas e Instrucciones para el Viaje
                </label>
                <textarea
                  className="v0-input"
                  rows="3"
                  placeholder="Ej: Salida 06:00 hs. Entregar primero en Estancia La Primavera"
                  value={notasViaje}
                  onChange={(e) => setNotasViaje(e.target.value)}
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button type="submit" className="btn-v0-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  Generar Código y Crear
                </button>
                <button
                  type="button"
                  className="btn-v0-outline"
                  onClick={() => setShowCreateViajeModal(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SECCIÓN 1: CARDS DE VIAJES ACTIVOS (SIN TERMINAR) */}
      <div className="v0-card" style={{ padding: '24px', background: '#ffffff' }}>
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#064e3b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Truck size={20} color="#047857" /> Viajes en Curso y Asignación de Pedidos ({viajesActivos.length})
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'rgba(23, 59, 45, 0.65)' }}>
            Hojas de Ruta sin finalizar. Puedes asignar pedidos aprobados o ingresar al detalle individual.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {viajesActivos.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'rgba(23, 59, 45, 0.6)' }}>
              No hay Hojas de Ruta activas actualmente. Haz clic en "Nueva Hoja de Ruta" para iniciar.
            </div>
          ) : (
            viajesActivos.map(v => (
              <div key={v.id} style={{
                background: '#ffffff',
                border: '1px solid rgba(6, 95, 70, 0.15)',
                borderRadius: '14px',
                padding: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      fontFamily: 'monospace',
                      fontSize: '1.1rem',
                      fontWeight: 800,
                      background: '#ecfdf5',
                      color: '#047857',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      border: '1px solid #a7f3d0'
                    }}>
                      {v.codigo_viaje}
                    </span>

                    <span className={`badge-v0 badge-${v.estado_nombre?.toLowerCase().replace(' ', '-')}`}>
                      {v.estado_nombre}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn-v0-outline"
                      style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                      onClick={() => navigate(`/viajes/${v.id}`)}
                    >
                      <Eye size={14} /> Ver Detalle de Viaje
                    </button>

                    {v.whatsapp_link && (
                      <a
                        href={v.whatsapp_link}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-v0-primary"
                        style={{ fontSize: '0.8rem', padding: '6px 12px', background: '#128c7e' }}
                      >
                        <Send size={14} /> WhatsApp Chofer
                      </a>
                    )}

                    <button
                      className="btn-v0-outline"
                      style={{ fontSize: '0.8rem', padding: '6px 10px', color: '#dc2626', borderColor: '#fca5a5' }}
                      onClick={() => onDeleteViaje(v.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '14px', fontSize: '0.85rem', color: 'rgba(23, 59, 45, 0.7)' }}>
                  <div><strong>Chofer:</strong> {v.chofer_nombre || 'No asignado'}</div>
                  <div><strong>Vehículo:</strong> {v.vehiculo_descripcion || 'No asignado'}</div>
                  <div><strong>Pedidos en viaje:</strong> {v.total_pedidos}</div>
                </div>

                {v.notas && (
                  <div style={{ fontSize: '0.82rem', color: '#78350f', background: '#fef3c7', padding: '8px 12px', borderRadius: '8px', marginBottom: '14px' }}>
                    <strong>Notas:</strong> "{v.notas}"
                  </div>
                )}

                {/* Pedidos asignados a este viaje */}
                <div style={{ background: '#f8faf6', borderRadius: '10px', padding: '14px', border: '1px solid rgba(6, 95, 70, 0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#064e3b' }}>
                      Paradas / Pedidos en esta Hoja de Ruta ({v.pedidos.length})
                    </span>

                    {/* Selector para agregar pedido aprobado */}
                    {pedidosAprobadosSinViaje.length > 0 && (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <select
                          className="v0-input"
                          style={{ padding: '4px 8px', fontSize: '0.8rem', width: '230px' }}
                          onChange={(e) => {
                            if (e.target.value) {
                              onAsignarPedido(v.id, parseInt(e.target.value));
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

                  {v.pedidos.length === 0 ? (
                    <div style={{ fontSize: '0.8rem', color: 'rgba(23, 59, 45, 0.5)', fontStyle: 'italic' }}>
                      No hay pedidos asignados a esta Hoja de Ruta. Selecciona uno en el menú superior.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {v.pedidos.map((p, idx) => (
                        <div key={p.id} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          background: '#ffffff', padding: '10px 14px', borderRadius: '8px',
                          border: '1px solid rgba(6, 95, 70, 0.12)'
                        }}>
                          <div style={{ fontSize: '0.85rem' }}>
                            <strong style={{ color: '#047857' }}>Parada #{idx + 1}:</strong> {p.cliente_nombre} — Lugar: {p.lugar_entrega || 'Dirección no dada'}
                            <div style={{ fontSize: '0.75rem', color: 'rgba(23, 59, 45, 0.65)' }}>
                              Items: {p.items?.map(i => `${i.cantidad} ${i.unidad_abreviatura || ''} ${i.producto_nombre}`).join(', ')}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                              className="btn-v0-outline"
                              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                              onClick={() => navigate(`/pedidos/${p.id}`)}
                            >
                              <Eye size={12} /> Ver Pedido
                            </button>

                            {p.link_google_maps && (
                              <a href={p.link_google_maps} target="_blank" rel="noreferrer" className="btn-v0-outline" style={{ padding: '4px 8px', fontSize: '0.75rem', background: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe' }}>
                                <ExternalLink size={12} /> GPS
                              </a>
                            )}

                            <button
                              className="btn-v0-outline"
                              style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#dc2626', borderColor: '#fca5a5' }}
                              onClick={() => onDesasignarPedido(v.id, p.id)}
                            >
                              Quitar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* SECCIÓN 2: LISTADO COMPLETO DE VIAJES (TABLA HTML REQUERIDA) */}
      <div className="v0-card" style={{ padding: '24px', background: '#ffffff' }}>
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#064e3b' }}>
            Historial y Listado Completo de Hojas de Ruta ({viajes.length})
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'rgba(23, 59, 45, 0.65)' }}>
            Registro total de viajes (incluyendo finalizados y cancelados) en formato tabla.
          </p>
        </div>

        {/* Filtros de Tabla */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(23, 59, 45, 0.4)' }}>
              <Search size={16} />
            </div>
            <input
              type="text"
              className="v0-input"
              style={{ paddingLeft: '36px' }}
              placeholder="Buscar por código de viaje, chofer o vehículo..."
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
              <option value="Todos">Todos ({viajes.length})</option>
              <option value="Creado">Creado</option>
              <option value="En Progreso">En Progreso</option>
              <option value="Finalizado">Finalizado</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        {/* Tabla HTML de Todos los Viajes */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#f8faf6', borderBottom: '1px solid rgba(6, 95, 70, 0.12)', color: '#064e3b' }}>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Código</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Chofer</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Vehículo</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Pedidos</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Estado</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Notas</th>
                <th style={{ padding: '14px 18px', fontWeight: 700, textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredViajesTable.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: 'rgba(23, 59, 45, 0.5)' }}>
                    No se encontraron Hojas de Ruta registradas.
                  </td>
                </tr>
              ) : (
                filteredViajesTable.map(v => {
                  const estadoClass = v.estado_nombre ? v.estado_nombre.toLowerCase().replace(' ', '-') : 'creado';

                  return (
                    <tr key={v.id} style={{ borderBottom: '1px solid rgba(6, 95, 70, 0.08)' }}>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#047857', background: '#ecfdf5', padding: '2px 8px', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
                          {v.codigo_viaje}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: '#064e3b' }}>
                        {v.chofer_nombre || 'No asignado'}
                      </td>
                      <td style={{ padding: '14px 18px', color: '#173b2d' }}>
                        {v.vehiculo_descripcion || 'No asignado'}
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: '#047857' }}>
                        {v.total_pedidos} pedidos
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span className={`badge-v0 badge-${estadoClass}`}>
                          {v.estado_nombre}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', color: 'rgba(23, 59, 45, 0.7)' }}>
                        {v.notas || '-'}
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <button
                          className="btn-v0-outline"
                          style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                          onClick={() => navigate(`/viajes/${v.id}`)}
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

    </div>
  );
}
