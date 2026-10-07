import React, { useState } from 'react';
import { Building, Search, MapPin, ExternalLink, Phone } from '../Icons';

export default function ClientesTable({ clientes }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClientes = clientes.filter(c => {
    const query = searchQuery.toLowerCase();
    return (
      c.nombre?.toLowerCase().includes(query) ||
      c.tipo_descripcion?.toLowerCase().includes(query) ||
      c.celular?.toLowerCase().includes(query)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#064e3b', letterSpacing: '-0.5px' }}>
          Directorio de Clientes
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'rgba(23, 59, 45, 0.65)' }}>
          Registro de productores, cooperativas y estancias con sus puntos de entrega geolocalizados.
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
            placeholder="Buscar cliente por nombre o tipo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Tabla de Clientes */}
      <div className="v0-card" style={{ padding: 0, overflow: 'hidden', background: '#ffffff' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#f8faf6', borderBottom: '1px solid rgba(6, 95, 70, 0.12)', color: '#064e3b' }}>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>ID</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Nombre / Razón Social</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Tipo / Categoría</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Teléfono</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Domicilio de Entrega</th>
                <th style={{ padding: '14px 18px', fontWeight: 700, textAlign: 'right' }}>Geolocalización GPS</th>
              </tr>
            </thead>
            <tbody>
              {filteredClientes.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: 'rgba(23, 59, 45, 0.5)' }}>
                    No se encontraron clientes registrados.
                  </td>
                </tr>
              ) : (
                filteredClientes.map(c => {
                  const domPrincipal = c.domicilios && c.domicilios.length > 0 ? c.domicilios[0] : null;

                  return (
                    <tr key={c.id} style={{ borderBottom: '1px solid rgba(6, 95, 70, 0.08)' }}>
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: '#047857' }}>
                        #{c.id}
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: '#064e3b' }}>
                        {c.nombre}
                      </td>
                      <td style={{ padding: '14px 18px', color: 'rgba(23, 59, 45, 0.8)' }}>
                        <span style={{ background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600 }}>
                          {c.tipo_descripcion || 'Productor'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', color: '#173b2d' }}>
                        {c.celular ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Phone size={14} color="#047857" /> {c.celular}
                          </span>
                        ) : 'N/D'}
                      </td>
                      <td style={{ padding: '14px 18px', color: '#173b2d' }}>
                        {domPrincipal ? (
                          <span>{domPrincipal.alias ? `${domPrincipal.alias}: ` : ''}{domPrincipal.calle} {domPrincipal.numero} ({domPrincipal.localidad_nombre})</span>
                        ) : (
                          <span style={{ color: 'rgba(23, 59, 45, 0.4)', fontStyle: 'italic' }}>Sin domicilio de entrega registrado</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        {domPrincipal && domPrincipal.coord_gps ? (
                          <a
                            href={`https://maps.google.com/?q=${domPrincipal.coord_gps.replace(' ', '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-v0-outline"
                            style={{ padding: '4px 10px', fontSize: '0.75rem', background: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <ExternalLink size={12} /> Ver en Maps
                          </a>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'rgba(23, 59, 45, 0.4)' }}>Sin GPS</span>
                        )}
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
