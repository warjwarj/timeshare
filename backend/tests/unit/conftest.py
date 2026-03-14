from src.repositories.repository import Repository

# Module-level patch: prevents any Repository subclass from opening a DB
# connection during __init__ (needed because events_repository.py
# instantiates repos at module scope, which runs at pytest-collection time).
Repository._ensure_tables_exist = lambda self: None
