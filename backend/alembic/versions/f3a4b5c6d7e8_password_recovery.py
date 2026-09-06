"""Single-use password recovery and session revocation."""
from alembic import op
import sqlalchemy as sa
revision = 'f3a4b5c6d7e8'
down_revision = 'f2a3b4c5d6e7'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('users', sa.Column('auth_version', sa.Integer(), nullable=False, server_default='0'))
    op.create_table('password_resets',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('token_hash', sa.String(64), nullable=False, unique=True),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))
    op.create_index('ix_password_resets_user_id', 'password_resets', ['user_id'])

def downgrade():
    op.drop_table('password_resets')
    op.drop_column('users', 'auth_version')
