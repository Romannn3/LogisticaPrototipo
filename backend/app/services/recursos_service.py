from app.models import db, Chofer, Vehiculo, Cliente, Domicilio, Producto, UnidadMedida

def obtener_alertas_documentacion():
    """
    Retorna el estado de alertas de choferes y vehículos.
    """
    choferes = Chofer.query.all()
    vehiculos = Vehiculo.query.all()

    alertas_choferes = []
    for c in choferes:
        st = c.estado_documentacion
        if st['global_status'] != 'success':
            alertas_choferes.append({
                'id': c.id,
                'nombre_completo': f"{c.nombre} {c.apellido}",
                'global_status': st['global_status'],
                'alertas_vencidas': st['alertas'],
                'avisos_por_vencer': st['avisos']
            })

    alertas_vehiculos = []
    for v in vehiculos:
        st = v.estado_documentacion
        if st['global_status'] != 'success':
            alertas_vehiculos.append({
                'id': v.id,
                'patente': v.patente,
                'modelo': v.modelo,
                'global_status': st['global_status'],
                'alertas_vencidas': st['alertas'],
                'avisos_por_vencer': st['avisos']
            })

    return {
        'choferes_alertas': alertas_choferes,
        'vehiculos_alertas': alertas_vehiculos
    }
