"""
Redis queue wrapper — factory pattern for RQ queue connection pooling.

Why: Consistent Redis connection management. Avoids passing connection objects;
factory returns configured queue ready to enqueue tasks.

Usage:
    from index import get_redis, get_queue
    q = get_queue(redis_url="redis://localhost:6379/0")
    job = q.enqueue("module.task", arg1, arg2)
"""
from __future__ import annotations
from typing import Optional
from redis import Redis
from rq import Queue


class QueueFactory:
    """Manage Redis connections and RQ queues."""

    _redis_conn: Optional[Redis] = None
    _queue: Optional[Queue] = None

    @classmethod
    def get_redis(cls, redis_url: str = "redis://localhost:6379/0") -> Redis:
        """Get or create Redis connection."""
        if cls._redis_conn is None:
            cls._redis_conn = Redis.from_url(redis_url, decode_responses=False)
        return cls._redis_conn

    @classmethod
    def get_queue(
        cls,
        name: str = "default",
        redis_url: str = "redis://localhost:6379/0",
    ) -> Queue:
        """Get or create named queue."""
        redis = cls.get_redis(redis_url)
        return Queue(name=name, connection=redis)

    @classmethod
    def close(cls) -> None:
        """Close Redis connection."""
        if cls._redis_conn:
            cls._redis_conn.close()
            cls._redis_conn = None
        cls._queue = None


def get_redis(redis_url: str = "redis://localhost:6379/0") -> Redis:
    """Module-level convenience function."""
    return QueueFactory.get_redis(redis_url)


def get_queue(
    name: str = "default",
    redis_url: str = "redis://localhost:6379/0",
) -> Queue:
    """Module-level convenience function."""
    return QueueFactory.get_queue(name, redis_url)
