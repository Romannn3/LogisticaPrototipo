import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, MessageSquare, Plus, CheckCircle, MapPin, Package, Send, AlertTriangle } from './Icons';

const SAMPLE_MESSAGES = [
  `Cliente: Empresa Distribuidora A\nProductos:\n100 lts de Insumo Agroquímico A\n20 bolsas de Fertilizante Granulado B\nLugar de entrega: Córdoba Centro - Planta Central Córdoba\nComentario: Cargar pedido urgente para entregar por la tarde`,
  `Cliente: Productor Agropecuario B\nProductos:\n50 bolsas de Semilla Seleccionada C\nLugar de entrega: Villa María Centro - Depósito Villa María\nComentario: Retiro por depósito central`
];

export default function NuevoPedidoView({
  clientes,
  productos,
  unidades,
  onCreatePedido,
  onParseMessage
}) {
  const navigate = useNavigate();
  const [loadMode, setLoadMode] = useState('manual'); // 'manual' | 'whatsapp'

  // Form State para Carga Manual
  const [selectedCliente, setSelectedCliente] = useState('');
  const [lugarEntrega, setLugarEntrega] = useState('');
  const [comentarios, setComentarios] = useState('');
  const [items, setItems] = useState([{ id_producto: '', cantidad: 1, id_unidad: '' }]);
  const [loadingManual, setLoadingManual] = useState(false);
  const [manualSuccess, setManualSuccess] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Parser State para Carga por WhatsApp
  const [textoMensaje, setTextoMensaje] = useState('');
  const [resultadoParse, setResultadoParse] = useState(null);
  const [loadingWhatsapp, setLoadingWhatsapp] = useState(false);
  const [whatsappSuccess, setWhatsappSuccess] = useState(false);

  // Handlers Carga Manual
  const handleAddItem = () => {
    setItems([...items, { id_producto: '', cantidad: 1, id_unidad: '' }]);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!selectedCliente) {
      setValidationError('Debe seleccionar un cliente registrado.');
      return;
    }

    if (!lugarEntrega.trim()) {
      setValidationError('Debe ingresar el lugar de entrega o dirección rural.');
      return;
    }

    const itemsValidos = items.filter(i => i.id_producto && parseFloat(i.cantidad) > 0);
    if (itemsValidos.length === 0) {
      setValidationError('Debe agregar al menos un producto con cantidad válida mayor a 0.');
      return;
    }

    setLoadingManual(true);
    setManualSuccess(false);

    try {
      const itemsPayload = itemsValidos.map(i => ({
        id_producto: parseInt(i.id_producto),
        cantidad: parseFloat(i.cantidad),
        id_unidad: i.id_unidad ? parseInt(i.id_unidad) : null
      }));

      await onCreatePedido({
        id_cliente: parseInt(selectedCliente),
        lugar_entrega: lugarEntrega.trim(),
        comentarios: comentarios,
        items: itemsPayload
      });

      setManualSuccess(true);
      setSelectedCliente('');
      setLugarEntrega('');
      setComentarios('');
      setItems([{ id_producto: '', cantidad: 1, id_unidad: '' }]);

      setTimeout(() => navigate('/pedidos'), 1500);
    } catch (err) {
      console.error("Error al crear pedido manual:", err);
      setValidationError("Ocurrió un error al intentar crear el pedido. Intente nuevamente.");
    } finally {
      setLoadingManual(false);
    }
  };

  // Handlers Carga por WhatsApp
  const handleParse = async (textoToParse) => {
    const txt = textoToParse !== undefined ? textoToParse : textoMensaje;
    if (!txt.trim()) return;

    setLoadingWhatsapp(true);
    setWhatsappSuccess(false);

    try {
      const res = await onParseMessage(txt);
      if (res.success) {
        setResultadoParse(res);
      }
    } catch (e) {
      console.error("Error al parsear mensaje de WhatsApp:", e);
    } finally {
      setLoadingWhatsapp(false);
    }
  };

  const handleLoadSample = (sampleText) => {
    setTextoMensaje(sampleText);
    handleParse(sampleText);
  };

  const handleConfirmWhatsappOrder = async () => {
    if (!resultadoParse) return;

    setLoadingWhatsapp(true);
    const { parsed_raw, cliente_sugerido, productos_sugeridos } = resultadoParse;

    const idClienteFinal = cliente_sugerido?.id || (clientes.length > 0 ? clientes[0].id : 1);

    const itemsFinales = productos_sugeridos.map(p => ({
      id_producto: p.match_id || (productos.length > 0 ? productos[0].id : 1),
      cantidad: p.parsed.cantidad || 1,
      id_unidad: p.match_unidad_id || (unidades.length > 0 ? unidades[0].id : 1)
    }));

    try {
      await onCreatePedido({
        id_cliente: idClienteFinal,
        lugar_entrega: parsed_raw.lugar_entrega || '',
        comentarios: `[Carga Rápida WhatsApp]: ${parsed_raw.comentario || ''}`,
        items: itemsFinales
      });

      setWhatsappSuccess(true);
      setTimeout(() => navigate('/pedidos'), 1500);
    } catch (e) {
      console.error("Error al crear pedido desde parser:", e);
    } finally {
      setLoadingWhatsapp(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#064e3b', letterSpacing: '-0.5px' }}>
          Cargar Nuevo Pedido
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'rgba(23, 59, 45, 0.65)' }}>
          Selecciona la modalidad de ingreso del pedido al sistema.
        </p>
      </div>

      {/* Botones de Selección de Modo (Requisito Explícito) */}
      <div className="v0-card" style={{ padding: '16px', background: '#ffffff', display: 'flex', gap: '12px' }}>
        <button
          style={{
            flex: 1,
            padding: '14px 20px',
            borderRadius: '12px',
            border: loadMode === 'manual' ? '2px solid #047857' : '1px solid rgba(6, 95, 70, 0.15)',
            background: loadMode === 'manual' ? '#ecfdf5' : '#ffffff',
            color: loadMode === 'manual' ? '#047857' : '#173b2d',
            fontWeight: 800,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            transition: 'all 0.2s ease'
          }}
          onClick={() => setLoadMode('manual')}
        >
          <ClipboardList size={22} color={loadMode === 'manual' ? '#047857' : 'rgba(23, 59, 45, 0.6)'} />
          Cargar Manualmente
        </button>

        <button
          style={{
            flex: 1,
            padding: '14px 20px',
            borderRadius: '12px',
            border: loadMode === 'whatsapp' ? '2px solid #047857' : '1px solid rgba(6, 95, 70, 0.15)',
            background: loadMode === 'whatsapp' ? '#ecfdf5' : '#ffffff',
            color: loadMode === 'whatsapp' ? '#047857' : '#173b2d',
            fontWeight: 800,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            transition: 'all 0.2s ease'
          }}
          onClick={() => setLoadMode('whatsapp')}
        >
          <MessageSquare size={22} color={loadMode === 'whatsapp' ? '#047857' : 'rgba(23, 59, 45, 0.6)'} />
          Cargar pegando mensaje de WhatsApp
        </button>
      </div>

      {/* MODALIDAD 1: FORMULARIO MANUAL */}
      {loadMode === 'manual' && (
        <div className="v0-card" style={{ padding: '28px', background: '#ffffff', maxWidth: '750px', margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <ClipboardList size={24} color="#047857" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#064e3b' }}>
              Formulario de Carga Manual de Pedido
            </h3>
          </div>

          <style>{`
            @keyframes bounceInSuccess {
              0% { opacity: 0; transform: scale(0.85); }
              50% { opacity: 1; transform: scale(1.03); }
              100% { opacity: 1; transform: scale(1); }
            }
            @keyframes checkPulse {
              0% { transform: scale(1); }
              50% { transform: scale(1.2); }
              100% { transform: scale(1); }
            }
          `}</style>

          {manualSuccess && (
            <div style={{
              animation: 'bounceInSuccess 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
              background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
              border: '2px solid #4ade80',
              color: '#14532d',
              padding: '20px',
              borderRadius: '14px',
              marginBottom: '20px',
              textAlign: 'center',
              boxShadow: '0 10px 25px rgba(22, 163, 74, 0.15)'
            }}>
              <div style={{ display: 'inline-flex', padding: '12px', background: '#22c55e', borderRadius: '50%', color: '#ffffff', marginBottom: '10px', animation: 'checkPulse 0.6s ease-in-out infinite' }}>
                <CheckCircle size={32} />
              </div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#14532d', margin: '4px 0' }}>
                ¡Pedido Creado e Ingresado con Éxito!
              </h4>
              <p style={{ fontSize: '0.88rem', color: '#166534', margin: '4px 0 12px 0' }}>
                El pedido ha sido registrado en la Base de Datos y está disponible para gestión de logística.
              </p>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#15803d' }}>
                Redirigiendo automáticamente a la tabla de pedidos...
              </div>
            </div>
          )}

          {validationError && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} color="#dc2626" />
              <span>{validationError}</span>
            </div>
          )}

          <form onSubmit={handleManualSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: '#173b2d', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                Seleccionar Cliente *
              </label>
              <select
                className="v0-input"
                required
                value={selectedCliente}
                onChange={(e) => setSelectedCliente(e.target.value)}
              >
                <option value="">-- Seleccionar cliente registrado --</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre} ({c.tipo_descripcion})</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: '#173b2d', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                Lugar de Entrega / Dirección Rural
              </label>
              <input
                type="text"
                className="v0-input"
                placeholder="Ej: Estancia La Primavera, Monte Maíz - Ruta 11 Km 15"
                value={lugarEntrega}
                onChange={(e) => setLugarEntrega(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: '#173b2d', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                Comentarios / Observaciones para Logística
              </label>
              <input
                type="text"
                className="v0-input"
                placeholder="Ej: Entrega por la tarde, coordinar con capataz de campo"
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
              />
            </div>

            {/* Listado Dinámico de Insumos */}
            <div style={{ background: '#f8faf6', padding: '16px', borderRadius: '12px', border: '1px solid rgba(6, 95, 70, 0.12)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#064e3b' }}>
                  Detalle de Insumos / Productos
                </span>
                <button
                  type="button"
                  className="btn-v0-outline"
                  style={{ fontSize: '0.78rem', padding: '4px 10px' }}
                  onClick={handleAddItem}
                >
                  + Agregar Otro Producto
                </button>
              </div>

              {items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  <select
                    className="v0-input"
                    style={{ flex: 2, fontSize: '0.88rem' }}
                    value={item.id_producto}
                    onChange={(e) => handleItemChange(idx, 'id_producto', e.target.value)}
                  >
                    <option value="">Seleccionar insumo...</option>
                    {productos.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>

                  <input
                    type="number"
                    className="v0-input"
                    style={{ flex: 1, fontSize: '0.88rem' }}
                    placeholder="Cant."
                    min="0.1"
                    step="any"
                    value={item.cantidad}
                    onChange={(e) => handleItemChange(idx, 'cantidad', e.target.value)}
                  />

                  <select
                    className="v0-input"
                    style={{ flex: 1, fontSize: '0.88rem' }}
                    value={item.id_unidad}
                    onChange={(e) => handleItemChange(idx, 'id_unidad', e.target.value)}
                  >
                    <option value="">Unidad...</option>
                    {unidades.map(u => (
                      <option key={u.id} value={u.id}>{u.abreviatura || u.nombre}</option>
                    ))}
                  </select>

                  {items.length > 1 && (
                    <button
                      type="button"
                      className="btn-v0-outline"
                      style={{ color: '#dc2626', borderColor: '#fca5a5', padding: '4px 10px' }}
                      onClick={() => handleRemoveItem(idx)}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="submit"
              className="btn-v0-primary"
              style={{ padding: '14px', fontSize: '1rem', justifyContent: 'center', marginTop: '10px' }}
              disabled={loadingManual || !selectedCliente}
            >
              <Plus size={20} /> {loadingManual ? 'Registrando Pedido...' : 'Guardar e Ingresar Pedido'}
            </button>
          </form>
        </div>
      )}

      {/* MODALIDAD 2: CARGA PEGAJE WHATSAPP (CON EJEMPLOS Y ESTRUCTURA EXTRAIDA) */}
      {loadMode === 'whatsapp' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="v0-card" style={{ padding: '24px', background: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ background: '#ecfdf5', padding: '10px', borderRadius: '12px', color: '#047857' }}>
                <MessageSquare size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#064e3b' }}>
                  Carga por Mensaje de WhatsApp (Parser Regex & Fuzzy)
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'rgba(23, 59, 45, 0.65)' }}>
                  Pega directamente el mensaje informal recibido por WhatsApp para extraer cliente, insumos y ubicación.
                </p>
              </div>
            </div>

            {/* Ejemplos de prueba */}
            <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', color: 'rgba(23, 59, 45, 0.6)', fontWeight: 700 }}>PROBAR CON EJEMPLOS:</span>
              {SAMPLE_MESSAGES.map((sample, idx) => (
                <button
                  key={idx}
                  className="btn-v0-outline"
                  style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                  onClick={() => handleLoadSample(sample)}
                >
                  Cargar Ejemplo #{idx + 1}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
            
            {/* Input WhatsApp */}
            <div className="v0-card" style={{ padding: '20px', background: '#ffffff' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', color: '#064e3b' }}>
                1. Pegar Mensaje de WhatsApp
              </h4>

              <textarea
                className="v0-input"
                rows="10"
                placeholder={`Pega el mensaje aquí...\n\nEjemplo:\nCliente: Porcimonte\nProductos:\n100 lts de Cleto 24\nLugar de entrega: Monte Maíz`}
                value={textoMensaje}
                onChange={(e) => setTextoMensaje(e.target.value)}
                style={{ fontFamily: 'monospace', fontSize: '0.88rem', marginBottom: '14px', background: '#ffffff', color: '#173b2d' }}
              ></textarea>

              <button
                className="btn-v0-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => handleParse()}
                disabled={loadingWhatsapp || !textoMensaje.trim()}
              >
                {loadingWhatsapp ? 'Procesando mensaje...' : 'Procesar Mensaje y Extraer Datos'}
              </button>
            </div>

            {/* Extracción Extraída */}
            <div className="v0-card" style={{ padding: '20px', background: '#ffffff' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', color: '#047857' }}>
                2. Estructura Extraída & Coincidencias en BD
              </h4>

              {!resultadoParse ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: 'rgba(23, 59, 45, 0.5)', fontSize: '0.85rem' }}>
                  Ingresa texto o selecciona un ejemplo para visualizar la información extraída.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  
                  {/* Cliente */}
                  <div style={{ background: '#f8faf6', padding: '12px', borderRadius: '10px', border: '1px solid rgba(6, 95, 70, 0.1)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(23, 59, 45, 0.5)', fontWeight: 700 }}>CLIENTE EXTRAÍDO</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#064e3b' }}>
                      {resultadoParse.parsed_raw.cliente || 'No especificado'}
                    </div>
                    {resultadoParse.cliente_sugerido ? (
                      <div style={{ fontSize: '0.8rem', color: '#047857', marginTop: '4px' }}>
                        Match en BD: <strong>{resultadoParse.cliente_sugerido.nombre}</strong> (ID #{resultadoParse.cliente_sugerido.id})
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.8rem', color: '#d97706', marginTop: '4px' }}>
                        No se encontró match exacto en la BD
                      </div>
                    )}
                  </div>

                  {/* Lugar de Entrega */}
                  <div style={{ background: '#f8faf6', padding: '12px', borderRadius: '10px', border: '1px solid rgba(6, 95, 70, 0.1)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(23, 59, 45, 0.5)', fontWeight: 700 }}>LUGAR DE ENTREGA</div>
                    <div style={{ fontSize: '0.9rem', color: '#173b2d' }}>
                      {resultadoParse.parsed_raw.lugar_entrega || 'No especificado'}
                    </div>
                  </div>

                  {/* Productos */}
                  <div style={{ background: '#f8faf6', padding: '12px', borderRadius: '10px', border: '1px solid rgba(6, 95, 70, 0.1)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(23, 59, 45, 0.5)', fontWeight: 700, marginBottom: '6px' }}>
                      PRODUCTOS Y CANTIDADES
                    </div>
                    {resultadoParse.productos_sugeridos.map((prod, idx) => (
                      <div key={idx} style={{
                        padding: '8px 12px', background: '#ffffff', border: '1px solid rgba(6, 95, 70, 0.12)', borderRadius: '6px',
                        marginBottom: '6px', fontSize: '0.85rem'
                      }}>
                        <div>Item: <strong>{prod.parsed.cantidad} {prod.parsed.unidad}</strong> de {prod.parsed.nombre}</div>
                        {prod.match_nombre ? (
                          <span style={{ fontSize: '0.75rem', color: '#047857' }}>
                            Catálogo BD: <strong>{prod.match_nombre}</strong>
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#dc2626' }}>
                            Sin coincidencia (se asignará producto general)
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Confirmación */}
                  {whatsappSuccess ? (
                    <div style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#15803d', padding: '12px', borderRadius: '10px', textAlign: 'center', fontWeight: 700 }}>
                      <CheckCircle size={20} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                      ¡Pedido guardado con éxito! Redirigiendo...
                    </div>
                  ) : (
                    <button
                      className="btn-v0-primary"
                      style={{ width: '100%', padding: '12px', fontSize: '0.95rem', justifyContent: 'center' }}
                      onClick={handleConfirmWhatsappOrder}
                      disabled={loadingWhatsapp}
                    >
                      <Plus size={18} /> Confirmar e Ingresar Pedido al Sistema
                    </button>
                  )}

                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
