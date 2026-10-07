import React, { useState } from 'react';
import { UserCheck, Search, ShieldAlert, Phone, AlertTriangle } from '../Icons';

export default function ChoferesTable({ choferes }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChoferes = choferes.filter(c => {
    const query = searchQuery.toLowerCase();
    return (
      c.nombre_completo?.toLowerCase().includes(query) ||
      c.dni?.toLowerCase().includes(query) ||
      c.celular?.toLowerCase().includes(query)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#064e3b', letterSpacing: '-0.5px' }}>
          Nómina de Choferes
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'rgba(23, 59, 45, 0.65)' }}>
          Gestión de choferes, vencimientos de licencias, psicofísicos y estado de habilitación documental.
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
            placeholder="Buscar chofer por nombre, DNI o teléfono..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Tabla de Choferes */}
      <div className="v0-card" style={{ padding: 0, overflow: 'hidden', background: '#ffffff' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#f8faf6', borderBottom: '1px solid rgba(6, 95, 70, 0.12)', color: '#064e3b' }}>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>ID</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Nombre Completo</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>DNI / CUIT</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Teléfono</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Vto. Licencia</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Vto. Psicofísico</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Vto. Cargas Peligrosas</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Estado Documentación</th>
              </tr>
            </thead>
            <tbody>
              {filteredChoferes.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: '30px', textAlign: 'center', color: 'rgba(23, 59, 45, 0.5)' }}>
                    No se encontraron choferes registrados.
                  </td>
                </tr>
              ) : (
                filteredChoferes.map(c => {
                  const st = c.estado_documentacion || { global_status: 'success' };
                  const badgeStatus = st.global_status === 'danger' ? 'danger' : st.global_status === 'warning' ? 'warning' : 'aprobado';
                  const labelStatus = st.global_status === 'danger' ? 'Bloqueado' : st.global_status === 'warning' ? 'Vencimiento Próximo' : 'Habilitado';

                  return (
                    <tr key={c.id} style={{ borderBottom: '1px solid rgba(6, 95, 70, 0.08)' }}>
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: '#047857' }}>
                        #{c.id}
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: '#064e3b' }}>
                        {c.nombre_completo}
                      </td>
                      <td style={{ padding: '14px 18px', color: '#173b2d' }}>
                        {c.dni || 'Sin datos'}
                      </td>
                      <td style={{ padding: '14px 18px', color: 'rgba(23, 59, 45, 0.8)' }}>
                        {c.celular ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Phone size={14} color="#047857" /> {c.celular}
                          </span>
                        ) : 'N/D'}
                      </td>
                      <td style={{ padding: '14px 18px', color: '#173b2d' }}>
                        {c.vto_licencia || 'N/D'}
                      </td>
                      <td style={{ padding: '14px 18px', color: '#173b2d' }}>
                        {c.vto_psicofisico || 'N/D'}
                      </td>
                      <td style={{ padding: '14px 18px', color: '#173b2d' }}>
                        {c.vto_cargas_peligrosas || 'N/D'}
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
