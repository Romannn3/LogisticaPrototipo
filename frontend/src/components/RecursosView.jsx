import React from 'react';
import { Users, Truck, AlertTriangle, CheckCircle, MapPin, Package, ExternalLink } from './Icons';

export default function RecursosView({ choferes, vehiculos, clientes, productos, alertas }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Sección 1: Choferes & Documentación */}
      <div className="v0-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Users size={22} color="#047857" />
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#064e3b' }}>Nómina de Choferes y Alertas de Licencias</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {choferes.map(c => {
            const st = c.estado_documentacion;
            return (
              <div key={c.id} style={{
                background: '#ffffff',
                border: st.global_status === 'danger' ? '1px solid #fca5a5' : st.global_status === 'warning' ? '1px solid #fde68a' : '1px solid rgba(6, 95, 70, 0.12)',
                borderRadius: '12px',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 700, color: '#064e3b' }}>Chofer: {c.nombre_completo}</span>
                  <span className={`badge-v0 badge-${st.global_status}`}>
                    {st.global_status === 'danger' ? 'Bloqueado' : st.global_status === 'warning' ? 'Vencimiento Próximo' : 'Al día'}
                  </span>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'rgba(23, 59, 45, 0.7)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div>Celular: {c.celular || 'Sin registrar'}</div>
                  <div>Vto. Licencia: {c.vto_licencia || 'N/D'}</div>
                  <div>Vto. Psicofísico: {c.vto_psicofisico || 'N/D'}</div>
                  <div>Vto. Cargas Peligrosas: {c.vto_cargas_peligrosas || 'N/D'}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sección 2: Vehículos & Verificaciones */}
      <div className="v0-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Truck size={22} color="#0284c7" />
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#064e3b' }}>Flota de Vehículos y RTO / Seguros</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {vehiculos.map(v => {
            const st = v.estado_documentacion;
            return (
              <div key={v.id} style={{
                background: '#ffffff',
                border: st.global_status === 'danger' ? '1px solid #fca5a5' : st.global_status === 'warning' ? '1px solid #fde68a' : '1px solid rgba(6, 95, 70, 0.12)',
                borderRadius: '12px',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 700, color: '#064e3b' }}>Vehículo: {v.modelo} ({v.patente})</span>
                  <span className={`badge-v0 badge-${st.global_status}`}>
                    {st.global_status === 'danger' ? 'Bloqueado' : st.global_status === 'warning' ? 'Vencimiento Próximo' : 'Habilitado'}
                  </span>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'rgba(23, 59, 45, 0.7)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div>Tipo: {v.tipo || 'General'}</div>
                  <div>Vto. Cédula: {v.vto_cedula || 'N/D'}</div>
                  <div>Vto. ITV/RTO: {v.vto_rto || 'N/D'}</div>
                  <div>Vto. Seguro: {v.vto_seguro || 'N/D'}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sección 3: Clientes & Domicilios GPS */}
      <div className="v0-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <MapPin size={22} color="#7c3aed" />
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#064e3b' }}>Catálogo de Clientes y Coordenadas GPS</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {clientes.map(cli => (
            <div key={cli.id} style={{
              background: '#ffffff',
              border: '1px solid rgba(6, 95, 70, 0.12)',
              borderRadius: '12px',
              padding: '16px'
            }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#064e3b', marginBottom: '4px' }}>
                Cliente: {cli.nombre}
              </h3>
              <div style={{ fontSize: '0.8rem', color: 'rgba(23, 59, 45, 0.65)', marginBottom: '8px' }}>
                Tipo: {cli.tipo_descripcion} | Tel: {cli.celular || 'N/D'}
              </div>

              <div style={{ background: '#f8faf6', padding: '10px 12px', borderRadius: '8px', fontSize: '0.8rem', border: '1px solid rgba(6, 95, 70, 0.08)' }}>
                <strong>Ubicación Principal / GPS:</strong>
                {cli.domicilios?.length > 0 ? (
                  cli.domicilios.map((d, dIdx) => (
                    <div key={dIdx} style={{ marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{d.alias}: {d.calle} {d.numero} ({d.localidad_nombre})</span>
                      {d.coord_gps && (
                        <a
                          href={`https://maps.google.com/?q=${d.coord_gps.replace(' ', '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-v0-outline"
                          style={{ padding: '2px 8px', fontSize: '0.7rem', background: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe' }}
                        >
                          <ExternalLink size={10} /> GPS
                        </a>
                      )}
                    </div>
                  ))
                ) : (
                  <div style={{ color: 'rgba(23, 59, 45, 0.5)', fontStyle: 'italic' }}>Sin domicilios GPS guardados</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
