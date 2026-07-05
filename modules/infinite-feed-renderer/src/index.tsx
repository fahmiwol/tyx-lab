/**
 * Infinite Feed Renderer
 *
 * Vertical infinite scroll container. Composition-based:
 * - Feed container manages scroll state + load-more trigger
 * - You provide your own Post component
 * - Decoupled from data source (SWR, React Query, GraphQL, REST, etc.)
 *
 * Use an Intersection Observer for bottom-of-page detection.
 * Pair with a virtualization library (react-window, react-virtual) for huge feeds.
 *
 * Open source — use it wisely.
 */

import React, { ReactNode, useRef, useEffect, useState } from "react";

export interface FeedPost {
  id: string;
  [key: string]: any;
}

export interface FeedContextType {
  posts: FeedPost[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => Promise<void>;
}

const FeedContext = React.createContext<FeedContextType | null>(null);

export function useFeed() {
  const context = React.useContext(FeedContext);
  if (!context) {
    throw new Error("useFeed must be used inside Feed component");
  }
  return context;
}

/**
 * Feed container
 */
export interface FeedProps {
  posts: FeedPost[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => Promise<void>;
  children: ReactNode;
  className?: string;
}

export const Feed: React.FC<FeedProps> = ({
  posts,
  isLoading = false,
  hasMore = true,
  onLoadMore,
  children,
  className = "",
}) => {
  const value: FeedContextType = {
    posts,
    isLoading,
    hasMore,
    onLoadMore: onLoadMore || (() => Promise.resolve()),
  };

  return (
    <FeedContext.Provider value={value}>
      <div className={`space-y-4 ${className}`} role="feed">
        {children}
      </div>
    </FeedContext.Provider>
  );
};

/**
 * List of posts
 */
interface PostsProps {
  children?: (post: FeedPost, index: number) => ReactNode;
  renderPost?: (post: FeedPost, index: number) => ReactNode;
  className?: string;
}

Feed.Posts = ({ children, renderPost, className = "" }: PostsProps) => {
  const { posts } = useFeed();
  const renderer = children || renderPost;

  if (!renderer) {
    throw new Error("Feed.Posts requires either children or renderPost prop");
  }

  return (
    <div className={`divide-y divide-gray-200 ${className}`}>
      {posts.length === 0 ? (
        <div className="py-8 text-center text-gray-500">No posts yet</div>
      ) : (
        posts.map((post, idx) => (
          <div key={post.id} className="py-4">
            {renderer(post, idx)}
          </div>
        ))
      )}
    </div>
  );
};

/**
 * Load more trigger (use with Intersection Observer)
 */
interface LoadMoreProps {
  threshold?: number;
  className?: string;
  children?: ReactNode;
}

Feed.LoadMore = ({ threshold = 0.1, className = "", children }: LoadMoreProps) => {
  const { onLoadMore, hasMore, isLoading } = useFeed();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onLoadMore();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [hasMore, isLoading, onLoadMore]);

  if (!hasMore) return null;

  return (
    <div
      ref={ref}
      className={`py-8 text-center ${className}`}
      role="status"
      aria-live="polite"
    >
      {isLoading ? (
        children || <div className="text-gray-500">Loading...</div>
      ) : (
        <div className="text-gray-400 text-sm">Scroll for more</div>
      )}
    </div>
  );
};

/**
 * Feed header (optional)
 */
interface FeedHeaderProps {
  children: ReactNode;
  className?: string;
}

Feed.Header = ({ children, className = "" }: FeedHeaderProps) => (
  <div className={`sticky top-0 z-10 bg-white py-4 border-b border-gray-200 ${className}`}>
    {children}
  </div>
);

/**
 * Filter/sort toolbar
 */
interface FeedToolbarProps {
  children: ReactNode;
  className?: string;
}

Feed.Toolbar = ({ children, className = "" }: FeedToolbarProps) => (
  <div className={`flex gap-2 ${className}`} role="toolbar">
    {children}
  </div>
);

/**
 * Empty state
 */
interface EmptyProps {
  children: ReactNode;
  className?: string;
}

Feed.Empty = ({ children, className = "" }: EmptyProps) => (
  <div className={`py-12 text-center text-gray-500 ${className}`}>
    {children}
  </div>
);
