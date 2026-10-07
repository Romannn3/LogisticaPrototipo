import os
import re
import time
import shutil
import logging
from sqlalchemy import create_engine

logger = logging.getLogger(__name__)

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
MASTER_DB_PATH = os.path.join(BASE_DIR, 'agrologistica.db')
SESSIONS_DIR = os.path.join(BASE_DIR, 'instance', 'demo_sessions')

os.makedirs(SESSIONS_DIR, exist_ok=True)

# Cache de engines {session_id: Engine}
_ENGINES_CACHE = {}

def sanitize_session_id(raw_id: str) -> str:
    """Sanitiza el session_id para prevenir Path Traversal o nombres inválidos."""
    if not raw_id or not isinstance(raw_id, str):
        return 'default'
    # Solo caracteres alfanuméricos, guiones y guiones bajos (máximo 64 chars)
    clean = re.sub(r'[^a-zA-Z0-9_\-]', '', raw_id)
    return clean[:64] if clean else 'default'

def get_session_db_path(session_id: str) -> str:
    safe_id = sanitize_session_id(session_id)
    return os.path.join(SESSIONS_DIR, f"{safe_id}.db")

def get_session_engine(session_id: str):
    """Obtiene o crea un SQLite Engine exclusivo para la sesión de demostración."""
    safe_id = sanitize_session_id(session_id)
    
    if safe_id not in _ENGINES_CACHE:
        db_path = get_session_db_path(safe_id)
        
        # Si la base de datos de la sesión no existe, clonar la master seed
        if not os.path.exists(db_path):
            if os.path.exists(MASTER_DB_PATH):
                shutil.copyfile(MASTER_DB_PATH, db_path)
                logger.info(f"✨ [Session Sandbox] Creada nueva BD aislada para sesión '{safe_id}'")
            else:
                logger.warning(f"⚠️ [Session Sandbox] Master DB no encontrada en {MASTER_DB_PATH}, usando base en blanco.")

        # Engine SQLite con check_same_thread=False para admitir Flask threads
        _ENGINES_CACHE[safe_id] = create_engine(
            f"sqlite:///{db_path}",
            connect_args={"check_same_thread": False}
        )

    return _ENGINES_CACHE[safe_id]

def reset_session_db(session_id: str) -> bool:
    """Restaura la base de datos de una sesión clonando nuevamente la base original."""
    safe_id = sanitize_session_id(session_id)
    db_path = get_session_db_path(safe_id)

    # Disponer el engine si está en cache
    if safe_id in _ENGINES_CACHE:
        try:
            _ENGINES_CACHE[safe_id].dispose()
        except Exception as e:
            logger.error(f"Error disponiendo engine para {safe_id}: {e}")
        del _ENGINES_CACHE[safe_id]

    # Reemplazar archivo
    try:
        if os.path.exists(db_path):
            os.remove(db_path)
        if os.path.exists(MASTER_DB_PATH):
            shutil.copyfile(MASTER_DB_PATH, db_path)
            logger.info(f"🔄 [Session Sandbox] Sesión '{safe_id}' restablecida con datos iniciales.")
            return True
    except Exception as e:
        logger.error(f"Error reseteando sesión {safe_id}: {e}")
    return False

def cleanup_expired_sessions(max_age_hours: int = 24):
    """Elimina bases de datos de sesiones inactivas por más de max_age_hours."""
    now = time.time()
    max_age_seconds = max_age_hours * 3600
    try:
        for fname in os.listdir(SESSIONS_DIR):
            if fname.endswith('.db'):
                fpath = os.path.join(SESSIONS_DIR, fname)
                if now - os.path.getmtime(fpath) > max_age_seconds:
                    safe_id = fname[:-3]
                    if safe_id in _ENGINES_CACHE:
                        try:
                            _ENGINES_CACHE[safe_id].dispose()
                            del _ENGINES_CACHE[safe_id]
                        except Exception:
                            pass
                    try:
                        os.remove(fpath)
                    except Exception:
                        pass
    except Exception as e:
        logger.error(f"Error en cleanup de sesiones: {e}")
