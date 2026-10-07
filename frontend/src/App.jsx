import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import SidebarLayout from './components/SidebarLayout';
import LogisticaDashboard from './components/LogisticaDashboard';
import NuevoPedidoView from './components/NuevoPedidoView';
import PedidoDetailView from './components/PedidoDetailView';
import ViajesView from './components/ViajesView';
import ViajeDetailView from './components/ViajeDetailView';
import PedidosTable from './components/tables/PedidosTable';
import ChoferesTable from './components/tables/ChoferesTable';
import VehiculosTable from './components/tables/VehiculosTable';
import ClientesTable from './components/tables/ClientesTable';
import VendedorView from './components/VendedorView';
import ChoferPortal from './components/ChoferPortal';
import LoginPage from './components/v0/LoginPage';
import { api } from './services/api';

export default function App() {
  const [activeRole, setActiveRole] = useState('admin'); // 'admin', 'vendedor', 'chofer'
  const location = useLocation();

  const [pedidos, setPedidos] = useState([]);
  const [viajes, setViajes] = useState([]);
  const [choferes, setChoferes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [alertas, setAlertas] = useState({ choferes_alertas: [], vehiculos_alertas: [] });
  const [viajesChofer, setViajesChofer] = useState([]);
  
  const [loading, setLoading] = useState(true);

  const isLoginPage = location.pathname === '/' || location.pathname === '/login';

  // Sincronizar rol según la URL (Corrección estricta para evitar confusión con /choferes o /viajes)
  useEffect(() => {
    const p = location.pathname;
    if (p.startsWith('/vendedor')) {
      setActiveRole('vendedor');
    } else if (p === '/chofer' || p.startsWith('/chofer/')) {
      setActiveRole('chofer');
    } else {
      setActiveRole('admin');
    }
  }, [location.pathname]);

  const loadData = async () => {
    try {
      const [resPed, resVia, resChof, resVeh, resCli, resProd, resUni, resAle] = await Promise.all([
        api.getPedidos(),
        api.getViajes(),
        api.getChoferes(),
        api.getVehiculos(),
        api.getClientes(),
        api.getProductos(),
        api.getUnidades(),
        api.getAlertas()
      ]);

      if (resPed.pedidos) setPedidos(resPed.pedidos);
      if (resVia.viajes) setViajes(resVia.viajes);
      if (resChof.choferes) setChoferes(resChof.choferes);
      if (resVeh.vehiculos) setVehiculos(resVeh.vehiculos);
      if (resCli.clientes) setClientes(resCli.clientes);
      if (resProd.productos) setProductos(resProd.productos);
      if (resUni.unidades) setUnidades(resUni.unidades);
      if (resAle.choferes_alertas) setAlertas(resAle);

      const resChoferVia = await api.getChoferViajes(1);
      if (resChoferVia.viajes) setViajesChofer(resChoferVia.viajes);

    } catch (e) {
      console.error("Error al conectar con la API Backend:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handlers
  const handleResponderPedido = async (idPedido, aprobar, comentarios) => {
    await api.responderPedido(idPedido, aprobar, comentarios);
    await loadData();
  };

  const handleCreateViaje = async (viajeData) => {
    await api.createViaje(viajeData);
    await loadData();
  };

  const handleAsignarPedido = async (idViaje, idPedido) => {
    await api.asignarPedidoAViaje(idViaje, idPedido);
    await loadData();
  };

  const handleDesasignarPedido = async (idViaje, idPedido) => {
    await api.desasignarPedidoDeViaje(idViaje, idPedido);
    await loadData();
  };

  const handleDeleteViaje = async (idViaje) => {
    if (window.confirm("¿Seguro que deseas eliminar esta Hoja de Ruta? Sus pedidos quedarán desasignados.")) {
      await api.deleteViaje(idViaje);
      await loadData();
    }
  };

  const handleFinalizarViaje = async (idViaje) => {
    if (window.confirm("¿Confirmas que has completado y finalizado este viaje?")) {
      await api.updateViajeEstado(idViaje, 9); // 9 = Finalizado para VIAJE
      await loadData();
    }
  };

  const handleCreatePedido = async (pedidoData) => {
    const finalData = {
      ...pedidoData,
      id_vendedor: activeRole === 'vendedor' ? 1 : (pedidoData.id_vendedor || null),
      id_estado: activeRole === 'admin' ? 2 : (pedidoData.id_estado || 1) // 2 = Aprobado para Logística/Admin, 1 = Solicitado para Vendedor
    };
    await api.createPedido(finalData);
    await loadData();
  };

  const handleParseWhatsApp = async (mensaje) => {
    return await api.parseWhatsAppMessage(mensaje);
  };

  const totalAlertasCount = (alertas.choferes_alertas?.length || 0) + (alertas.vehiculos_alertas?.length || 0);

  // Si estamos en la página de Login (/) se muestra únicamente la portada v0 de 3 roles
  if (isLoginPage) {
    return <LoginPage onSelectRole={(role) => setActiveRole(role)} />;
  }

  return (
    <SidebarLayout
      activeRole={activeRole}
      setActiveRole={setActiveRole}
      alertsCount={totalAlertasCount}
    >
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'rgba(23, 59, 45, 0.6)' }}>
          Conectando con API Backend de AgroLogística...
        </div>
      ) : (
        <Routes>
          <Route path="/dashboard" element={
            <LogisticaDashboard
              pedidos={pedidos}
              viajes={viajes}
              choferes={choferes}
              vehiculos={vehiculos}
              alertas={alertas}
              onResponderPedido={handleResponderPedido}
            />
          } />

          <Route path="/nuevo-pedido" element={
            <NuevoPedidoView
              clientes={clientes}
              productos={productos}
              unidades={unidades}
              onCreatePedido={handleCreatePedido}
              onParseMessage={handleParseWhatsApp}
            />
          } />

          <Route path="/pedidos" element={
            <PedidosTable
              pedidos={pedidos}
              onResponderPedido={handleResponderPedido}
            />
          } />

          <Route path="/pedidos/:id" element={
            <PedidoDetailView
              pedidos={pedidos}
              viajes={viajes}
              onResponderPedido={handleResponderPedido}
            />
          } />

          <Route path="/viajes" element={
            <ViajesView
              viajes={viajes}
              pedidos={pedidos}
              choferes={choferes}
              vehiculos={vehiculos}
              onCreateViaje={handleCreateViaje}
              onAsignarPedido={handleAsignarPedido}
              onDesasignarPedido={handleDesasignarPedido}
              onDeleteViaje={handleDeleteViaje}
            />
          } />

          <Route path="/viajes/:id" element={
            <ViajeDetailView
              viajes={viajes}
              pedidos={pedidos}
              onAsignarPedido={handleAsignarPedido}
              onDesasignarPedido={handleDesasignarPedido}
              onDeleteViaje={handleDeleteViaje}
            />
          } />

          <Route path="/choferes" element={
            <ChoferesTable
              choferes={choferes}
            />
          } />

          <Route path="/vehiculos" element={
            <VehiculosTable
              vehiculos={vehiculos}
            />
          } />

          <Route path="/clientes" element={
            <ClientesTable
              clientes={clientes}
            />
          } />

          <Route path="/whatsapp" element={<Navigate to="/nuevo-pedido" replace />} />
          <Route path="/recursos" element={<Navigate to="/choferes" replace />} />

          {/* Rutas Vendedor */}
          <Route path="/vendedor" element={<Navigate to="/vendedor/nuevo" replace />} />
          <Route path="/vendedor/nuevo" element={
            <VendedorView
              mode="nuevo"
              pedidos={pedidos}
              clientes={clientes}
              productos={productos}
              unidades={unidades}
              onCreatePedido={handleCreatePedido}
            />
          } />
          <Route path="/vendedor/pedidos" element={
            <VendedorView
              mode="pedidos"
              pedidos={pedidos}
              clientes={clientes}
              productos={productos}
              unidades={unidades}
              onCreatePedido={handleCreatePedido}
            />
          } />

          {/* Rutas Chofer */}
          <Route path="/chofer" element={
            <ChoferPortal
              mode="actual"
              viajesChofer={viajesChofer.length > 0 ? viajesChofer : viajes}
              onFinalizarViaje={handleFinalizarViaje}
            />
          } />
          <Route path="/chofer/historial" element={
            <ChoferPortal
              mode="historial"
              viajesChofer={viajesChofer.length > 0 ? viajesChofer : viajes}
              onFinalizarViaje={handleFinalizarViaje}
            />
          } />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      )}
    </SidebarLayout>
  );
}
