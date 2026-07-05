/**
 * Prisma service lifecycle wrapper — auto-connect on init, disconnect on destroy.
 *
 * Why: NestJS services need proper resource cleanup. Extending PrismaClient
 * with OnModuleInit/OnModuleDestroy prevents connection leaks and ensures graceful shutdown.
 *
 * Usage:
 *   @Injectable()
 *   export class MyService {
 *     constructor(private prisma: PrismaService) {}
 *   }
 */

import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  /**
   * Connect to database on NestJS module init.
   */
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  /**
   * Disconnect from database on NestJS module destroy (graceful shutdown).
   */
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  /**
   * Health check: test connection.
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Graceful transaction wrapper with timeout.
   */
  async withTransaction<T>(
    fn: (prisma: PrismaClient) => Promise<T>,
    timeoutMs: number = 10000,
  ): Promise<T> {
    return this.$transaction(fn, {
      timeout: timeoutMs,
    });
  }
}
