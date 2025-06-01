# alembic/env.py

# This file is executed every time Alembic runs a command.
# It sets up the environment for migrations.

from __future__ import with_statement # Keep this at the very top for compatibility

from alembic import context
from sqlalchemy import engine_from_config, pool # Import engine_from_config and pool
from logging.config import fileConfig

# --- NEW IMPORTS ---
# Import your application's Base (SQLAlchemy declarative base) and settings.
# This makes your database configuration and models available to Alembic.
from finance_app_backend.database import Base # Your SQLAlchemy declarative base
from finance_app_backend.config import settings # Your Pydantic settings object

# Import your models module to ensure Alembic discovers all your tables.
# This is crucial for 'autogenerate' to work correctly.
from finance_app_backend import models # Essential: ensures all models are loaded and registered with Base.metadata
# --- END NEW IMPORTS ---


# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
# target_metadata = myapp.mymodel.Base.metadata
target_metadata = Base.metadata # <--- MODIFIED: Point to your application's Base.metadata

# other values from the config, defined by the needs of env.py,
# can be acquired here.
# For example: my_important_option = config.get_main_option("my_important_option")


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine. Calls to context.execute() here
    emit the given string to the script output.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.
    """
    # --- MODIFIED: Get DATABASE_URL from your application's settings ---
    # This allows Alembic to connect using the same database URL that your
    # FastAPI application uses (loaded from your .env file).
    connectable = engine_from_config(
        {"sqlalchemy.url": settings.DATABASE_URL}, # Use settings.DATABASE_URL here
        prefix="sqlalchemy.",
        poolclass=pool.NullPool, # Use NullPool for migrations to avoid connection pool issues
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()