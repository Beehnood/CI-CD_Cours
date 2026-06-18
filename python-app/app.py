import os
import secrets
import time
from datetime import date

from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import mysql.connector
from mysql.connector import Error
from pydantic import BaseModel, EmailStr

MYSQL_HOST = os.getenv("MYSQL_HOST", "db")
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "7654321")
MYSQL_DATABASE = os.getenv("MYSQL_DATABASE", "ynov_ci")
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")
ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "change-this-admin-token")


class UserCreate(BaseModel):
    nom: str
    prenom: str
    email: EmailStr
    date_naissance: date
    pays: str = "France"
    ville: str
    code_postal: str
    telephone: str
    nombre_achat: int = 0


class AdminLogin(BaseModel):
    username: str
    password: str


def require_admin(authorization: str | None = Header(default=None)):
    expected_authorization = f"Bearer {ADMIN_TOKEN}"
    if authorization is None or not secrets.compare_digest(
        authorization,
        expected_authorization,
    ):
        raise HTTPException(status_code=401, detail="Acces admin requis")


def connect_with_retry():
    for attempt in range(1, 11):
        try:
            connection = mysql.connector.connect(
                host=MYSQL_HOST,
                user=MYSQL_USER,
                password=MYSQL_PASSWORD,
                database=MYSQL_DATABASE,
            )
            print("Connexion MySQL reussie.")
            return connection
        except Error as error:
            print(f"Tentative {attempt}/10 : MySQL pas encore pret ({error})")
            time.sleep(3)

    raise RuntimeError("Impossible de se connecter a MySQL.")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "API python fonctionne"}


@app.get("/health")
def health():
    try:
        connection = connect_with_retry()
        cursor = connection.cursor()
        cursor.execute("SELECT 1")
        cursor.fetchone()
        cursor.close()
        connection.close()
    except Exception as error:
        raise HTTPException(status_code=503, detail="MySQL indisponible") from error

    return {"status": "healthy"}


@app.get("/users/count")
def count_users():
    connection = connect_with_retry()
    cursor = connection.cursor()

    cursor.execute("SELECT COUNT(*) FROM utilisateur")
    result = cursor.fetchone()

    cursor.close()
    connection.close()

    return {"nombre_utilisateurs": result[0]}


@app.get("/users")
def list_users():
    connection = connect_with_retry()
    cursor = connection.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT
            id,
            nom,
            prenom,
            ville
        FROM utilisateur
        ORDER BY id
        """
    )
    users = cursor.fetchall()

    cursor.close()
    connection.close()

    return {"utilisateurs": users}


@app.post("/users", status_code=201)
def create_user(user: UserCreate):
    connection = connect_with_retry()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(
            """
            INSERT INTO utilisateur
                (
                    nom,
                    prenom,
                    email,
                    date_naissance,
                    pays,
                    ville,
                    code_postal,
                    telephone,
                    nombre_achat
                )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                user.nom,
                user.prenom,
                user.email,
                user.date_naissance,
                user.pays,
                user.ville,
                user.code_postal,
                user.telephone,
                user.nombre_achat,
            ),
        )
        connection.commit()
        user_id = cursor.lastrowid

        cursor.execute(
            """
            SELECT
                id,
                nom,
                prenom,
                ville
            FROM utilisateur
            WHERE id = %s
            """,
            (user_id,),
        )
        created_user = cursor.fetchone()
    except Error as error:
        connection.rollback()
        raise HTTPException(
            status_code=500,
            detail="Impossible de creer l'utilisateur",
        ) from error
    finally:
        cursor.close()
        connection.close()

    return {"utilisateur": created_user}


@app.post("/admin/login")
def admin_login(credentials: AdminLogin):
    username_matches = secrets.compare_digest(
        credentials.username,
        ADMIN_USERNAME,
    )
    password_matches = secrets.compare_digest(
        credentials.password,
        ADMIN_PASSWORD,
    )

    if not username_matches or not password_matches:
        raise HTTPException(status_code=401, detail="Identifiants invalides")

    return {"token": ADMIN_TOKEN}


@app.get("/admin/users/{user_id}")
def get_private_user(
    user_id: int,
    authorization: str | None = Header(default=None),
):
    require_admin(authorization)
    connection = connect_with_retry()
    cursor = connection.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT
            id,
            nom,
            prenom,
            email,
            date_naissance,
            pays,
            ville,
            code_postal,
            telephone,
            nombre_achat
        FROM utilisateur
        WHERE id = %s
        """,
        (user_id,),
    )
    user = cursor.fetchone()

    cursor.close()
    connection.close()

    if user is None:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")

    return {"utilisateur": user}


@app.delete("/admin/users/{user_id}", status_code=204)
def delete_user(
    user_id: int,
    authorization: str | None = Header(default=None),
):
    require_admin(authorization)
    connection = connect_with_retry()
    cursor = connection.cursor()

    cursor.execute("DELETE FROM utilisateur WHERE id = %s", (user_id,))
    deleted_count = cursor.rowcount
    connection.commit()

    cursor.close()
    connection.close()

    if deleted_count == 0:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
