"""Keep the prompt associated with saved follow-up drafts."""
from alembic import op
import sqlalchemy as sa
revision = 'f4a5b6c7d8e9'
down_revision = 'f3a4b5c6d7e8'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('generated_questions', sa.Column('draft_follow_up_from', sa.Integer(), nullable=True))

def downgrade():
    op.drop_column('generated_questions', 'draft_follow_up_from')
