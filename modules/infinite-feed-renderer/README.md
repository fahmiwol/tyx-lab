# Infinite Feed Renderer

Vertical infinite scroll feed container with composition-based architecture. Decoupled from data source; you provide posts and load-more logic.

## What It Does

Renders a feed with:
- Vertical post list (divide-y layout)
- Intersection Observer–based load-more trigger
- Loading state + empty state
- Sticky header + toolbar (optional)
- Fully composable sub-components

No fetch logic built-in. You control data flow (SWR, React Query, REST, GraphQL, etc.).

## Input

- `posts`: Array of FeedPost objects
- `isLoading`: Loading state (boolean)
- `hasMore`: Whether more posts exist (boolean)
- `onLoadMore`: Async callback to fetch next page

## Output

- Rendered feed (HTML list)
- Auto-trigger load-more at bottom
- Accessibility attributes (role="feed", aria-live="polite")

## Usage

```typescript
import { Feed, useFeed } from "@tiranyx/infinite-feed-renderer";
import useSWR from "swr";

interface Post {
  id: string;
  authorName: string;
  content: string;
  timestamp: string;
}

export function SocialFeed() {
  const [page, setPage] = useState(1);
  const { data, isLoading, mutate } = useSWR(
    `/api/posts?page=${page}`,
    fetcher
  );

  const posts = data?.posts || [];
  const hasMore = data?.hasMore ?? true;

  const handleLoadMore = async () => {
    setPage((p) => p + 1);
    await mutate();
  };

  return (
    <Feed posts={posts} isLoading={isLoading} hasMore={hasMore} onLoadMore={handleLoadMore}>
      <Feed.Header>
        <h1>Your Feed</h1>
      </Feed.Header>

      <Feed.Toolbar>
        <button onClick={() => setFilter("recent")}>Recent</button>
        <button onClick={() => setFilter("trending")}>Trending</button>
      </Feed.Toolbar>

      <Feed.Posts
        renderPost={(post) => (
          <div className="p-4">
            <p className="font-bold">{post.authorName}</p>
            <p>{post.content}</p>
            <p className="text-sm text-gray-500">{post.timestamp}</p>
          </div>
        )}
      />

      <Feed.LoadMore />
    </Feed>
  );
}
```

## Dependencies

- React 16.8+ (hooks, context)
- Tailwind CSS 3+ (styling, optional)

## Why This Exists

Infinite scroll feeds are ubiquitous but the implementation details cause problems:
- Data fetching couples feed logic to API layer
- Load-more detection (scroll, intersection observer) is easy to get wrong
- Empty/loading states are repetitive
- Accessibility (ARIA live regions) is often forgotten

This component provides the **container** while letting you own:
1. **Data fetching** (integrate your choice of library)
2. **Post rendering** (define your own Post component)
3. **Styling** (Tailwind classNames are all overridable)

The composition-based API (Feed.Posts, Feed.LoadMore, Feed.Header) means you can mix-and-match sub-components for different layouts.

## Performance

For feeds with 1000+ posts, add virtualization:

```typescript
import { FixedSizeList } from "react-window";

<FixedSizeList height={800} itemCount={posts.length} itemSize={120}>
  {({ index, style }) => (
    <div style={style}>
      {/* Render post at index */}
    </div>
  )}
</FixedSizeList>
```

## Related Atoms

- `story-carousel-component` — horizontal carousel for stories/alternatives

Open source — use it wisely.
