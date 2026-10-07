import React, { useState } from 'react';
import { MessageSquare, Send, CheckCircle, Package, MapPin, User, Plus } from './Icons';

const SAMPLE_MESSAGES = [
  `Cliente: Empresa Distribuidora A\nProductos:\n100 lts de Insumo Agroquímico A\n20 bolsas de Fertilizante Granulado B\nLugar de entrega: Córdoba Centro - Planta Central Córdoba\nComentario: Cargar pedido urgente para entregar por la tarde`,
  `Cliente: Productor Agropecuario B\nProductos:\n50 bolsas de Semilla Seleccionada C\nLugar de entrega: Villa María Centro - Depósito Villa María\nComentario: Retiro por depósito central`
];

export default function WhatsAppParserView({ onParseMessage, onCreatePedido, clientes, productos, unidades }) {
  const [textoMensaje, setTextoMensaje] = useState('');
  const [resultadoParse, setResultadoParse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pedidoCreado, setPedidoCreado] = useState(false);

  const handleParse = async (textoToParse) => {
    const txt = textoToParse !== undefined ? textoToParse : textoMensaje;
    if (!txt.trim()) return;

    setLoading(true);
    setPedidoCreado(false);
    try {
      const res = await onParseMessage(txt);
      if (res.success) {
        setResultadoParse(res);
      }
    } catch (e) {
      console.error("Error al parsear:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSample = (sampleText) => {
    setTextoMensaje(sampleText);
    handleParse(sampleText);
  };

  const handleConfirmOrderCreation = async () => {
    if (!resultadoParse) return;

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

      setPedidoCreado(true);
    } catch (e) {
      console.error("Error al crear pedido desde parser:", e);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header Info */}
      <div className="v0-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{ background: '#ecfdf5', padding: '10px', borderRadius: '12px', color: '#047857' }}>
            <MessageSquare size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#064e3b' }}>Carga Rápida desde WhatsApp (Parser Inteligente)</h2>
            <p style={{ fontSize: '0.85rem', color: 'rgba(23, 59, 45, 0.65)' }}>
              Pega mensajes informales recibidos por WhatsApp. El motor extrae productos, cantidades y coordenadas para cruzarlos con la Base de Datos.
            </p>
          </div>
        </div>

        {/* Ejemplos de prueba */}
        <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.8rem', color: 'rgba(23, 59, 45, 0.6)', fontWeight: 600 }}>PROBAR EJEMPLOS:</span>
          {SAMPLE_MESSAGES.map((sample, idx) => (
            <button
              key={idx}
              className="btn-v0-outline"
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
              onClick={() => handleLoadSample(sample)}
            >
              Cargar Ejemplo #{idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: Formulario de entrada + Resultado live */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        
        {/* Panel Izquierdo: Textarea */}
        <div className="v0-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', color: '#064e3b' }}>1. Mensaje de WhatsApp Recibido</h3>
          
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
            disabled={loading || !textoMensaje.trim()}
          >
            {loading ? 'Procesando Expresiones Regulares...' : 'Procesar Mensaje con Regex & Fuzzy Search'}
          </button>
        </div>

        {/* Panel Derecho: Extracción & Match BD */}
        <div className="v0-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', color: '#047857' }}>
            2. Estructura Extraída & Sugerencias BD
          </h3>

          {!resultadoParse ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'rgba(23, 59, 45, 0.5)', fontSize: '0.85rem' }}>
              Esperando ingreso de texto. Haz clic en "Procesar Mensaje" para visualizar la extracción.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Cliente */}
              <div style={{ background: '#f8faf6', padding: '12px', borderRadius: '10px', border: '1px solid rgba(6, 95, 70, 0.1)' }}>
                <div style={{ fontSize: '0.75rem', color: 'rgba(23, 59, 45, 0.5)', fontWeight: 700 }}>CLIENTE RECONOCIDO</div>
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

              {/* Lugar de entrega */}
              <div style={{ background: '#f8faf6', padding: '12px', borderRadius: '10px', border: '1px solid rgba(6, 95, 70, 0.1)' }}>
                <div style={{ fontSize: '0.75rem', color: 'rgba(23, 59, 45, 0.5)', fontWeight: 700 }}>LUGAR DE ENTREGA</div>
                <div style={{ fontSize: '0.9rem', color: '#173b2d' }}>
                  Lugar: {resultadoParse.parsed_raw.lugar_entrega || 'No especificado'}
                </div>
              </div>

              {/* Productos */}
              <div style={{ background: '#f8faf6', padding: '12px', borderRadius: '10px', border: '1px solid rgba(6, 95, 70, 0.1)' }}>
                <div style={{ fontSize: '0.75rem', color: 'rgba(23, 59, 45, 0.5)', fontWeight: 700, marginBottom: '6px' }}>
                  PRODUCTOS Y CANTIDADES EXTRAÍDAS
                </div>
                {resultadoParse.productos_sugeridos.map((prod, idx) => (
                  <div key={idx} style={{
                    padding: '8px 12px', background: '#ffffff', border: '1px solid rgba(6, 95, 70, 0.12)', borderRadius: '6px',
                    marginBottom: '6px', fontSize: '0.85rem'
                  }}>
                    <div>Item: <strong>{prod.parsed.cantidad} {prod.parsed.unidad}</strong> de {prod.parsed.nombre}</div>
                    {prod.match_nombre ? (
                      <span style={{ fontSize: '0.75rem', color: '#047857' }}>
                        Asignado a catálogo: <strong>{prod.match_nombre}</strong>
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#dc2626' }}>
                        Sin coincidencia en catálogo (se asignará genérico)
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Botón de Confirmación */}
              {pedidoCreado ? (
                <div style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#15803d', padding: '12px', borderRadius: '10px', textAlign: 'center', fontWeight: 700 }}>
                  <CheckCircle size={20} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                  ¡Pedido creado y registrado exitosamente en la BD!
                </div>
              ) : (
                <button
                  className="btn-v0-primary"
                  style={{ width: '100%', padding: '12px', fontSize: '0.95rem', justifyContent: 'center' }}
                  onClick={handleConfirmOrderCreation}
                >
                  <Plus size={18} /> Confirmar e Ingresar Pedido al Sistema
                </button>
              )}

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
