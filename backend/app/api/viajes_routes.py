from flask import Blueprint, request, jsonify
from app.models import db, Viaje, Estado
from app.services.viajes_service import (
    crear_viaje,
    asignar_pedido_a_viaje,
    desasignar_pedido_de_viaje,
    eliminar_viaje
)
from app.utils import generar_whatsapp_link_hoja_ruta, obtener_link_google_maps

viajes_api = Blueprint('viajes_api', __name__)

@viajes_api.route('', methods=['GET'])
def get_viajes():
    id_chofer = request.args.get('id_chofer', type=int)
    id_estado = request.args.get('id_estado', type=int)

    query = Viaje.query
    if id_chofer:
        query = query.filter(Viaje.id_chofer == id_chofer)
    if id_estado:
        query = query.filter(Viaje.id_estado == id_estado)

    viajes = query.order_by(Viaje.fecha_viaje.desc()).all()
    
    result = []
    for v in viajes:
        v_dict = v.to_dict()
        v_dict['whatsapp_link'] = generar_whatsapp_link_hoja_ruta(v)
        result.append(v_dict)

    return jsonify({
        'success': True,
        'count': len(result),
        'viajes': result
    })


@viajes_api.route('', methods=['POST'])
def create_viaje():
    data = request.get_json() or {}
    id_chofer = data.get('id_chofer')
    id_vehiculo = data.get('id_vehiculo')
    notas = data.get('notas', '')

    viaje = crear_viaje(id_chofer=id_chofer, id_vehiculo=id_vehiculo, notas=notas)
    
    v_dict = viaje.to_dict()
    v_dict['whatsapp_link'] = generar_whatsapp_link_hoja_ruta(viaje)

    return jsonify({
        'success': True,
        'viaje': v_dict
    }), 201


@viajes_api.route('/<int:id_viaje>', methods=['GET'])
def get_viaje_detail(id_viaje):
    viaje = Viaje.query.get_or_404(id_viaje)
    v_dict = viaje.to_dict()
    v_dict['whatsapp_link'] = generar_whatsapp_link_hoja_ruta(viaje)
    return jsonify({
        'success': True,
        'viaje': v_dict
    })


@viajes_api.route('/<int:id_viaje>/asignar-pedido', methods=['POST'])
def asignar_pedido(id_viaje):
    data = request.get_json() or {}
    id_pedido = data.get('id_pedido')
    if not id_pedido:
        return jsonify({'success': False, 'message': 'id_pedido es requerido'}), 400

    viaje = asignar_pedido_a_viaje(id_viaje, id_pedido)
    v_dict = viaje.to_dict()
    v_dict['whatsapp_link'] = generar_whatsapp_link_hoja_ruta(viaje)

    return jsonify({
        'success': True,
        'viaje': v_dict
    })


@viajes_api.route('/<int:id_viaje>/desasignar-pedido', methods=['POST'])
def desasignar_pedido(id_viaje):
    data = request.get_json() or {}
    id_pedido = data.get('id_pedido')
    if not id_pedido:
        return jsonify({'success': False, 'message': 'id_pedido es requerido'}), 400

    desasignar_pedido_de_viaje(id_pedido)
    viaje = Viaje.query.get_or_404(id_viaje)
    v_dict = viaje.to_dict()
    v_dict['whatsapp_link'] = generar_whatsapp_link_hoja_ruta(viaje)

    return jsonify({
        'success': True,
        'viaje': v_dict
    })


@viajes_api.route('/<int:id_viaje>/estado', methods=['PUT', 'POST'])
def cambiar_estado(id_viaje):
    data = request.get_json() or {}
    id_estado = data.get('id_estado')
    estado_nombre = data.get('estado_nombre')

    viaje = Viaje.query.get_or_404(id_viaje)

    if estado_nombre:
        st = Estado.query.filter_by(nombre=estado_nombre, ambito='VIAJE').first()
        if st:
            id_estado = st.id

    if id_estado:
        # Si se solicita finalizar el viaje (ID 9 o ID 3 legacy o nombre Finalizado)
        if id_estado in (9, 3) or (estado_nombre and estado_nombre.lower() == 'finalizado'):
            st_finalizado = Estado.query.filter_by(nombre='Finalizado', ambito='VIAJE').first()
            viaje.id_estado = st_finalizado.id if st_finalizado else 9

            # Actualizar pedidos del viaje a 'Entregado' (ID 4)
            st_entregado = Estado.query.filter_by(nombre='Entregado', ambito='PEDIDO').first()
            id_entregado = st_entregado.id if st_entregado else 4
            for p in viaje.pedidos:
                p.id_estado = id_entregado
        else:
            viaje.id_estado = id_estado

        db.session.commit()

    return jsonify({
        'success': True,
        'viaje': viaje.to_dict()
    })


@viajes_api.route('/<int:id_viaje>', methods=['DELETE'])
def delete_viaje(id_viaje):
    eliminar_viaje(id_viaje)
    return jsonify({
        'success': True,
        'message': f'Viaje {id_viaje} eliminado y sus pedidos desasignados'
    })


@viajes_api.route('/<int:id_viaje>/whatsapp-link', methods=['GET'])
def get_whatsapp_link(id_viaje):
    viaje = Viaje.query.get_or_404(id_viaje)
    link = generar_whatsapp_link_hoja_ruta(viaje)
    return jsonify({
        'success': True,
        'codigo_viaje': viaje.codigo_viaje,
        'whatsapp_link': link
    })


@viajes_api.route('/chofer/<int:id_chofer>/mis-viajes', methods=['GET'])
def mis_viajes_chofer(id_chofer):
    viajes = Viaje.query.filter_by(id_chofer=id_chofer).order_by(Viaje.fecha_viaje.desc()).all()
    
    result = []
    for v in viajes:
        v_dict = v.to_dict()
        v_dict['whatsapp_link'] = generar_whatsapp_link_hoja_ruta(v)
        # Asegurar links GPS en los pedidos
        for p in v_dict['pedidos']:
            pedido_obj = next((item for item in v.pedidos if item.id == p['id']), None)
            p['link_google_maps'] = obtener_link_google_maps(pedido_obj)
        result.append(v_dict)

    return jsonify({
        'success': True,
        'viajes': result
    })
