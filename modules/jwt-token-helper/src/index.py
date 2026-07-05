"""
JWT token helper — create, validate, and decode access tokens with configurable TTL.

Why: Every FastAPI service needs consistent JWT creation/validation. This atomic pattern
encapsulates claim generation, expiration, and error handling in a reusable way.

Usage:
    from index import TokenHelper, TokenPayload
    helper = TokenHelper(secret="your-secret", ttl_minutes=60)
    token = helper.create_token(sub="user123", role="admin")
    payload = helper.validate_token(token)
"""
from __future__ import annotations
from datetime import datetime, timedelta, timezone
from typing import TypedDict
import jwt


class TokenPayload(TypedDict, total=False):
    """JWT payload shape."""
    sub: str  # subject (user id/email)
    role: str  # user role
    iat: int  # issued at (unix timestamp)
    exp: int  # expiration (unix timestamp)


class TokenError(Exception):
    """Token validation error."""
    pass


class TokenHelper:
    """Create and validate JWT access tokens."""

    def __init__(
        self,
        secret: str,
        algorithm: str = "HS256",
        ttl_minutes: int = 60,
    ):
        """
        Args:
            secret: JWT signing secret (min 16 chars).
            algorithm: JWT algorithm (default HS256).
            ttl_minutes: Access token TTL in minutes.
        """
        if len(secret) < 16:
            raise ValueError("JWT secret must be at least 16 characters")
        self.secret = secret
        self.algorithm = algorithm
        self.ttl_minutes = ttl_minutes

    def create_token(self, *, sub: str, role: str) -> str:
        """Create a new access token."""
        now = datetime.now(timezone.utc)
        exp = now + timedelta(minutes=self.ttl_minutes)
        payload: TokenPayload = {
            "sub": sub,
            "role": role,
            "iat": int(now.timestamp()),
            "exp": int(exp.timestamp()),
        }
        return jwt.encode(payload, self.secret, algorithm=self.algorithm)

    def validate_token(self, token: str) -> TokenPayload:
        """Validate and decode token. Raises TokenError if invalid."""
        try:
            return jwt.decode(token, self.secret, algorithms=[self.algorithm])
        except jwt.ExpiredSignatureError as e:
            raise TokenError("Token expired") from e
        except jwt.InvalidTokenError as e:
            raise TokenError(f"Invalid token: {e}") from e

    def extract_claims(self, token: str) -> dict[str, str] | None:
        """Extract claims without validation. Returns None if decode fails."""
        try:
            return jwt.decode(
                token, self.secret, algorithms=[self.algorithm], options={"verify_signature": False}
            )
        except Exception:
            return None