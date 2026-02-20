"""Unit tests for DifyClient._strip_cot_tags CoT stripping safety net."""

import logging

import pytest

from app.services.dify_client import DifyClient


@pytest.fixture
def client():
    """Create a DifyClient with a dummy API key for unit testing."""
    return DifyClient(api_key="test-key")


class TestStripCotTags:
    """Tests for the _strip_cot_tags helper method."""

    def test_strip_cot_tags_removes_think_block(self, client):
        text = '<think>reasoning here</think>{"key": "value"}'
        result = client._strip_cot_tags(text)
        assert result == '{"key": "value"}'

    def test_strip_cot_tags_multiline_think(self, client):
        text = '<think>\nline1\nline2\n</think>{"key": "value"}'
        result = client._strip_cot_tags(text)
        assert result == '{"key": "value"}'

    def test_strip_cot_tags_no_think_unchanged(self, client):
        text = '{"key": "value"}'
        result = client._strip_cot_tags(text)
        assert result == '{"key": "value"}'

    def test_strip_cot_tags_multiple_think_blocks(self, client):
        text = '<think>block1</think>{"a":1}<think>block2</think>'
        result = client._strip_cot_tags(text)
        assert result == '{"a":1}'

    def test_strip_cot_tags_logs_warning(self, client, caplog):
        text = '<think>reasoning</think>{"key": "value"}'
        with caplog.at_level(logging.WARNING):
            client._strip_cot_tags(text)
        assert "CoT safety net activated" in caplog.text
