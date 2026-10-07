from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, current_user, login_required
from app.models import Usuario

auth_api = Blueprint('auth_api', __name__)

@auth_api.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')

    if not username:
        return jsonify({'success': False, 'message': 'El campo username es requerido'}), 400

    user = Usuario.query.filter_by(username=username).first()

    if user and (user.check_password(password) if password else True):
        login_user(user)
        return jsonify({
            'success': True,
            'user': user.to_dict()
        })

    return jsonify({'success': False, 'message': 'Credenciales inválidas'}), 401


@auth_api.route('/me', methods=['GET'])
def get_current_user():
    if current_user.is_authenticated:
        return jsonify({
            'authenticated': True,
            'user': current_user.to_dict()
        })
    # Devuelve el primer usuario admin como fallback o estado no autenticado
    first_user = Usuario.query.first()
    return jsonify({
        'authenticated': False,
        'user': first_user.to_dict() if first_user else None
    })


@auth_api.route('/users', methods=['GET'])
def list_users():
    users = Usuario.query.filter_by(activo=True).all()
    return jsonify({
        'success': True,
        'users': [u.to_dict() for u in users]
    })


@auth_api.route('/switch-role/<int:user_id>', methods=['POST'])
def switch_user(user_id):
    user = Usuario.query.get_or_404(user_id)
    login_user(user)
    return jsonify({
        'success': True,
        'user': user.to_dict()
    })


@auth_api.route('/logout', methods=['POST'])
def logout():
    logout_user()
    return jsonify({'success': True, 'message': 'Sesión cerrada exitosamente'})


@auth_api.route('/reset-demo', methods=['POST'])
def reset_demo():
    from flask import g
    from app.session_manager import reset_session_db
    session_id = request.headers.get('X-Session-Id') or getattr(g, 'session_id', 'default')
    success = reset_session_db(session_id)
    return jsonify({
        'success': success,
        'message': 'Base de datos de tu sesión restablecida al estado original de prueba.'
    })
