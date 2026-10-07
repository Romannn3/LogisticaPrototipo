import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Truck,
  PackageCheck,
  MessageSquare,
  ClipboardList,
  Users,
  LogOut,
  AlertTriangle,
  User,
  Package,
  Calendar,
  Settings,
  PlusCircle,
  UserCheck,
  Building,
  RotateCcw
} from './Icons';
import { api } from '../services/api';

export default function SidebarLayout({ children, activeRole, setActiveRole, alertsCount }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleResetDemo = async () => {
    if (!window.confirm("¿Deseas restaurar todos los datos de tu sesión a los valores iniciales de prueba?")) return;
    setResetting(true);
    try {
      await api.resetDemo();
      window.location.reload();
    } catch (e) {
      alert("Error al restaurar datos.");
      setResetting(false);
    }
  };

  const currentPath = location.pathname;

  const handleRoleSwitch = (newRole) => {
    setActiveRole(newRole);
    if (newRole === 'vendedor') {
      navigate('/vendedor/nuevo');
    } else if (newRole === 'chofer') {
      navigate('/chofer');
    } else {
      navigate('/dashboard');
    }
  };

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: PackageCheck,
      roles: ['admin']
    },
    {
      name: 'Nuevo Pedido',
      path: '/nuevo-pedido',
      icon: PlusCircle,
      roles: ['admin']
    },
    {
      name: 'Pedidos',
      path: '/pedidos',
      icon: ClipboardList,
      roles: ['admin']
    },
    {
      name: 'Viajes',
      path: '/viajes',
      icon: Truck,
      roles: ['admin']
    },
    {
      name: 'Choferes',
      path: '/choferes',
      icon: UserCheck,
      roles: ['admin']
    },
    {
      name: 'Vehículos',
      path: '/vehiculos',
      icon: Truck,
      roles: ['admin']
    },
    {
      name: 'Clientes',
      path: '/clientes',
      icon: Building,
      roles: ['admin']
    },
    {
      name: 'Solicitar pedido',
      path: '/vendedor/nuevo',
      icon: PlusCircle,
      roles: ['vendedor']
    },
    {
      name: 'Mis pedidos',
      path: '/vendedor/pedidos',
      icon: ClipboardList,
      roles: ['vendedor']
    },
    {
      name: 'Viaje en Curso',
      path: '/chofer',
      icon: Truck,
      roles: ['chofer']
    },
    {
      name: 'Mis Viajes',
      path: '/chofer/historial',
      icon: ClipboardList,
      roles: ['chofer']
    }
  ];

  const filteredNav = navItems.filter(item => item.roles.includes(activeRole));

  const roleLabels = {
    admin: 'Responsable de Logística',
    vendedor: 'Vendedor',
    chofer: 'Chofer'
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f8f1', color: '#173b2d' }}>
      
      {/* Sidebar Izquierda (Estilo v0) */}
      <aside style={{
        width: collapsed ? '72px' : '260px',
        background: '#ffffff',
        borderRight: '1px solid rgba(6, 95, 70, 0.12)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 50
      }}>
        <div>
          {/* Header de Sidebar */}
          <div style={{
            padding: '20px 16px',
            borderBottom: '1px solid rgba(6, 95, 70, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div
              style={{
                background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                cursor: 'pointer',
                shrink: 0
              }}
              onClick={() => navigate('/login')}
            >
              <Package size={22} color="#ffffff" />
            </div>
            {!collapsed && (
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                  PROTOTIPO
                </span>
                <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#064e3b', letterSpacing: '-0.5px' }}>
                  Logístico
                </span>
              </div>
            )}
          </div>

          {/* Menú de Navegación */}
          <nav style={{ padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {!collapsed && (
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(23, 59, 45, 0.45)', padding: '0 10px 8px 10px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                Navegación
              </div>
            )}

            {filteredNav.map((item) => {
              const IconComponent = item.icon;
              const isActive = currentPath === item.path;

              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'space-between',
                    gap: '12px',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: 'none',
                    background: isActive ? '#ecfdf5' : 'transparent',
                    color: isActive ? '#047857' : '#173b2d',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'left',
                    width: '100%'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <IconComponent size={18} color={isActive ? '#047857' : 'rgba(23, 59, 45, 0.7)'} />
                    {!collapsed && <span>{item.name}</span>}
                  </div>

                  {!collapsed && item.badge && (
                    <span className="badge-v0 badge-danger" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer de Sidebar: Perfil y Cierre de Sesión */}
        <div style={{ padding: '14px', borderTop: '1px solid rgba(6, 95, 70, 0.08)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {!collapsed && (
            <div style={{ background: '#f0fdf4', padding: '10px 12px', borderRadius: '10px', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#047857', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem', lineHeight: 1, shrink: 0, flexShrink: 0 }}>
                {activeRole.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#064e3b', truncate: true }}>
                  {roleLabels[activeRole]}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(23, 59, 45, 0.6)' }}>
                  Sesión activa
                </div>
              </div>
            </div>
          )}

          {/* Botón Salir / Cambiar Rol */}
          <button
            className="btn-v0-outline"
            style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem', padding: '8px 12px' }}
            onClick={() => navigate('/login')}
          >
            <LogOut size={16} /> {!collapsed && 'Cambiar de Rol / Salir'}
          </button>
        </div>
      </aside>

      {/* Área Principal de Contenido */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        
        {/* Header Superior del Dashboard */}
        <header style={{
          height: '60px',
          background: '#ffffff',
          borderBottom: '1px solid rgba(6, 95, 70, 0.12)',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 40
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#064e3b' }}>
              Perfil Actual: <span style={{ color: '#047857', fontWeight: 800 }}>{roleLabels[activeRole]}</span>
            </span>
          </div>

          {/* Selector Rápido de Rol Demo y Restaurar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={handleResetDemo}
              disabled={resetting}
              title="Restaura la base de datos de tu sesión con los datos iniciales de prueba"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                background: '#ffffff',
                border: '1px solid rgba(6, 95, 70, 0.25)',
                color: '#065f46',
                fontWeight: 600,
                fontSize: '0.78rem',
                cursor: resetting ? 'not-allowed' : 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                transition: 'all 0.2s ease'
              }}
            >
              <RotateCcw size={14} style={{ animation: resetting ? 'spin 1s linear infinite' : 'none' }} />
              {resetting ? 'Restaurando...' : 'Restaurar Datos Demo'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: 'rgba(23, 59, 45, 0.6)', fontWeight: 600 }}>ROL DE DEMO:</span>
              <div style={{ display: 'flex', background: '#f4f8f1', padding: '3px', borderRadius: '8px', border: '1px solid rgba(6, 95, 70, 0.15)' }}>
                <button
                  style={{ padding: '4px 10px', borderRadius: '6px', border: 'none', background: activeRole === 'admin' ? '#047857' : 'transparent', color: activeRole === 'admin' ? '#fff' : '#173b2d', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}
                  onClick={() => handleRoleSwitch('admin')}
                >
                  Logística
                </button>
                <button
                  style={{ padding: '4px 10px', borderRadius: '6px', border: 'none', background: activeRole === 'vendedor' ? '#047857' : 'transparent', color: activeRole === 'vendedor' ? '#fff' : '#173b2d', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}
                  onClick={() => handleRoleSwitch('vendedor')}
                >
                  Vendedor
                </button>
                <button
                  style={{ padding: '4px 10px', borderRadius: '6px', border: 'none', background: activeRole === 'chofer' ? '#047857' : 'transparent', color: activeRole === 'chofer' ? '#fff' : '#173b2d', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}
                  onClick={() => handleRoleSwitch('chofer')}
                >
                  Chofer
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Contenido Dinámico */}
        <main style={{ padding: '24px', flex: 1 }}>
          {children}
        </main>
      </div>

    </div>
  );
}
