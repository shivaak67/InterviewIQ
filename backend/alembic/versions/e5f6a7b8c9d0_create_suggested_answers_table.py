"""create suggested answers table

Revision ID: e5f6a7b8c9d0
Revises: d4e5f6a7b8c9
Create Date: 2026-07-06 22:55:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "e5f6a7b8c9d0"
down_revision: Union[str, Sequence[str], None] = "d4e5f6a7b8c9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "suggested_answers",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("question_id", sa.Integer(), nullable=False),
        sa.Column("answer_text", sa.Text(), nullable=False),
        sa.Column("star_situation", sa.Text(), nullable=True),
        sa.Column("star_task", sa.Text(), nullable=True),
        sa.Column("star_action", sa.Text(), nullable=True),
        sa.Column("star_result", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["question_id"], ["generated_questions.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("question_id"),
    )
    op.create_index(
        op.f("ix_suggested_answers_id"), "suggested_answers", ["id"], unique=False
    )
    op.create_index(
        op.f("ix_suggested_answers_question_id"),
        "suggested_answers",
        ["question_id"],
        unique=True,
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_suggested_answers_question_id"), table_name="suggested_answers"
    )
    op.drop_index(op.f("ix_suggested_answers_id"), table_name="suggested_answers")
    op.drop_table("suggested_answers")
