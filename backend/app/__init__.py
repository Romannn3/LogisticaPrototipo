from flask import Flask, request, g
from flask_cors import CORS
from flask_login import LoginManager
from app.models import db, Usuario
import logging

login_manager = LoginManager()

@login_manager.user_loader
def load_user(user_id):
    return Usuario.query.get(int(user_id))

import os
from app.session_manager import get_session_engine

def create_app():
    app = Flask(__name__)
    app.config.from_object('config.Config')

    # Configurar logging visible para peticiones API
    logging.basicConfig(level=logging.INFO)
    
    # Habilitar CORS amplio para demostración y despliegue público
    allowed_origins = os.environ.get('ALLOWED_ORIGINS')
    if allowed_origins:
        origins = [o.strip() for o in allowed_origins.split(',')]
    else:
        origins = [
            "http://localhost:5173", 
            "http://localhost:3000", 
            "http://127.0.0.1:5173",
            r"https?://.*"
        ]

    CORS(app, supports_credentials=True, origins=origins)

    @app.before_request
    def handle_demo_session_and_logging():
        # Aislar datos de BD por X-Session-Id (o cookie fallback)
        session_id = request.headers.get('X-Session-Id') or request.cookies.get('demo_session_id') or 'default'
        g.session_id = session_id
        g.session_engine = get_session_engine(session_id)
        
        app.logger.info(f"👉 [API REST] [{session_id[:12]}] {request.method} {request.path} | Query: {dict(request.args)}")

    @app.teardown_appcontext
    def shutdown_session(exception=None):
        db.session.remove()

    db.init_app(app)
    login_manager.init_app(app)

    # Registrar Blueprints de la API
    from app.api.auth_routes import auth_api
    from app.api.pedidos_routes import pedidos_api
    from app.api.viajes_routes import viajes_api
    from app.api.recursos_routes import recursos_api

    app.register_blueprint(auth_api, url_prefix='/api/auth')
    app.register_blueprint(pedidos_api, url_prefix='/api/pedidos')
    app.register_blueprint(viajes_api, url_prefix='/api/viajes')
    app.register_blueprint(recursos_api, url_prefix='/api/recursos')

    @app.route('/')
    def root_health():
        return {"status": "ok", "app": "PrototipoLogistico API"}, 200

    return app
