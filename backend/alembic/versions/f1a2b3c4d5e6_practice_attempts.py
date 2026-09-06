"""Persist practice drafts, bookmarks and answer attempts.

Revision ID: f1a2b3c4d5e6
Revises: e5f6a7b8c9d0
"""
from alembic import op
import sqlalchemy as sa
revision = 'f1a2b3c4d5e6'
down_revision = 'e5f6a7b8c9d0'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('generated_questions', sa.Column('draft_text', sa.Text(), nullable=False, server_default=''))
    op.add_column('generated_questions', sa.Column('bookmarked', sa.Boolean(), nullable=False, server_default=sa.false()))
    op.create_table('practice_attempts',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('question_id', sa.Integer(), sa.ForeignKey('generated_questions.id'), nullable=False),
        sa.Column('answer_text', sa.Text(), nullable=False),
        sa.Column('prompt_text', sa.Text(), nullable=False),
        sa.Column('feedback_json', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))
    op.create_index('ix_practice_attempts_question_id', 'practice_attempts', ['question_id'])

def downgrade():
    op.drop_table('practice_attempts')
    op.drop_column('generated_questions', 'bookmarked')
    op.drop_column('generated_questions', 'draft_text')
