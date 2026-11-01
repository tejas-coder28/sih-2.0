from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from .config import settings

# Normalize database URL for PostgreSQL drivers (SQLAlchemy 2.x compatibility)
db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql+psycopg2://", 1)
elif db_url.startswith("postgresql://") and not db_url.startswith("postgresql+"):
    db_url = db_url.replace("postgresql://", "postgresql+psycopg2://", 1)

# Configure SQLite check_same_thread if using sqlite
connect_args = {}
if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    db_url,
    connect_args=connect_args,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def ensure_document_ocr_columns(eng):
    try:
        with eng.connect() as conn:
            for col_name, col_def in [
                ("ocr_engine", "VARCHAR(100) DEFAULT 'PyMuPDF text layer'"),
                ("ocr_language", "VARCHAR(50) DEFAULT 'eng'"),
                ("ocr_mean_confidence", "FLOAT DEFAULT 0.98"),
                ("page_count", "INTEGER DEFAULT 1"),
                ("ocr_source_layer", "VARCHAR(50) DEFAULT 'text_layer'")
            ]:
                try:
                    conn.execute(text(f"ALTER TABLE documents ADD COLUMN {col_name} {col_def}"))
                    conn.commit()
                except Exception:
                    pass
    except Exception:
        pass

ensure_document_ocr_columns(engine)
