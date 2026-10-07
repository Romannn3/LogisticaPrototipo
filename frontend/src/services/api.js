const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const getDemoSessionId = () => {
  let sessionId = localStorage.getItem('demo_session_id');
  if (!sessionId) {
    sessionId = 'session_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
    localStorage.setItem('demo_session_id', sessionId);
  }
  return sessionId;
};

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    'X-Session-Id': getDemoSessionId(),
    ...(options.headers || {})
  };

  return fetch(url, {
    ...options,
    headers
  });
}

export const api = {
  getDemoSessionId,

  // RESET DEMO SANDBOX
  async resetDemo() {
    try {
      const res = await apiRequest('/auth/reset-demo', { method: 'POST' });
      return await res.json();
    } catch (e) {
      console.warn("Error reiniciando demo:", e);
      return { success: false, message: 'No se pudo contactar al servidor' };
    }
  },

  // AUTH
  async getUsers() {
    try {
      const res = await apiRequest('/auth/users');
      return await res.json();
    } catch (e) {
      console.warn("API Error, usando fallback local:", e);
      return { success: false, users: [] };
    }
  },

  async getCurrentUser() {
    try {
      const res = await apiRequest('/auth/me');
      return await res.json();
    } catch (e) {
      return { authenticated: false, user: null };
    }
  },

  async switchRole(userId) {
    try {
      const res = await apiRequest(`/auth/switch-role/${userId}`, { method: 'POST' });
      return await res.json();
    } catch (e) {
      return { success: false };
    }
  },

  // PEDIDOS
  async getPedidos(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await apiRequest(`/pedidos?${query}`);
      return await res.json();
    } catch (e) {
      return { success: false, pedidos: [] };
    }
  },

  async createPedido(pedidoData) {
    const res = await apiRequest('/pedidos', {
      method: 'POST',
      body: JSON.stringify(pedidoData)
    });
    return await res.json();
  },

  async responderPedido(idPedido, aprobar, comentariosLogistica) {
    const res = await apiRequest(`/pedidos/${idPedido}/responder`, {
      method: 'POST',
      body: JSON.stringify({ aprobar, comentarios_logistica: comentariosLogistica })
    });
    return await res.json();
  },

  async parseWhatsAppMessage(mensaje) {
    const res = await apiRequest('/pedidos/parse-whatsapp', {
      method: 'POST',
      body: JSON.stringify({ mensaje })
    });
    return await res.json();
  },

  // VIAJES
  async getViajes(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await apiRequest(`/viajes?${query}`);
      return await res.json();
    } catch (e) {
      return { success: false, viajes: [] };
    }
  },

  async createViaje(viajeData) {
    const res = await apiRequest('/viajes', {
      method: 'POST',
      body: JSON.stringify(viajeData)
    });
    return await res.json();
  },

  async asignarPedidoAViaje(idViaje, idPedido) {
    const res = await apiRequest(`/viajes/${idViaje}/asignar-pedido`, {
      method: 'POST',
      body: JSON.stringify({ id_pedido: idPedido })
    });
    return await res.json();
  },

  async desasignarPedidoDeViaje(idViaje, idPedido) {
    const res = await apiRequest(`/viajes/${idViaje}/desasignar-pedido`, {
      method: 'POST',
      body: JSON.stringify({ id_pedido: idPedido })
    });
    return await res.json();
  },

  async deleteViaje(idViaje) {
    const res = await apiRequest(`/viajes/${idViaje}`, {
      method: 'DELETE'
    });
    return await res.json();
  },

  async updateViajeEstado(idViaje, idEstado) {
    const res = await apiRequest(`/viajes/${idViaje}/estado`, {
      method: 'POST',
      body: JSON.stringify({ id_estado: idEstado })
    });
    return await res.json();
  },

  async getChoferViajes(idChofer) {
    try {
      const res = await apiRequest(`/viajes/chofer/${idChofer}/mis-viajes`);
      return await res.json();
    } catch (e) {
      return { success: false, viajes: [] };
    }
  },

  // RECURSOS Y ALERTAS
  async getAlertas() {
    try {
      const res = await apiRequest('/recursos/choferes/alertas');
      return await res.json();
    } catch (e) {
      return { success: false, choferes_alertas: [], vehiculos_alertas: [] };
    }
  },

  async getClientes() {
    try {
      const res = await apiRequest('/recursos/clientes');
      return await res.json();
    } catch (e) {
      return { success: false, clientes: [] };
    }
  },

  async getChoferes() {
    try {
      const res = await apiRequest('/recursos/choferes');
      return await res.json();
    } catch (e) {
      return { success: false, choferes: [] };
    }
  },

  async getVehiculos() {
    try {
      const res = await apiRequest('/recursos/vehiculos');
      return await res.json();
    } catch (e) {
      return { success: false, vehiculos: [] };
    }
  },

  async getProductos() {
    try {
      const res = await apiRequest('/recursos/productos');
      return await res.json();
    } catch (e) {
      return { success: false, productos: [] };
    }
  },

  async getUnidades() {
    try {
      const res = await apiRequest('/recursos/unidades');
      return await res.json();
    } catch (e) {
      return { success: false, unidades: [] };
    }
  }
};
