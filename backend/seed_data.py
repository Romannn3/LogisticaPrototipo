from datetime import datetime, date, timedelta
from app import create_app, db
from app.models import (
    Provincia, Localidad, Domicilio, TipoCliente, Cliente,
    Vendedor, Chofer, Vehiculo, UnidadMedida, Producto,
    Estado, Viaje, Pedido, ItemsPedido, Usuario
)

def seed():
    app = create_app()
    with app.app_context():
        print("[PrototipoLogistico] Recreando base de datos con datos genericos y escenarios MVP...")
        db.drop_all()
        db.create_all()

        # 1. ESTADOS
        estados_data = [
            # Ámbito PEDIDO
            Estado(id=1, nombre='Solicitado', ambito='PEDIDO', color='warning'),
            Estado(id=2, nombre='Aprobado', ambito='PEDIDO', color='info'),
            Estado(id=3, nombre='En Ruta', ambito='PEDIDO', color='primary'),
            Estado(id=4, nombre='Entregado', ambito='PEDIDO', color='success', is_final=True),
            Estado(id=5, nombre='Rechazado', ambito='PEDIDO', color='danger', is_final=True),
            
            # Ámbito VIAJE
            Estado(id=6, nombre='Borrador', ambito='VIAJE', color='secondary'),
            Estado(id=7, nombre='Pendiente', ambito='VIAJE', color='info'),
            Estado(id=8, nombre='En Curso', ambito='VIAJE', color='primary'),
            Estado(id=9, nombre='Finalizado', ambito='VIAJE', color='success', is_final=True),
            Estado(id=10, nombre='Cancelado', ambito='VIAJE', color='danger', is_final=True)
        ]
        db.session.add_all(estados_data)

        # 2. GEOGRAFÍA (Coordenadas del centro geográfico urbano de cada ciudad)
        p_cba = Provincia(nombre='Córdoba')
        p_sf = Provincia(nombre='Santa Fe')
        p_ba = Provincia(nombre='Buenos Aires')
        db.session.add_all([p_cba, p_sf, p_ba])
        db.session.flush()

        loc1 = Localidad(nombre='Córdoba Centro', provincia=p_cba)
        loc2 = Localidad(nombre='Villa María', provincia=p_cba)
        loc3 = Localidad(nombre='Rosario', provincia=p_sf)
        loc4 = Localidad(nombre='Pergamino', provincia=p_ba)
        db.session.add_all([loc1, loc2, loc3, loc4])
        db.session.flush()

        # 3. CLIENTES & DOMICILIOS GENÉRICOS
        tc1 = TipoCliente(descripcion='Distribuidor Regional')
        tc2 = TipoCliente(descripcion='Productor Agropecuario')
        tc3 = TipoCliente(descripcion='Centro de Acopio')
        db.session.add_all([tc1, tc2, tc3])
        db.session.flush()

        cli1 = Cliente(nombre='Empresa Distribuidora A', celular='5493534000101', tipo=tc1)
        cli2 = Cliente(nombre='Productor Agropecuario B', celular='5493534000102', tipo=tc2)
        cli3 = Cliente(nombre='Establecimiento Agrícola C', celular='5493415000103', tipo=tc2)
        cli4 = Cliente(nombre='Centro de Acopio D', celular='5492477000104', tipo=tc3)
        db.session.add_all([cli1, cli2, cli3, cli4])
        db.session.flush()

        dom1 = Domicilio(
            alias='Planta Central Córdoba',
            calle='Av. Central',
            numero='100',
            localidad=loc1,
            coord_gps='-31.4135,-64.1811',  # Centro de Córdoba
            es_principal=True,
            cliente=cli1
        )
        dom2 = Domicilio(
            alias='Depósito Villa María',
            calle='Av. Principal',
            numero='500',
            localidad=loc2,
            coord_gps='-32.4075,-63.2402',  # Centro de Villa María
            es_principal=True,
            cliente=cli2
        )
        dom3 = Domicilio(
            alias='Base Rosario',
            calle='Av. Puerto',
            numero='1200',
            localidad=loc3,
            coord_gps='-32.9468,-60.6393',  # Centro de Rosario
            es_principal=True,
            cliente=cli3
        )
        dom4 = Domicilio(
            alias='Acopio Pergamino',
            calle='Ruta Nacional',
            numero='Km 220',
            localidad=loc4,
            coord_gps='-33.8942,-60.5736',  # Centro de Pergamino
            es_principal=True,
            cliente=cli4
        )
        db.session.add_all([dom1, dom2, dom3, dom4])

        # 4. RECURSOS HUMANOS GENÉRICOS (Vendedores y Choferes)
        vend1 = Vendedor(nombre='Vendedor', apellido='Uno', celular='5493534000201')
        vend2 = Vendedor(nombre='Vendedor', apellido='Dos', celular='5493534000202')
        db.session.add_all([vend1, vend2])

        today = date.today()

        # Chofer 1: Documentación al día
        chof1 = Chofer(
            nombre='Chofer',
            apellido='Uno',
            celular='5493534000301',
            vto_licencia=today + timedelta(days=180),
            vto_cargas_peligrosas=today + timedelta(days=210),
            vto_psicofisico=today + timedelta(days=150)
        )
        # Chofer 2: Con licencia por vencer en breve (15 días -> Alerta Warning)
        chof2 = Chofer(
            nombre='Chofer',
            apellido='Dos',
            celular='5493534000302',
            vto_licencia=today + timedelta(days=15),
            vto_cargas_peligrosas=today + timedelta(days=90),
            vto_psicofisico=today + timedelta(days=120)
        )
        # Chofer 3: Con psicofísico vencido (-5 días -> Alerta Danger)
        chof3 = Chofer(
            nombre='Chofer',
            apellido='Tres',
            celular='5493534000303',
            vto_licencia=today + timedelta(days=120),
            vto_cargas_peligrosas=today + timedelta(days=140),
            vto_psicofisico=today - timedelta(days=5)
        )
        db.session.add_all([chof1, chof2, chof3])

        # 5. VEHÍCULOS GENÉRICOS
        # Vehículo 1: Al día
        veh1 = Vehiculo(
            patente='AA001AA',
            modelo='Camión Chasis 01',
            tipo='Camión Rígido',
            vto_cedula=today + timedelta(days=200),
            vto_rto=today + timedelta(days=90),
            vto_seguro=today + timedelta(days=60),
            vto_ruta=today + timedelta(days=120)
        )
        # Vehículo 2: Seguro por vencer (10 días -> Alerta Warning)
        veh2 = Vehiculo(
            patente='AB002BB',
            modelo='Tractor Semi 02',
            tipo='Tractor Semi-Remolque',
            vto_cedula=today + timedelta(days=150),
            vto_rto=today + timedelta(days=80),
            vto_seguro=today + timedelta(days=10),
            vto_ruta=today + timedelta(days=110)
        )
        # Vehículo 3: RTO Vencido (-2 días -> Alerta Danger)
        veh3 = Vehiculo(
            patente='AC003CC',
            modelo='Camión Utilitario 03',
            tipo='Furgón Carga',
            vto_cedula=today + timedelta(days=100),
            vto_rto=today - timedelta(days=2),
            vto_seguro=today + timedelta(days=45),
            vto_ruta=today + timedelta(days=90)
        )
        db.session.add_all([veh1, veh2, veh3])

        # 6. CATÁLOGO DE PRODUCTOS Y UNIDADES
        u_lts = UnidadMedida(nombre='Litros', abreviatura='lts')
        u_kg = UnidadMedida(nombre='Kilogramos', abreviatura='kg')
        u_bolsas = UnidadMedida(nombre='Bolsas', abreviatura='bolsas')
        u_pallets = UnidadMedida(nombre='Pallets', abreviatura='pallets')
        db.session.add_all([u_lts, u_kg, u_bolsas, u_pallets])
        db.session.flush()

        p1 = Producto(nombre='Insumo Agroquímico A', descripcion='Fórmula concentrada bidón 20L')
        p2 = Producto(nombre='Fertilizante Granulado B', descripcion='Fertilizante nitrogenado bolsa 50kg')
        p3 = Producto(nombre='Semilla Seleccionada C', descripcion='Semilla tratada bolsa 40kg')
        p4 = Producto(nombre='Protector de Cultivo D', descripcion='Protector de follaje bidón 10L')
        db.session.add_all([p1, p2, p3, p4])
        db.session.flush()

        # 7. USUARIOS (RBAC)
        u_admin = Usuario(username='admin', email='admin@prototipo.com', rol='admin')
        u_admin.set_password('admin123')

        u_logistica = Usuario(username='logistica', email='logistica@prototipo.com', rol='logistica')
        u_logistica.set_password('logistica123')

        u_vendedor = Usuario(username='vendedor1', email='vendedor1@prototipo.com', rol='vendedor', id_vendedor=vend1.id)
        u_vendedor.set_password('vendedor123')

        u_chofer = Usuario(username='chofer1', email='chofer1@prototipo.com', rol='chofer', id_chofer=chof1.id)
        u_chofer.set_password('chofer123')

        db.session.add_all([u_admin, u_logistica, u_vendedor, u_chofer])
        db.session.flush()

        # 8. PEDIDOS DE PRUEBA (Cubriendo todos los estados de pedido)
        # Pedido 1: Solicitado (Ingresado por Vendedor Uno)
        ped1 = Pedido(
            fecha=datetime.utcnow() - timedelta(hours=3),
            fecha_entrega=date.today() + timedelta(days=1),
            comentarios='Solicitud enviada por vendedor, pendiente de viaje',
            lugar_entrega='Villa María Centro - Depósito Villa María',
            tipo_entrega='Entrega',
            id_cliente=cli2.id,
            id_vendedor=vend1.id,
            id_estado=1  # Solicitado
        )
        db.session.add(ped1)
        db.session.flush()
        db.session.add(ItemsPedido(pedido=ped1, producto=p2, cantidad=40.0, unidad_medida=u_bolsas))

        # Pedido 2: Aprobado (Ingresado por Logística, sin viaje asignado)
        ped2 = Pedido(
            fecha=datetime.utcnow() - timedelta(hours=1),
            fecha_entrega=date.today(),
            comentarios='Carga aprobada por logística, lista para asignar a viaje',
            lugar_entrega='Rosario Centro - Base Rosario',
            tipo_entrega='Entrega',
            id_cliente=cli3.id,
            id_vendedor=vend2.id,
            id_estado=2  # Aprobado
        )
        db.session.add(ped2)
        db.session.flush()
        db.session.add(ItemsPedido(pedido=ped2, producto=p3, cantidad=25.0, unidad_medida=u_bolsas))

        # Pedidos 3 y 4: En Ruta (Asignados a Viaje 1 "En Curso")
        ped3 = Pedido(
            fecha=datetime.utcnow() - timedelta(hours=8),
            fecha_entrega=date.today(),
            comentarios='Prioridad de entrega mañana por la mañana',
            lugar_entrega='Córdoba Centro - Planta Central Córdoba',
            tipo_entrega='Entrega',
            id_cliente=cli1.id,
            id_vendedor=vend1.id,
            id_estado=3  # En Ruta
        )
        ped4 = Pedido(
            fecha=datetime.utcnow() - timedelta(hours=6),
            fecha_entrega=date.today(),
            comentarios='Descargar en rampa principal de acopio',
            lugar_entrega='Pergamino Centro - Acopio Pergamino',
            tipo_entrega='Entrega',
            id_cliente=cli4.id,
            id_vendedor=vend2.id,
            id_estado=3  # En Ruta
        )
        db.session.add_all([ped3, ped4])
        db.session.flush()
        db.session.add(ItemsPedido(pedido=ped3, producto=p1, cantidad=100.0, unidad_medida=u_lts))
        db.session.add(ItemsPedido(pedido=ped4, producto=p4, cantidad=50.0, unidad_medida=u_lts))

        # Pedido 5: Entregado (Asignado a Viaje 2 "Finalizado")
        ped5 = Pedido(
            fecha=datetime.utcnow() - timedelta(days=2),
            fecha_entrega=date.today() - timedelta(days=1),
            comentarios='Entrega recibida conforme y firmada',
            lugar_entrega='Córdoba Centro - Planta Central Córdoba',
            tipo_entrega='Entrega',
            id_cliente=cli1.id,
            id_vendedor=vend1.id,
            id_estado=4  # Entregado
        )
        db.session.add(ped5)
        db.session.flush()
        db.session.add(ItemsPedido(pedido=ped5, producto=p2, cantidad=10.0, unidad_medida=u_bolsas))

        # Pedido 6: Rechazado
        ped6 = Pedido(
            fecha=datetime.utcnow() - timedelta(days=3),
            fecha_entrega=date.today() - timedelta(days=2),
            comentarios='Solicitud cancelada por falta de stock temporal',
            lugar_entrega='Rosario Centro - Base Rosario',
            tipo_entrega='Entrega',
            id_cliente=cli3.id,
            id_vendedor=vend2.id,
            id_estado=5  # Rechazado
        )
        db.session.add(ped6)
        db.session.flush()
        db.session.add(ItemsPedido(pedido=ped6, producto=p1, cantidad=200.0, unidad_medida=u_lts))

        # 9. VIAJES DE PRUEBA (Cubriendo todos los estados de viaje)
        # Viaje 1: En Curso (Asignado a Chofer Uno y Vehículo 1)
        cod_v1 = f"V-{date.today().strftime('%d%m%y')}-0001"
        viaje1 = Viaje(
            codigo_viaje=cod_v1,
            fecha_viaje=datetime.now(),
            notas='Viaje principal en trayecto centro de Córdoba y Pergamino',
            id_chofer=chof1.id,
            id_vehiculo=veh1.id,
            id_estado=8  # En Curso
        )
        db.session.add(viaje1)
        db.session.flush()

        ped3.id_viaje = viaje1.id
        ped4.id_viaje = viaje1.id

        # Viaje 2: Finalizado
        cod_v2 = f"V-{(date.today() - timedelta(days=1)).strftime('%d%m%y')}-0002"
        viaje2 = Viaje(
            codigo_viaje=cod_v2,
            fecha_viaje=datetime.now() - timedelta(days=1),
            notas='Hoja de Ruta completada con éxito',
            id_chofer=chof2.id,
            id_vehiculo=veh2.id,
            id_estado=9  # Finalizado
        )
        db.session.add(viaje2)
        db.session.flush()

        ped5.id_viaje = viaje2.id

        # Viaje 3: Borrador
        cod_v3 = f"V-{date.today().strftime('%d%m%y')}-0003"
        viaje3 = Viaje(
            codigo_viaje=cod_v3,
            fecha_viaje=datetime.now() + timedelta(days=1),
            notas='Borrador de hoja de ruta para planificar entregas del fin de semana',
            id_chofer=chof1.id,
            id_vehiculo=veh1.id,
            id_estado=6  # Borrador
        )
        db.session.add(viaje3)

        # Viaje 4: Pendiente
        cod_v4 = f"V-{date.today().strftime('%d%m%y')}-0004"
        viaje4 = Viaje(
            codigo_viaje=cod_v4,
            fecha_viaje=datetime.now() + timedelta(days=2),
            notas='Hoja de ruta programada y confirmada, lista para salir',
            id_chofer=chof2.id,
            id_vehiculo=veh2.id,
            id_estado=7  # Pendiente
        )
        db.session.add(viaje4)

        db.session.commit()
        print("[PrototipoLogistico] Base de datos poblada exitosamente con datos genericos y todos los escenarios MVP.")

if __name__ == '__main__':
    seed()

