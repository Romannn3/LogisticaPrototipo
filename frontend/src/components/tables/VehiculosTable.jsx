import React, { useState } from 'react';
import { Truck, Search } from '../Icons';

export default function VehiculosTable({ vehiculos }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVehiculos = vehiculos.filter(v => {
    const query = searchQuery.toLowerCase();
    return (
      v.modelo?.toLowerCase().includes(query) ||
      v.patente?.toLowerCase().includes(query) ||
      v.tipo?.toLowerCase().includes(query)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#064e3b', letterSpacing: '-0.5px' }}>
          Flota de Vehículos
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'rgba(23, 59, 45, 0.65)' }}>
          Inventario de camiones, acoplados y utilitarios con seguimiento de RTO, ITV y pólizas de seguro.
        </p>
      </div>

      {/* Búsqueda */}
      <div className="v0-card" style={{ padding: '16px 20px', background: '#ffffff' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(23, 59, 45, 0.4)' }}>
            <Search size={16} />
          </div>
          <input
            type="text"
            className="v0-input"
            style={{ paddingLeft: '36px' }}
            placeholder="Buscar vehículo por modelo, patente o tipo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Tabla de Vehículos */}
      <div className="v0-card" style={{ padding: 0, overflow: 'hidden', background: '#ffffff' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#f8faf6', borderBottom: '1px solid rgba(6, 95, 70, 0.12)', color: '#064e3b' }}>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>ID</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Modelo / Descripción</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Patente / Dominio</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Tipo</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Vto. Cédula</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Vto. ITV / RTO</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Vto. Seguro</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Estado Documentación</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehiculos.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: '30px', textAlign: 'center', color: 'rgba(23, 59, 45, 0.5)' }}>
                    No se encontraron vehículos registrados en la flota.
                  </td>
                </tr>
              ) : (
                filteredVehiculos.map(v => {
                  const st = v.estado_documentacion || { global_status: 'success' };
                  const badgeStatus = st.global_status === 'danger' ? 'danger' : st.global_status === 'warning' ? 'warning' : 'aprobado';
                  const labelStatus = st.global_status === 'danger' ? 'Bloqueado' : st.global_status === 'warning' ? 'Vencimiento Próximo' : 'Habilitado';

                  return (
                    <tr key={v.id} style={{ borderBottom: '1px solid rgba(6, 95, 70, 0.08)' }}>
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: '#047857' }}>
                        #{v.id}
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: '#064e3b' }}>
                        {v.modelo}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#173b2d', background: '#f4f8f1', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(6, 95, 70, 0.15)' }}>
                          {v.patente}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', color: 'rgba(23, 59, 45, 0.8)' }}>
                        {v.tipo || 'General'}
                      </td>
                      <td style={{ padding: '14px 18px', color: '#173b2d' }}>
                        {v.vto_cedula || 'N/D'}
                      </td>
                      <td style={{ padding: '14px 18px', color: '#173b2d' }}>
                        {v.vto_rto || 'N/D'}
                      </td>
                      <td style={{ padding: '14px 18px', color: '#173b2d' }}>
                        {v.vto_seguro || 'N/D'}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span className={`badge-v0 badge-${badgeStatus}`}>
                          {labelStatus}
                        </span>
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
