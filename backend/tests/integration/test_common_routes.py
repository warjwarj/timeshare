"""
Integration tests for common routes.

No auth required. Uses the function-scoped client fixture from root conftest.
Run with: cd backend && pytest tests/integration/test_common_routes.py -v
"""
import pytest
from datetime import datetime

pytestmark = pytest.mark.integration

ENDPOINT = "/common/current-datetime"


def test_current_datetime_status_200(client):
    resp = client.get(ENDPOINT)
    assert resp.status_code == 200


def test_current_datetime_has_datetime_field(client):
    resp = client.get(ENDPOINT)
    body = resp.json()
    assert "datetime" in body


def test_current_datetime_timezone_is_utc(client):
    resp = client.get(ENDPOINT)
    body = resp.json()
    assert body["timezone"] == "UTC"


def test_current_datetime_is_valid_iso(client):
    resp = client.get(ENDPOINT)
    body = resp.json()
    # Should not raise
    datetime.fromisoformat(body["datetime"])
