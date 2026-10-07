from datetime import datetime, date, timedelta
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

from flask import g
from flask_sqlalchemy.session import Session as FSASession

class DynamicSession(FSASession):
    def get_bind(self, mapper=None, clause=None, bind=None, **kwargs):
        if hasattr(g, 'session_engine') and g.session_engine is not None:
            return g.session_engine
        return super().get_bind(mapper=mapper, clause=clause, bind=bind, **kwargs)

db = SQLAlchemy(session_options={'class_': DynamicSession})

# =============================================================================
# 1. GEOGRAFÍA Y UBICACIÓN
# =============================================================================

class Provincia(db.Model):
    __tablename__ = 'provincia'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    localidades = db.relationship('Localidad', backref='provincia', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre
        }


class Localidad(db.Model):
    __tablename__ = 'localidad'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    id_provincia = db.Column(db.Integer, db.ForeignKey('provincia.id'), nullable=False)
    domicilios = db.relationship('Domicilio', backref='localidad', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'id_provincia': self.id_provincia,
            'provincia_nombre': self.provincia.nombre if self.provincia else None
        }


class Domicilio(db.Model):
    __tablename__ = 'domicilio'

    id = db.Column(db.Integer, primary_key=True)
    alias = db.Column(db.String(50))  # Ej: "Campo Norte", "Depósito San Martín"
    calle = db.Column(db.String(100))
    numero = db.Column(db.String(20))
    id_localidad = db.Column(db.Integer, db.ForeignKey('localidad.id'), nullable=False)
    coord_gps = db.Column(db.String(100))  # Formato: "lat,lng" (-32.9167,-62.4667)
    es_principal = db.Column(db.Boolean, default=False)
    id_cliente = db.Column(db.Integer, db.ForeignKey('cliente.id'), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'alias': self.alias,
            'calle': self.calle,
            'numero': self.numero,
            'id_localidad': self.id_localidad,
            'localidad_nombre': self.localidad.nombre if self.localidad else None,
            'coord_gps': self.coord_gps,
            'es_principal': self.es_principal,
            'id_cliente': self.id_cliente
        }


# =============================================================================
# 2. CLIENTES
# =============================================================================

class TipoCliente(db.Model):
    __tablename__ = 'tipo_cliente'

    id = db.Column(db.Integer, primary_key=True)
    descripcion = db.Column(db.String(50), nullable=False)
    clientes = db.relationship('Cliente', backref='tipo', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'descripcion': self.descripcion
        }


class Cliente(db.Model):
    __tablename__ = 'cliente'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    celular = db.Column(db.String(50))
    id_tipo = db.Column(db.Integer, db.ForeignKey('tipo_cliente.id'), nullable=False)

    domicilios = db.relationship('Domicilio', backref='cliente', lazy=True, cascade="all, delete-orphan")
    pedidos = db.relationship('Pedido', backref='cliente', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'celular': self.celular,
            'id_tipo': self.id_tipo,
            'tipo_descripcion': self.tipo.descripcion if self.tipo else None,
            'domicilios': [d.to_dict() for d in self.domicilios]
        }


# =============================================================================
# 3. RECURSOS HUMANOS Y TRANSPORTE
# =============================================================================

class Vendedor(db.Model):
    __tablename__ = 'vendedor'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    apellido = db.Column(db.String(100), nullable=False)
    celular = db.Column(db.String(50))
    pedidos = db.relationship('Pedido', backref='vendedor', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'apellido': self.apellido,
            'nombre_completo': f"{self.nombre} {self.apellido}",
            'celular': self.celular
        }


class Chofer(db.Model):
    __tablename__ = 'chofer'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    apellido = db.Column(db.String(100), nullable=False)
    celular = db.Column(db.String(50))

    # Vencimientos Documentación
    vto_licencia = db.Column(db.Date)
    vto_cargas_peligrosas = db.Column(db.Date)
    vto_psicofisico = db.Column(db.Date)

    viajes = db.relationship('Viaje', backref='chofer', lazy=True)

    @property
    def estado_documentacion(self):
        """Devuelve el estado global de alertas de vencimientos."""
        today = date.today()
        threshold = today + timedelta(days=30)
        status = {'global_status': 'success', 'alertas': [], 'avisos': []}

        campos = {
            'vto_licencia': 'Licencia',
            'vto_cargas_peligrosas': 'Cargas P.',
            'vto_psicofisico': 'Psicofísico'
        }
        any_expired = False
        any_warning = False

        for field, label in campos.items():
            val = getattr(self, field)
            if not val:
                continue
            if val < today:
                status['alertas'].append(label)
                any_expired = True
            elif val <= threshold:
                status['avisos'].append(label)
                any_warning = True

        if any_expired:
            status['global_status'] = 'danger'
        elif any_warning:
            status['global_status'] = 'warning'

        return status

    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'apellido': self.apellido,
            'nombre_completo': f"{self.nombre} {self.apellido}",
            'celular': self.celular,
            'vto_licencia': self.vto_licencia.isoformat() if self.vto_licencia else None,
            'vto_cargas_peligrosas': self.vto_cargas_peligrosas.isoformat() if self.vto_cargas_peligrosas else None,
            'vto_psicofisico': self.vto_psicofisico.isoformat() if self.vto_psicofisico else None,
            'estado_documentacion': self.estado_documentacion
        }


class Vehiculo(db.Model):
    __tablename__ = 'vehiculo'

    id = db.Column(db.Integer, primary_key=True)
    patente = db.Column(db.String(20), unique=True, nullable=False)
    modelo = db.Column(db.String(50))
    tipo = db.Column(db.String(50))

    # Vencimientos Documentación
    vto_cedula = db.Column(db.Date)
    vto_rto = db.Column(db.Date)
    vto_seguro = db.Column(db.Date)
    vto_ruta = db.Column(db.Date)

    viajes = db.relationship('Viaje', backref='vehiculo', lazy=True)

    @property
    def estado_documentacion(self):
        today = date.today()
        threshold = today + timedelta(days=30)
        status = {'global_status': 'success', 'alertas': [], 'avisos': []}

        campos = {
            'vto_cedula': 'Cédula',
            'vto_rto': 'ITV/RTO',
            'vto_seguro': 'Seguro',
            'vto_ruta': 'RUTA'
        }
        any_expired = False
        any_warning = False

        for field, label in campos.items():
            val = getattr(self, field)
            if not val:
                continue
            if val < today:
                status['alertas'].append(label)
                any_expired = True
            elif val <= threshold:
                status['avisos'].append(label)
                any_warning = True

        if any_expired:
            status['global_status'] = 'danger'
        elif any_warning:
            status['global_status'] = 'warning'

        return status

    def to_dict(self):
        return {
            'id': self.id,
            'patente': self.patente,
            'modelo': self.modelo,
            'tipo': self.tipo,
            'vto_cedula': self.vto_cedula.isoformat() if self.vto_cedula else None,
            'vto_rto': self.vto_rto.isoformat() if self.vto_rto else None,
            'vto_seguro': self.vto_seguro.isoformat() if self.vto_seguro else None,
            'vto_ruta': self.vto_ruta.isoformat() if self.vto_ruta else None,
            'estado_documentacion': self.estado_documentacion
        }


# =============================================================================
# 4. PRODUCTOS Y UNIDADES
# =============================================================================

class UnidadMedida(db.Model):
    __tablename__ = 'unidad_medida'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50), nullable=False, unique=True)
    abreviatura = db.Column(db.String(10))

    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'abreviatura': self.abreviatura
        }


class Producto(db.Model):
    __tablename__ = 'producto'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.String(200))

    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'descripcion': self.descripcion
        }


# =============================================================================
# 5. NÚCLEO LOGÍSTICO (ESTADOS, VIAJES, PEDIDOS)
# =============================================================================

class Estado(db.Model):
    __tablename__ = 'estado'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50), nullable=False)
    ambito = db.Column(db.String(20), nullable=False)  # 'VIAJE' o 'PEDIDO'
    color = db.Column(db.String(20), default='secondary')
    is_final = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'ambito': self.ambito,
            'color': self.color,
            'is_final': self.is_final
        }


class Viaje(db.Model):
    __tablename__ = 'viaje'

    id = db.Column(db.Integer, primary_key=True)
    codigo_viaje = db.Column(db.String(20), unique=True, nullable=False)  # Autogenerado: V-DDMMYY-XXXX
    fecha_viaje = db.Column(db.DateTime, default=datetime.utcnow)
    notas = db.Column(db.Text)

    id_chofer = db.Column(db.Integer, db.ForeignKey('chofer.id'), nullable=True)
    id_vehiculo = db.Column(db.Integer, db.ForeignKey('vehiculo.id'), nullable=True)
    id_estado = db.Column(db.Integer, db.ForeignKey('estado.id'), nullable=False)

    estado = db.relationship('Estado')
    pedidos = db.relationship('Pedido', backref='viaje', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'codigo_viaje': self.codigo_viaje,
            'fecha_viaje': self.fecha_viaje.isoformat() if self.fecha_viaje else None,
            'notas': self.notas,
            'id_chofer': self.id_chofer,
            'chofer_nombre': f"{self.chofer.nombre} {self.chofer.apellido}" if self.chofer else None,
            'chofer_celular': self.chofer.celular if self.chofer else None,
            'id_vehiculo': self.id_vehiculo,
            'vehiculo_descripcion': f"{self.vehiculo.modelo} ({self.vehiculo.patente})" if self.vehiculo else None,
            'id_estado': self.id_estado,
            'estado_nombre': self.estado.nombre if self.estado else None,
            'estado_color': self.estado.color if self.estado else 'secondary',
            'total_pedidos': len(self.pedidos),
            'pedidos': [p.to_dict() for p in self.pedidos]
        }


class Pedido(db.Model):
    __tablename__ = 'pedido'

    id = db.Column(db.Integer, primary_key=True)
    fecha = db.Column(db.DateTime, default=datetime.utcnow)
    fecha_entrega = db.Column(db.Date, nullable=True)
    comentarios = db.Column(db.Text)
    lugar_entrega = db.Column(db.String(200))  # Referencia libre o domicilio
    tipo_entrega = db.Column(db.String(20), default='Entrega')  # 'Entrega' o 'Retiro'

    id_cliente = db.Column(db.Integer, db.ForeignKey('cliente.id'), nullable=False)
    id_vendedor = db.Column(db.Integer, db.ForeignKey('vendedor.id'), nullable=True)
    id_viaje = db.Column(db.Integer, db.ForeignKey('viaje.id'), nullable=True)
    id_estado = db.Column(db.Integer, db.ForeignKey('estado.id'), nullable=False)

    estado = db.relationship('Estado')
    items = db.relationship('ItemsPedido', backref='pedido', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'fecha': self.fecha.isoformat() if self.fecha else None,
            'fecha_entrega': self.fecha_entrega.isoformat() if self.fecha_entrega else None,
            'comentarios': self.comentarios,
            'lugar_entrega': self.lugar_entrega,
            'tipo_entrega': self.tipo_entrega,
            'id_cliente': self.id_cliente,
            'cliente_nombre': self.cliente.nombre if self.cliente else None,
            'cliente_celular': self.cliente.celular if self.cliente else None,
            'id_vendedor': self.id_vendedor,
            'vendedor_nombre': f"{self.vendedor.nombre} {self.vendedor.apellido}" if self.vendedor else None,
            'id_viaje': self.id_viaje,
            'codigo_viaje': self.viaje.codigo_viaje if self.viaje else None,
            'id_estado': self.id_estado,
            'estado_nombre': self.estado.nombre if self.estado else None,
            'estado_color': self.estado.color if self.estado else 'secondary',
            'items': [item.to_dict() for item in self.items]
        }


class ItemsPedido(db.Model):
    __tablename__ = 'items_pedido'

    id = db.Column(db.Integer, primary_key=True)
    cantidad = db.Column(db.Float, nullable=False)

    id_pedido = db.Column(db.Integer, db.ForeignKey('pedido.id'), nullable=False)
    id_producto = db.Column(db.Integer, db.ForeignKey('producto.id'), nullable=False)
    id_unidad = db.Column(db.Integer, db.ForeignKey('unidad_medida.id'), nullable=True)

    producto = db.relationship('Producto')
    unidad_medida = db.relationship('UnidadMedida')

    def to_dict(self):
        return {
            'id': self.id,
            'cantidad': self.cantidad,
            'id_pedido': self.id_pedido,
            'id_producto': self.id_producto,
            'producto_nombre': self.producto.nombre if self.producto else None,
            'id_unidad': self.id_unidad,
            'unidad_nombre': self.unidad_medida.nombre if self.unidad_medida else None,
            'unidad_abreviatura': self.unidad_medida.abreviatura if self.unidad_medida else ''
        }


# =============================================================================
# 6. USUARIOS Y AUTENTICACIÓN (RBAC)
# =============================================================================

class Usuario(db.Model, UserMixin):
    __tablename__ = 'usuario'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=True)
    password_hash = db.Column(db.String(256), nullable=False)

    # Roles MVP: 'admin', 'logistica', 'vendedor', 'chofer'
    rol = db.Column(db.String(20), nullable=False, default='logistica')

    activo = db.Column(db.Boolean, default=True)
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)
    ultimo_acceso = db.Column(db.DateTime)

    # Vinculaciones opcionales a chofer o vendedor
    id_vendedor = db.Column(db.Integer, db.ForeignKey('vendedor.id'), nullable=True)
    id_chofer = db.Column(db.Integer, db.ForeignKey('chofer.id'), nullable=True)

    vendedor = db.relationship('Vendedor', foreign_keys=[id_vendedor])
    chofer = db.relationship('Chofer', foreign_keys=[id_chofer])

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'rol': self.rol,
            'activo': self.activo,
            'id_vendedor': self.id_vendedor,
            'vendedor_nombre': f"{self.vendedor.nombre} {self.vendedor.apellido}" if self.vendedor else None,
            'id_chofer': self.id_chofer,
            'chofer_nombre': f"{self.chofer.nombre} {self.chofer.apellido}" if self.chofer else None
        }
