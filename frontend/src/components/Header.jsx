import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Truck, MessageSquare, ClipboardList, PackageCheck, Users } from './Icons';

export default function Header({ activeRole, setActiveRole, alertsCount }) {
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;

  const handleRoleSwitch = (newRole) => {
    setActiveRole(newRole);
    if (newRole === 'vendedor') {
      navigate('/vendedor');
    } else if (newRole === 'chofer') {
      navigate('/chofer');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <header className="v0-card" style={{ padding: '14px 20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
      
      {/* Brand & Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/login')}>
        <div style={{
          background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 10px rgba(4, 120, 87, 0.3)'
        }}>
          <Truck size={22} color="#ffffff" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#064e3b', letterSpacing: '-0.5px' }}>
            AgroLogística
          </h1>
          <span style={{ fontSize: '0.75rem', color: 'rgba(23, 59, 45, 0.6)', fontWeight: 600 }}>
            {activeRole === 'admin' ? '👨‍💼 Logística & Administración' : activeRole === 'vendedor' ? '👤 Portal de Vendedores' : '🚚 Portal de Choferes'}
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <nav style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {activeRole !== 'chofer' && (
          <>
            <button
              className={currentPath === '/dashboard' || currentPath === '/' ? 'btn-v0-primary' : 'btn-v0-outline'}
              onClick={() => navigate('/dashboard')}
              style={{ fontSize: '0.85rem' }}
            >
              <PackageCheck size={16} /> Tablero Logística
            </button>
            <button
              className={currentPath === '/whatsapp' ? 'btn-v0-primary' : 'btn-v0-outline'}
              onClick={() => navigate('/whatsapp')}
              style={{ fontSize: '0.85rem' }}
            >
              <MessageSquare size={16} /> Parser WhatsApp
            </button>
          </>
        )}

        {activeRole === 'vendedor' && (
          <button
            className={currentPath === '/vendedor' ? 'btn-v0-primary' : 'btn-v0-outline'}
            onClick={() => navigate('/vendedor')}
            style={{ fontSize: '0.85rem' }}
          >
            <ClipboardList size={16} /> Mis Pedidos
          </button>
        )}

        {activeRole === 'chofer' && (
          <button
            className={currentPath === '/chofer' ? 'btn-v0-primary' : 'btn-v0-outline'}
            onClick={() => navigate('/chofer')}
            style={{ fontSize: '0.85rem' }}
          >
            <Truck size={16} /> Portal Chofer (Mobile)
          </button>
        )}

        {activeRole === 'admin' && (
          <button
            className={currentPath === '/recursos' ? 'btn-v0-primary' : 'btn-v0-outline'}
            onClick={() => navigate('/recursos')}
            style={{ fontSize: '0.85rem' }}
          >
            <Users size={16} /> Flota & Alertas
            {alertsCount > 0 && (
              <span className="badge-v0 badge-danger" style={{ marginLeft: '4px', padding: '2px 6px' }}>
                {alertsCount}
              </span>
            )}
          </button>
        )}
      </nav>

      {/* RBAC Role Switcher & Back to Login */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          className="btn-v0-outline"
          style={{ fontSize: '0.8rem', padding: '6px 12px', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}
          onClick={() => navigate('/login')}
        >
          🔑 Cambiar de Rol / Salir
        </button>

        <div className="role-selector" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <button
            className={`role-btn ${activeRole === 'admin' ? 'active' : ''}`}
            onClick={() => handleRoleSwitch('admin')}
            style={{ fontSize: '0.78rem' }}
          >
            Logística
          </button>
          <button
            className={`role-btn ${activeRole === 'vendedor' ? 'active' : ''}`}
            onClick={() => handleRoleSwitch('vendedor')}
            style={{ fontSize: '0.78rem' }}
          >
            Vendedor
          </button>
          <button
            className={`role-btn ${activeRole === 'chofer' ? 'active' : ''}`}
            onClick={() => handleRoleSwitch('chofer')}
            style={{ fontSize: '0.78rem' }}
          >
            Chofer
          </button>
        </div>
      </div>
    </header>
  );
}
