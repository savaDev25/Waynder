"""
Shared pytest configuration and fixtures for the scraper test suite.
"""

import logging
import sys
from pathlib import Path

import pytest

# Makes `connectors/` importable from any test file without each one
# needing its own sys.path hack.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))


@pytest.fixture(scope="session")
def rp_logger():
    """
    Logger wired to ReportPortal's log handler. Use this instead of print()
    inside tests if you want step-by-step logs attached to the test item
    in ReportPortal's UI -- optional, tests work fine without it.
    """
    from reportportal_client import RPLogger

    logger = logging.getLogger(__name__)
    logger.setLevel(logging.DEBUG)
    logging.setLoggerClass(RPLogger)
    return logger