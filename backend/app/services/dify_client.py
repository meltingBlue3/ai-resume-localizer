import json
import logging

import httpx

logger = logging.getLogger(__name__)


class DifyWorkflowError(Exception):
    """Raised when a Dify workflow execution fails."""


class DifyClient:
    """Async wrapper for Dify Cloud workflow API."""

    def __init__(self, api_key: str, base_url: str = "https://api.dify.ai/v1"):
        self._api_key = api_key
        self._base_url = base_url.rstrip("/")
        self._http = httpx.AsyncClient(
            base_url=self._base_url,
            headers={"Authorization": f"Bearer {api_key}"},
            timeout=httpx.Timeout(90.0, connect=10.0),
        )

    async def extract_resume(self, resume_text: str, user: str = "default") -> dict:
        """Send resume text to Dify extraction workflow and return structured data.

        Returns:
            Parsed dict from the workflow's structured_resume output.

        Raises:
            DifyWorkflowError: If the workflow fails or returns unexpected data.
            httpx.HTTPStatusError: If the HTTP request fails.
        """
        payload = {
            "inputs": {"resume_text": resume_text},
            "response_mode": "blocking",
            "user": user,
        }

        response = await self._http.post("/workflows/run", json=payload)
        response.raise_for_status()

        data = response.json().get("data", {})

        if data.get("status") != "succeeded":
            error_msg = data.get("error", "Unknown workflow error")
            raise DifyWorkflowError(f"Dify workflow failed: {error_msg}")

        outputs = data.get("outputs", {})
        structured = outputs.get("structured_resume")

        if structured is None:
            raise DifyWorkflowError(
                "Dify workflow returned no 'structured_resume' output"
            )

        if isinstance(structured, str):
            try:
                structured = json.loads(structured)
            except json.JSONDecodeError as exc:
                raise DifyWorkflowError(
                    f"Failed to parse structured_resume JSON: {exc}"
                ) from exc

        return structured

    async def close(self) -> None:
        await self._http.aclose()
