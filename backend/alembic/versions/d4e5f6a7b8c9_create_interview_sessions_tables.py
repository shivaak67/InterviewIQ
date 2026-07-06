"""create interview sessions and generated questions tables

Revision ID: d4e5f6a7b8c9
Revises: c3d4e5f6a7b8
Create Date: 2026-07-06 15:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "d4e5f6a7b8c9"
down_revision: Union[str, Sequence[str], None] = "c3d4e5f6a7b8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "interview_sessions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("resume_id", sa.Integer(), nullable=False),
        sa.Column("job_description_id", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["job_description_id"], ["job_descriptions.id"]),
        sa.ForeignKeyConstraint(["resume_id"], ["resumes.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_interview_sessions_id"), "interview_sessions", ["id"], unique=False
    )
    op.create_index(
        op.f("ix_interview_sessions_user_id"),
        "interview_sessions",
        ["user_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_interview_sessions_resume_id"),
        "interview_sessions",
        ["resume_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_interview_sessions_job_description_id"),
        "interview_sessions",
        ["job_description_id"],
        unique=False,
    )

    op.create_table(
        "generated_questions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("session_id", sa.Integer(), nullable=False),
        sa.Column("question_type", sa.String(length=50), nullable=False),
        sa.Column("question_text", sa.Text(), nullable=False),
        sa.Column("order_index", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["session_id"], ["interview_sessions.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_generated_questions_id"), "generated_questions", ["id"], unique=False
    )
    op.create_index(
        op.f("ix_generated_questions_session_id"),
        "generated_questions",
        ["session_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_generated_questions_session_id"), table_name="generated_questions")
    op.drop_index(op.f("ix_generated_questions_id"), table_name="generated_questions")
    op.drop_table("generated_questions")
    op.drop_index(
        op.f("ix_interview_sessions_job_description_id"), table_name="interview_sessions"
    )
    op.drop_index(op.f("ix_interview_sessions_resume_id"), table_name="interview_sessions")
    op.drop_index(op.f("ix_interview_sessions_user_id"), table_name="interview_sessions")
    op.drop_index(op.f("ix_interview_sessions_id"), table_name="interview_sessions")
    op.drop_table("interview_sessions")
