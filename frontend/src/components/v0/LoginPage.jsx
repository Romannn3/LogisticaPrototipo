import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Users, Truck, ArrowRight, CheckCircle, Package, MapPin, AlertTriangle } from '../Icons';

export default function LoginPage({ onSelectRole }) {
  const navigate = useNavigate();

  const handleRoleClick = (role, redirectPath) => {
    onSelectRole(role);
    navigate(redirectPath);
  };

  const roles = [
    {
      role: "admin",
      title: "Responsable de Logística",
      description: "Gestiona pedidos, aprueba solicitudes, crea Hojas de Ruta y administra choferes y vehículos.",
      path: "/dashboard",
      badgeColor: "#047857",
      icon: ClipboardList
    },
    {
      role: "vendedor",
      title: "Vendedor",
      description: "Solicita pedidos nuevos para sus clientes y realiza el seguimiento en tiempo real de sus entregas.",
      path: "/vendedor",
      badgeColor: "#059669",
      icon: Users
    },
    {
      role: "chofer",
      title: "Chofer",
      description: "Consulta sus viajes asignados del día, paradas secuenciales y notifica llegadas por GPS y WhatsApp.",
      path: "/chofer",
      badgeColor: "#65a30d",
      icon: Truck
    }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f4f8f1', color: '#173b2d', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <header style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{
            background: '#047857', color: '#ffffff', width: '40px', height: '40px',
            borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(4, 120, 87, 0.25)'
          }}>
            <Package size={22} color="#ffffff" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
              PROTOTIPO
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#064e3b', letterSpacing: '-0.5px' }}>
              Logístico
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'rgba(23, 59, 45, 0.7)', fontWeight: 500 }}>
          <CheckCircle size={16} color="#047857" />
          Operación simple y segura
        </div>
      </header>

      {/* Hero Section & Card Access */}
      <main style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '40px 24px', flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '48px', alignItems: 'center' }}>
        
        {/* Left Hero Description */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: '#ffffff', border: '1px solid rgba(4, 120, 87, 0.2)',
            padding: '6px 14px', borderRadius: '30px', width: 'fit-content',
            fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#047857'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#84cc16' }}></span>
            MVP de Gestión Logística
          </div>

          <h1 style={{ fontSize: '2.8rem', fontWeight: 800, lineHeight: 1.1, color: '#064e3b', letterSpacing: '-1px' }}>
            Toda tu logística, <br />
            <span style={{ color: '#047857' }}>en un solo lugar.</span>
          </h1>

          <p style={{ fontSize: '1.05rem', color: 'rgba(23, 59, 45, 0.75)', lineHeight: 1.6, maxWidth: '500px' }}>
            Organizá pedidos, coordiná entregas y mantené a cada persona informada. AgroLogística conecta vendedores, logística y choferes en un flujo simple.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '8px' }}>
            <div style={{ background: '#ffffff', border: '1px solid rgba(23, 59, 45, 0.1)', padding: '8px 14px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package size={16} color="#047857" /> Pedidos centralizados
            </div>
            <div style={{ background: '#ffffff', border: '1px solid rgba(23, 59, 45, 0.1)', padding: '8px 14px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={16} color="#047857" /> Entregas bajo control
            </div>
            <div style={{ background: '#ffffff', border: '1px solid rgba(23, 59, 45, 0.1)', padding: '8px 14px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={16} color="#047857" /> Alertas importantes
            </div>
          </div>
        </div>

        {/* Right 3-Button Role Access Card */}
        <div className="v0-card" style={{ padding: '32px', background: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ background: '#ecfdf5', color: '#047857', padding: '10px', borderRadius: '12px' }}>
              <CheckCircle size={24} />
            </div>
            <span style={{ background: '#ecfccb', color: '#3f6212', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800 }}>
              Acceso MVP
            </span>
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#064e3b', marginTop: '12px', marginBottom: '4px' }}>
            ¿Cómo querés ingresar?
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'rgba(23, 59, 45, 0.65)', marginBottom: '24px' }}>
            Elegí tu perfil para acceder a las herramientas de tu operación.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {roles.map((r) => {
              const IconComponent = r.icon;
              return (
                <button
                  key={r.role}
                  className="role-card-btn"
                  onClick={() => handleRoleClick(r.role, r.path)}
                >
                  <div style={{
                    width: '46px', height: '46px', borderRadius: '12px',
                    background: r.badgeColor, color: '#ffffff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', shrink: 0
                  }}>
                    <IconComponent size={22} color="#ffffff" />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#064e3b' }}>
                      {r.title}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'rgba(23, 59, 45, 0.65)', marginTop: '2px', lineHeight: 1.3 }}>
                      {r.description}
                    </div>
                  </div>

                  <ArrowRight size={18} color="#047857" />
                </button>
              );
            })}
          </div>

          <p style={{ fontSize: '0.75rem', color: 'rgba(23, 59, 45, 0.5)', textAlign: 'center', marginTop: '20px' }}>
            En esta versión podés explorar cada rol con 1 solo clic sin configuración adicional.
          </p>
        </div>

      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(23, 59, 45, 0.1)', background: 'rgba(255, 255, 255, 0.5)', padding: '16px 24px', fontSize: '0.75rem', color: 'rgba(23, 59, 45, 0.6)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>AgroLogística · Gestión para equipos en movimiento</span>
          <span>Pedidos · Personas · Vehículos · Hojas de Ruta</span>
        </div>
      </footer>

    </div>
  );
}
