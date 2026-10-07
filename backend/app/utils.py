import re
from urllib.parse import quote
from app.models import Cliente, Producto, UnidadMedida

def parsear_mensaje_whatsapp(texto):
    """
    Extrae campos clave de un texto pegado de WhatsApp.
    Ejemplo de mensaje esperado:
        👤 Cliente: Porcimonte
        📦 Productos:
        100 lts de Cleto 24
        20 Halox
        📍 Lugar de entrega: Monte Maiz
        Comentario: Cargar pedido urgente
    """
    resultado = {
        'cliente': None,
        'productos': [],
        'lugar_entrega': None,
        'comentario': None
    }

    if not texto:
        return {
            'parsed_raw': resultado,
            'cliente_sugerido': None,
            'productos_sugeridos': []
        }

    texto = texto.strip()

    # Extraer Cliente
    match_cliente = re.search(r'[👤]?\s*[Cc]liente[:\s]+(.+?)(?:\n|$)', texto)
    if match_cliente:
        resultado['cliente'] = match_cliente.group(1).strip()

    # Extraer Productos y Cantidades
    match_productos = re.search(
        r'[📦]?\s*[Pp]roductos?[:\s]*\n(.*?)(?=\n[📍]|\n[Cc]omentario|\n[Ll]ugar|$)',
        texto,
        re.DOTALL
    )
    if match_productos:
        lineas = match_productos.group(1).strip().split('\n')
        for linea in lineas:
            linea = linea.strip()
            if not linea:
                continue
            # Regex: Cantidad + Unidad opcional + Nombre del Producto
            match_prod = re.match(r'^(\d+(?:[.,]\d+)?)\s*([a-zA-Z]+)?\s*(?:de\s+)?(.+)$', linea, re.IGNORECASE)
            if match_prod:
                resultado['productos'].append({
                    'cantidad': float(match_prod.group(1).replace(',', '.')),
                    'unidad': match_prod.group(2) or 'unidades',
                    'nombre': match_prod.group(3).strip()
                })
            else:
                resultado['productos'].append({
                    'cantidad': 1.0,
                    'unidad': 'unidades',
                    'nombre': linea
                })

    # Extraer Lugar de Entrega
    match_lugar = re.search(r'[📍]?\s*[Ll]ugar\s*(?:de\s*)?[Ee]ntrega[:\s]+(.+?)(?:\n|$)', texto)
    if match_lugar:
        resultado['lugar_entrega'] = match_lugar.group(1).strip()

    # Extraer Comentarios
    match_comentario = re.search(r'[Cc]omentario[:\s]+(.+?)(?:\n|$)', texto, re.DOTALL)
    if match_comentario:
        resultado['comentario'] = match_comentario.group(1).strip()

    # Búsqueda aproximada en la BD para sugerir matches
    cliente_sugerido = None
    if resultado['cliente']:
        cliente_sugerido = Cliente.query.filter(
            Cliente.nombre.ilike(f"%{resultado['cliente']}%")
        ).first()

    productos_sugeridos = []
    for prod in resultado['productos']:
        p_match = Producto.query.filter(
            Producto.nombre.ilike(f"%{prod['nombre']}%")
        ).first()

        u_match = None
        if prod['unidad']:
            u_match = UnidadMedida.query.filter(
                (UnidadMedida.nombre.ilike(f"%{prod['unidad']}%")) |
                (UnidadMedida.abreviatura.ilike(f"%{prod['unidad']}%"))
            ).first()

        productos_sugeridos.append({
            'parsed': prod,
            'match_id': p_match.id if p_match else None,
            'match_nombre': p_match.nombre if p_match else None,
            'match_unidad_id': u_match.id if u_match else None,
            'match_unidad_nombre': u_match.nombre if u_match else None
        })

    return {
        'parsed_raw': resultado,
        'cliente_sugerido': {'id': cliente_sugerido.id, 'nombre': cliente_sugerido.nombre} if cliente_sugerido else None,
        'productos_sugeridos': productos_sugeridos
    }


def obtener_link_google_maps(pedido):
    """
    Genera el enlace a Google Maps según las coordenadas GPS o dirección del cliente.
    """
    if not pedido:
        return None

    # 1. Si el cliente tiene un domicilio marcado con GPS
    if pedido.cliente and pedido.cliente.domicilios:
        for dom in pedido.cliente.domicilios:
            if dom.coord_gps:
                gps_clean = dom.coord_gps.replace(' ', '')
                return f"https://maps.google.com/?q={gps_clean}"

    # 2. Fallback a dirección de texto
    if pedido.lugar_entrega:
        return f"https://www.google.com/maps/search/?api=1&query={quote(pedido.lugar_entrega)}"

    return None


def generar_whatsapp_link_hoja_ruta(viaje):
    """
    Construye el texto consolidado de la Hoja de Ruta para enviar al Chofer por WhatsApp.
    """
    if not viaje or not viaje.chofer or not viaje.chofer.celular:
        return None

    nl = "\n"
    lines = [
        f"🚚 *HOJA DE RUTA: {viaje.codigo_viaje}*",
        f"📅 Fecha: {viaje.fecha_viaje.strftime('%d/%m/%Y') if viaje.fecha_viaje else ''}",
        f"📦 Cantidad Pedidos: {len(viaje.pedidos)}",
        "",
        "------------------------------------",
        ""
    ]

    for i, p in enumerate(viaje.pedidos, 1):
        lines.append(f"*PARADA #{i} - Cliente:* {p.cliente.nombre if p.cliente else 'Sin cliente'}")
        if p.cliente and p.cliente.celular:
            lines.append(f"📱 Tel: {p.cliente.celular}")
        
        # Productos
        lines.append("📦 Items:")
        for item in p.items:
            u = item.unidad_medida.abreviatura if item.unidad_medida else ''
            lines.append(f"   • {item.cantidad} {u} - {item.producto.nombre if item.producto else ''}")
        
        # Dirección & GPS
        maps_link = obtener_link_google_maps(p)
        if maps_link:
            lines.append(f"📍 GPS / Ubicación: {maps_link}")
        elif p.lugar_entrega:
            lines.append(f"📍 Entrega en: {p.lugar_entrega}")

        if p.comentarios:
            lines.append(f"💬 Nota: {p.comentarios}")
        lines.append("")

    if viaje.notas:
        lines.append(f"📝 *Notas Generales del Viaje:* {viaje.notas}")

    texto_completo = nl.join(lines)
    # Limpiar formato de teléfono si contiene caracteres especiales
    celular_clean = re.sub(r'\D', '', viaje.chofer.celular)
    return f"https://wa.me/{celular_clean}?text={quote(texto_completo)}"
