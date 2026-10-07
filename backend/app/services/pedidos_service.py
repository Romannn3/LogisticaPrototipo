from datetime import datetime
from app.models import db, Pedido, ItemsPedido, Estado, Viaje

def crear_solicitud_pedido(id_vendedor, id_cliente, comentarios='', lugar_entrega='', tipo_entrega='Entrega', items=None, fecha_entrega=None, id_estado=None):
    """
    Crea un pedido o solicitud de pedido.
    Si lo crea un vendedor, el estado inicial es 'Solicitado' (1).
    Si lo crea Logística, el estado inicial es 'Aprobado' (2).
    """
    if not id_estado:
        estado_solicitado = Estado.query.filter_by(nombre='Solicitado', ambito='PEDIDO').first()
        id_estado = estado_solicitado.id if estado_solicitado else 1

    pedido = Pedido(
        id_cliente=id_cliente,
        id_vendedor=id_vendedor,
        id_estado=id_estado,
        comentarios=comentarios,
        lugar_entrega=lugar_entrega,
        tipo_entrega=tipo_entrega,
        fecha=datetime.utcnow(),
        fecha_entrega=fecha_entrega
    )
    db.session.add(pedido)
    db.session.flush()  # Obtener ID del pedido

    if items:
        for item_data in items:
            item = ItemsPedido(
                id_pedido=pedido.id,
                id_producto=item_data['id_producto'],
                cantidad=float(item_data['cantidad']),
                id_unidad=item_data.get('id_unidad')
            )
            db.session.add(item)

    db.session.commit()
    return pedido


def responder_solicitud_pedido(id_pedido, aprobar=True, comentarios_logistica=None):
    """
    El Administrador de Logística Aprueba o Rechaza la solicitud.
    """
    pedido = Pedido.query.get_or_404(id_pedido)
    
    nombre_nuevo_estado = 'Aprobado' if aprobar else 'Rechazado'
    estado = Estado.query.filter_by(nombre=nombre_nuevo_estado, ambito='PEDIDO').first()
    
    if estado:
        pedido.id_estado = estado.id
    
    if comentarios_logistica:
        pedido.comentarios = f"{pedido.comentarios or ''}\n[Logística]: {comentarios_logistica}".strip()
        
    db.session.commit()
    return pedido


def listar_pedidos_filtrados(
    id_cliente=None,
    id_vendedor=None,
    id_chofer=None,
    id_estado=None,
    solo_sin_viaje=False,
    page=1,
    per_page=50
):
    query = Pedido.query

    if id_cliente:
        query = query.filter(Pedido.id_cliente == id_cliente)
    if id_vendedor:
        query = query.filter(Pedido.id_vendedor == id_vendedor)
    if id_estado:
        query = query.filter(Pedido.id_estado == id_estado)
    if solo_sin_viaje:
        query = query.filter(Pedido.id_viaje == None)
        
    # Filtro de Pedido por Chofer (vía JOIN con Viaje)
    if id_chofer:
        query = query.join(Viaje).filter(Viaje.id_chofer == id_chofer)

    return query.order_by(Pedido.fecha.desc()).all()
