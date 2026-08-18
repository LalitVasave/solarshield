import logging
import requests
from requests.auth import HTTPBasicAuth
from app.config import settings
from app.models.fault_result import FaultResult

logger = logging.getLogger(__name__)

def create_jira_ticket(panel_id: str, fault: FaultResult) -> bool:
    """
    Creates a Jira ticket for a critical fault using the Jira REST API v3.
    """
    if not all([settings.jira_url, settings.jira_email, settings.jira_api_token, settings.jira_project_key]):
        logger.warning("Jira credentials not fully configured. Skipping ticket creation.")
        return False

    url = f"{settings.jira_url.rstrip('/')}/rest/api/3/issue"
    auth = HTTPBasicAuth(settings.jira_email, settings.jira_api_token)
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json"
    }

    # Format the payload for Jira API v3 (Atlassian Document Format)
    payload = {
        "fields": {
            "project": {
                "key": settings.jira_project_key
            },
            "summary": f"[CRITICAL FAULT] Solar Panel {panel_id}",
            "description": {
                "type": "doc",
                "version": 1,
                "content": [
                    {
                        "type": "paragraph",
                        "content": [
                            {"type": "text", "text": "A critical fault was detected by SolarShield AI.\n\n"}
                        ]
                    },
                    {
                        "type": "bulletList",
                        "content": [
                            {
                                "type": "listItem",
                                "content": [
                                    {"type": "paragraph", "content": [{"type": "text", "text": f"Panel ID: {panel_id}"}]}
                                ]
                            },
                            {
                                "type": "listItem",
                                "content": [
                                    {"type": "paragraph", "content": [{"type": "text", "text": f"Fault Type: {fault.fault_type}"}]}
                                ]
                            },
                            {
                                "type": "listItem",
                                "content": [
                                    {"type": "paragraph", "content": [{"type": "text", "text": f"AI Confidence: {fault.confidence:.2f}%"}]}
                                ]
                            },
                            {
                                "type": "listItem",
                                "content": [
                                    {"type": "paragraph", "content": [{"type": "text", "text": f"Max Temp: {fault.max_temp}°C (Delta: {fault.delta_t}°C)"}]}
                                ]
                            }
                        ]
                    }
                ]
            },
            "issuetype": {
                "name": "Task"  # Or "Bug" depending on Jira setup
            }
        }
    }

    try:
        response = requests.post(url, json=payload, headers=headers, auth=auth)
        if response.status_code == 201:
            issue_key = response.json().get("key")
            logger.info(f"Successfully created Jira ticket: {issue_key}")
            return True
        else:
            logger.error(f"Failed to create Jira ticket: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        logger.exception("Exception occurred while communicating with Jira API.")
        return False
