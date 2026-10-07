from datetime import datetime
from app.models import db, Viaje, Pedido, Estado

def generar_codigo_viaje(fecha=None):
    """
    Genera un código único secuencial diario.
    Ejemplo: V-061026-0001
    """
    if fecha is None:
        fecha = datetime.now()

    fecha_str = fecha.strftime('%d%m%y')
    fecha_inicio = fecha.replace(hour=0, minute=0, second=0, microsecond=0)
    fecha_fin = fecha.replace(hour=23, minute=59, second=59, microsecond=999999)

    viajes_del_dia = Viaje.query.filter(
        Viaje.fecha_viaje >= fecha_inicio,
        Viaje.fecha_viaje <= fecha_fin
    ).all()

    secuencial = 1
    if viajes_del_dia:
        secuenciales = []
        for v in viajes_del_dia:
            if v.codigo_viaje and len(v.codigo_viaje.split('-')) == 3:
                try:
                    seq = int(v.codigo_viaje.split('-')[2])
                    secuenciales.append(seq)
                except (ValueError, IndexError):
                    pass
        if secuenciales:
            secuencial = max(secuenciales) + 1

    return f"V-{fecha_str}-{str(secuencial).zfill(4)}"


def crear_viaje(id_chofer=None, id_vehiculo=None, notas='', fecha=None):
    if fecha is None:
        fecha = datetime.now()

    estado_inicial = Estado.query.filter_by(nombre='En Curso', ambito='VIAJE').first()
    if not estado_inicial:
        estado_inicial = Estado.query.filter_by(nombre='Pendiente', ambito='VIAJE').first()
    if not estado_inicial:
        estado_inicial = Estado.query.filter_by(nombre='Borrador', ambito='VIAJE').first()

    codigo = generar_codigo_viaje(fecha)

    viaje = Viaje(
        codigo_viaje=codigo,
        fecha_viaje=fecha,
        id_chofer=id_chofer,
        id_vehiculo=id_vehiculo,
        id_estado=estado_inicial.id if estado_inicial else 8,
        notas=notas
    )
    db.session.add(viaje)
    db.session.commit()
    return viaje


def asignar_pedido_a_viaje(id_viaje, id_pedido):
    viaje = Viaje.query.get_or_404(id_viaje)
    pedido = Pedido.query.get_or_404(id_pedido)

    pedido.id_viaje = viaje.id
    # Actualizar estado de pedido a 'En Ruta' si corresponde
    estado_en_ruta = Estado.query.filter_by(nombre='En Ruta', ambito='PEDIDO').first()
    if estado_en_ruta:
        pedido.id_estado = estado_en_ruta.id

    db.session.commit()
    return viaje


def desasignar_pedido_de_viaje(id_pedido):
    pedido = Pedido.query.get_or_404(id_pedido)
    pedido.id_viaje = None
    
    estado_aprobado = Estado.query.filter_by(nombre='Aprobado', ambito='PEDIDO').first()
    if estado_aprobado:
        pedido.id_estado = estado_aprobado.id

    db.session.commit()
    return pedido


def eliminar_viaje(id_viaje):
    viaje = Viaje.query.get_or_404(id_viaje)
    # Regla de negocio: al eliminar viaje, desasignar pedidos sin borrarlos
    for pedido in viaje.pedidos:
        pedido.id_viaje = None
        estado_aprobado = Estado.query.filter_by(nombre='Aprobado', ambito='PEDIDO').first()
        if estado_aprobado:
            pedido.id_estado = estado_aprobado.id

    db.session.delete(viaje)
    db.session.commit()
    return True
