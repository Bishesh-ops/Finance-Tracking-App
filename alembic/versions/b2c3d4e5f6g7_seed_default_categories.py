"""seed default categories

Revision ID: b2c3d4e5f6g7
Revises: a1b2c3d4e5f6
Create Date: 2025-11-02 12:05:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import table, column


# revision identifiers, used by Alembic.
revision: str = 'b2c3d4e5f6g7'
down_revision: Union[str, None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Seed default categories."""

    # Define a table representation for inserting data
    categories = table('categories',
        column('name', sa.String),
        column('type', sa.String)
    )

    # Default expense categories
    expense_categories = [
        {'name': 'Housing', 'type': 'expense'},
        {'name': 'Groceries', 'type': 'expense'},
        {'name': 'Dining Out', 'type': 'expense'},
        {'name': 'Transportation', 'type': 'expense'},
        {'name': 'Utilities', 'type': 'expense'},
        {'name': 'Entertainment', 'type': 'expense'},
        {'name': 'Shopping', 'type': 'expense'},
        {'name': 'Healthcare', 'type': 'expense'},
        {'name': 'Education', 'type': 'expense'},
        {'name': 'Personal Care', 'type': 'expense'},
        {'name': 'Insurance', 'type': 'expense'},
        {'name': 'Gifts & Donations', 'type': 'expense'},
        {'name': 'Travel', 'type': 'expense'},
        {'name': 'Subscriptions', 'type': 'expense'},
        {'name': 'Other Expense', 'type': 'expense'},
    ]

    # Default income categories
    income_categories = [
        {'name': 'Salary', 'type': 'income'},
        {'name': 'Freelance', 'type': 'income'},
        {'name': 'Investment Returns', 'type': 'income'},
        {'name': 'Gifts Received', 'type': 'income'},
        {'name': 'Refunds', 'type': 'income'},
        {'name': 'Rental Income', 'type': 'income'},
        {'name': 'Business Income', 'type': 'income'},
        {'name': 'Bonus', 'type': 'income'},
        {'name': 'Other Income', 'type': 'income'},
    ]

    # Categories that work for both
    both_categories = [
        {'name': 'Transfer', 'type': 'both'},
    ]

    # Insert all categories
    op.bulk_insert(categories, expense_categories + income_categories + both_categories)


def downgrade() -> None:
    """Remove seeded categories."""
    # Remove only the default categories we added
    default_category_names = [
        'Housing', 'Groceries', 'Dining Out', 'Transportation', 'Utilities',
        'Entertainment', 'Shopping', 'Healthcare', 'Education', 'Personal Care',
        'Insurance', 'Gifts & Donations', 'Travel', 'Subscriptions', 'Other Expense',
        'Salary', 'Freelance', 'Investment Returns', 'Gifts Received', 'Refunds',
        'Rental Income', 'Business Income', 'Bonus', 'Other Income', 'Transfer'
    ]

    for name in default_category_names:
        op.execute(f"DELETE FROM categories WHERE name = '{name}'")
