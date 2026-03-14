import pytest
from fastapi.testclient import TestClient

from src.repositories.repository import Repository
from src.db.session import get_engine, get_sessionmaker


@pytest.fixture(autouse=True)
def reset_singletons():
  """
  Clear singleton repository instances and LRU-cached engine/sessionmaker
  after every test so state never leaks between tests.
  """
  yield
  Repository._instances.clear()
  get_engine.cache_clear()
  get_sessionmaker.cache_clear()


@pytest.fixture
def client():
  """Return a fresh TestClient for each test."""
  from main import app
  return TestClient(app)


@pytest.fixture
def auth_override(client):
  """
  Override the verify_token dependency with a no-DB stub that returns a
  hardcoded payload. Cleans up after the test.
  """
  from main import app
  from src.dependancies.auth import get_request_context

  test_payload = {"user_uuid": "test-uuid-00000000-0000-0000-0000-000000000000"}
  app.dependency_overrides[get_request_context] = lambda: test_payload
  yield test_payload
  app.dependency_overrides.pop(get_request_context, None)
