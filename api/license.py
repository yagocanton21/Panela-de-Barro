import os
from jose import jwt, JWTError, ExpiredSignatureError

ALGORITHM = "RS256"
ISSUER = "yagocanton"

# Chave pública embutida — usada para verificar licenças sem precisar da chave privada
_PUBLIC_KEY = """-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEApWWSVLY42HmwXhLOP8+l
VpEBLNen9c32IREmfkxrPz+sExmGmK73OY3ZTP8X+YNqxFno9LWbSO4geiONrwqT
u+qzCBwaaOfLlS/exBbFjLCrFlpbxXwtBDeeD0pzEeDwGQ0oWTLDF34Z6/h4o2Kp
AVmSH7Cae/S3jgL+iu8oVKylr7GUsui3gOkLliBvFJpn10HgrntPCw2uKDF1D/Mt
d/Sppio4Gq7PG5N4X7qRLI43ze6CetWkMvBJGv2Q1D7quxUFe9m+3y4UMYuHMyIW
uzcdkn9V7mhrokstbWC8M0m0z/72xBy2DuG3tSLSTeoye6VQ26Ktbi637B9FLQbl
UwIDAQAB
-----END PUBLIC KEY-----"""


def validate_license() -> None:
    """Valida LICENSE_KEY no startup. Levanta RuntimeError se inválida ou ausente."""
    token = os.getenv("LICENSE_KEY")
    if not token:
        raise RuntimeError("LICENSE_KEY não definida. Sistema não autorizado a iniciar.")

    try:
        payload = jwt.decode(token, _PUBLIC_KEY, algorithms=[ALGORITHM], issuer=ISSUER)
    except ExpiredSignatureError:
        raise RuntimeError("Licença expirada. Contate o administrador para renovação.")
    except JWTError as e:
        raise RuntimeError(f"Licença inválida: {e}")

    client = payload.get("client", "desconhecido")
    import logging
    logging.getLogger(__name__).info(f"Licença válida — cliente: {client}")
