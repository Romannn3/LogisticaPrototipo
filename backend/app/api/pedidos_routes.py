from flask import Blueprint, request, jsonify
from app.models import db, Pedido, Estado
from app.services.pedidos_service import (
    crear_solicitud_pedido,
    responder_solicitud_pedido,
    listar_pedidos_filtrados
)
from app.utils import parsear_mensaje_whatsapp, obtener_link_google_maps

pedidos_api = Blueprint('pedidos_api', __name__)

@pedidos_api.route('', methods=['GET'])
def get_pedidos():
    id_cliente = request.args.get('id_cliente', type=int)
    id_vendedor = request.args.get('id_vendedor', type=int)
    id_chofer = request.args.get('id_chofer', type=int)
    id_estado = request.args.get('id_estado', type=int)
    solo_sin_viaje = request.args.get('solo_sin_viaje', type=str, default='false').lower() == 'true'

    pedidos = listar_pedidos_filtrados(
        id_cliente=id_cliente,
        id_vendedor=id_vendedor,
        id_chofer=id_chofer,
        id_estado=id_estado,
        solo_sin_viaje=solo_sin_viaje
    )

    result = []
    for p in pedidos:
        p_dict = p.to_dict()
        p_dict['link_google_maps'] = obtener_link_google_maps(p)
        result.append(p_dict)

    return jsonify({
        'success': True,
        'count': len(result),
        'pedidos': result
    })


@pedidos_api.route('', methods=['POST'])
def create_pedido():
    data = request.get_json() or {}
    
    id_cliente = data.get('id_cliente')
    id_vendedor = data.get('id_vendedor')
    id_estado = data.get('id_estado')
    comentarios = data.get('comentarios', '')
    lugar_entrega = data.get('lugar_entrega', '')
    tipo_entrega = data.get('tipo_entrega', 'Entrega')
    items = data.get('items', [])

    if not id_cliente:
        return jsonify({'success': False, 'message': 'El id_cliente es obligatorio'}), 400

    pedido = crear_solicitud_pedido(
        id_vendedor=id_vendedor,
        id_cliente=id_cliente,
        id_estado=id_estado,
        comentarios=comentarios,
        lugar_entrega=lugar_entrega,
        tipo_entrega=tipo_entrega,
        items=items
    )

    p_dict = pedido.to_dict()
    p_dict['link_google_maps'] = obtener_link_google_maps(pedido)

    return jsonify({
        'success': True,
        'pedido': p_dict
    }), 201


@pedidos_api.route('/<int:id_pedido>', methods=['GET'])
def get_pedido_detail(id_pedido):
    pedido = Pedido.query.get_or_404(id_pedido)
    p_dict = pedido.to_dict()
    p_dict['link_google_maps'] = obtener_link_google_maps(pedido)
    return jsonify({
        'success': True,
        'pedido': p_dict
    })


@pedidos_api.route('/<int:id_pedido>/responder', methods=['POST'])
def responder_pedido(id_pedido):
    data = request.get_json() or {}
    aprobar = data.get('aprobar', True)
    comentarios_logistica = data.get('comentarios_logistica')

    pedido = responder_solicitud_pedido(id_pedido, aprobar=aprobar, comentarios_logistica=comentarios_logistica)
    
    return jsonify({
        'success': True,
        'pedido_id': pedido.id,
        'nuevo_estado': pedido.estado.nombre if pedido.estado else None,
        'comentarios_actualizados': pedido.comentarios
    })


@pedidos_api.route('/parse-whatsapp', methods=['POST'])
def parse_whatsapp():
    data = request.get_json() or {}
    mensaje = data.get('mensaje', '')

    res = parsear_mensaje_whatsapp(mensaje)
    return jsonify({
        'success': True,
        **res
    })


@pedidos_api.route('/vendedor/<int:id_vendedor>/mis-pedidos', methods=['GET'])
def mis_pedidos_vendedor(id_vendedor):
    pedidos = listar_pedidos_filtrados(id_vendedor=id_vendedor)
    result = [p.to_dict() for p in pedidos]
    return jsonify({
        'success': True,
        'pedidos': result
    })
