"""add type to categories and make category optional

Revision ID: a1b2c3d4e5f6
Revises: 4fd5cb92c70e
Create Date: 2025-11-02 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = '4fd5cb92c70e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add type column to categories table
    op.add_column('categories', sa.Column('type', sa.String(), nullable=True))

    # Set default type for existing categories to 'expense'
    op.execute("UPDATE categories SET type = 'expense' WHERE type IS NULL")

    # Make type column non-nullable after setting defaults
    op.alter_column('categories', 'type', nullable=False)

    # Drop the unique constraint on category name (if it exists)
    # This allows same name for different types (e.g., "Transfer" for both income and expense)
    try:
        op.drop_index('ix_categories_name', table_name='categories')
    except:
        pass  # Index might not exist or already dropped

    # Recreate index without unique constraint
    op.create_index(op.f('ix_categories_name'), 'categories', ['name'], unique=False)

    # Note: category_id in transactions is already nullable in the initial migration
    # If it wasn't, we would add:
    # op.alter_column('transactions', 'category_id', nullable=True)


def downgrade() -> None:
    """Downgrade schema."""
    # Remove the type column from categories
    op.drop_column('categories', 'type')

    # Recreate unique index on category name
    op.drop_index(op.f('ix_categories_name'), table_name='categories')
    op.create_index('ix_categories_name', 'categories', ['name'], unique=True)
