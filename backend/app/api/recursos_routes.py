from flask import Blueprint, request, jsonify
from app.models import (
    db, Cliente, Domicilio, Chofer, Vehiculo,
    Producto, UnidadMedida, Estado, Localidad, Provincia
)
from app.services.recursos_service import obtener_alertas_documentacion

recursos_api = Blueprint('recursos_api', __name__)

# --- CLIENTES ---
@recursos_api.route('/clientes', methods=['GET'])
def get_clientes():
    clientes = Cliente.query.all()
    return jsonify({
        'success': True,
        'clientes': [c.to_dict() for c in clientes]
    })

@recursos_api.route('/clientes', methods=['POST'])
def create_cliente():
    data = request.get_json() or {}
    nombre = data.get('nombre')
    celular = data.get('celular')
    id_tipo = data.get('id_tipo', 1)

    if not nombre:
        return jsonify({'success': False, 'message': 'Nombre de cliente requerido'}), 400

    cliente = Cliente(nombre=nombre, celular=celular, id_tipo=id_tipo)
    db.session.add(cliente)
    db.session.flush()

    # Domicilio opcional
    if 'domicilio' in data:
        dom_data = data['domicilio']
        dom = Domicilio(
            alias=dom_data.get('alias', 'Principal'),
            calle=dom_data.get('calle', ''),
            numero=dom_data.get('numero', ''),
            id_localidad=dom_data.get('id_localidad', 1),
            coord_gps=dom_data.get('coord_gps', ''),
            es_principal=True,
            id_cliente=cliente.id
        )
        db.session.add(dom)

    db.session.commit()
    return jsonify({'success': True, 'cliente': cliente.to_dict()}), 201


# --- CHOFERES ---
@recursos_api.route('/choferes', methods=['GET'])
def get_choferes():
    choferes = Chofer.query.all()
    return jsonify({
        'success': True,
        'choferes': [c.to_dict() for c in choferes]
    })

@recursos_api.route('/choferes/alertas', methods=['GET'])
def get_alertas_choferes():
    alertas = obtener_alertas_documentacion()
    return jsonify({
        'success': True,
        **alertas
    })


# --- VEHÍCULOS ---
@recursos_api.route('/vehiculos', methods=['GET'])
def get_vehiculos():
    vehiculos = Vehiculo.query.all()
    return jsonify({
        'success': True,
        'vehiculos': [v.to_dict() for v in vehiculos]
    })


# --- PRODUCTOS Y UNIDADES ---
@recursos_api.route('/productos', methods=['GET'])
def get_productos():
    productos = Producto.query.all()
    return jsonify({
        'success': True,
        'productos': [p.to_dict() for p in productos]
    })

@recursos_api.route('/unidades', methods=['GET'])
def get_unidades():
    unidades = UnidadMedida.query.all()
    return jsonify({
        'success': True,
        'unidades': [u.to_dict() for u in unidades]
    })


# --- ESTADOS ---
@recursos_api.route('/estados', methods=['GET'])
def get_estados():
    estados = Estado.query.all()
    return jsonify({
        'success': True,
        'estados': [e.to_dict() for e in estados]
    })
