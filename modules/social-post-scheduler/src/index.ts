/**
 * Social post auto-scheduler.
 * Runs every 60s: finds posts with status='scheduled' and scheduled_at <= now(),
 * marks them 'published', and logs the action.
 *
 * Usage:
 *   import { startScheduler } from '@/lib/social-post-scheduler';
 *   startScheduler(); // Runs once immediately, then every 60s
 */

import { getDb } from '@/lib/db';

let _running = false;

/**
 * Start the background scheduler.
 * Runs immediately, then repeats every 60 seconds.
 */
export function startScheduler() {
  console.log('[Scheduler] Auto-post scheduler started (interval: 60s)');

  // Run immediately
  runSchedulerTick();

  // Then every 60s
  setInterval(runSchedulerTick, 60_000);
}

/**
 * Single scheduler tick. Protected by mutex (_running flag).
 */
async function runSchedulerTick() {
  if (_running) {
    console.debug('[Scheduler] Previous tick still running, skipping');
    return;
  }

  _running = true;

  try {
    const count = await processDuePosts();
    if (count > 0) {
      console.info(`[Scheduler] ✅ Processed ${count} post(s)`);
    }
  } catch (err: any) {
    console.error('[Scheduler] Error:', err.message);
  } finally {
    _running = false;
  }
}

/**
 * Query posts due for publishing and update them.
 * Returns count of published posts.
 */
async function processDuePosts(): Promise<number> {
  const db = getDb();
  const now = new Date().toISOString();

  // Find all posts ready to publish
  const duePosts = db
    .prepare(
      `
    SELECT
      p.id, p.title, p.caption, p.platforms, p.org_id, p.client_id,
      c.name as client_name
    FROM posts p
    JOIN clients c ON c.id = p.client_id
    WHERE p.status = 'scheduled'
      AND p.scheduled_at IS NOT NULL
      AND p.scheduled_at <= ?
    ORDER BY p.scheduled_at ASC
  `
    )
    .all(now) as any[];

  if (duePosts.length === 0) {
    return 0;
  }

  console.log(
    `[Scheduler] Found ${duePosts.length} post(s) ready to publish`
  );

  // Prepare statements
  const updatePost = db.prepare(`
    UPDATE posts
    SET status = 'published',
        published_at = datetime('now'),
        updated_at = datetime('now')
    WHERE id = ?
  `);

  const insertLog = db.prepare(`
    INSERT INTO scheduler_log (
      post_id, org_id, client_id, action, detail, created_at
    ) VALUES (?, ?, ?, 'publish', ?, datetime('now'))
  `);

  // Run in transaction
  const tx = db.transaction((posts: any[]) => {
    for (const post of posts) {
      updatePost.run(post.id);

      // Log (ignore error if table doesn't exist)
      try {
        insertLog.run(
          post.id,
          post.org_id,
          post.client_id,
          JSON.stringify({
            title: post.title || post.caption?.slice(0, 50),
            platforms: post.platforms,
            client: post.client_name,
          })
        );
      } catch {
        // Log table may not exist on first run
      }

      const title = post.title || `(untitled, ${post.caption?.slice(0, 30)}...)`;
      console.log(
        `[Scheduler] 📤 Published: post #${post.id} "${title}" for ${post.client_name}`
      );
    }
  });

  tx(duePosts);
  return duePosts.length;
}

/**
 * Manually trigger a scheduler tick (for testing).
 */
export async function runSchedulerNow(): Promise<number> {
  if (_running) throw new Error('Scheduler already running');
  _running = true;
  try {
    return await processDuePosts();
  } finally {
    _running = false;
  }
}
