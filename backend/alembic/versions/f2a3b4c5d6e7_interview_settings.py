"""Remember interview difficulty and focus."""
from alembic import op
import sqlalchemy as sa
revision = 'f2a3b4c5d6e7'
down_revision = 'f1a2b3c4d5e6'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('interview_sessions', sa.Column('difficulty', sa.String(30), nullable=False, server_default='intermediate'))
    op.add_column('interview_sessions', sa.Column('interview_type', sa.String(30), nullable=False, server_default='mixed'))

def downgrade():
    op.drop_column('interview_sessions', 'interview_type')
    op.drop_column('interview_sessions', 'difficulty')
