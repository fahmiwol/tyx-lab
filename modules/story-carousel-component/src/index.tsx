/**
 * Story Carousel Component
 *
 * Instagram-style story carousel with compound component pattern.
 * Supports:
 * - Horizontal infinite scroll
 * - Auto-advance (optional timer)
 * - Click/tap navigation
 * - Rich metadata per story
 *
 * Use this as a starting point; extend with animations (Framer Motion, React Spring)
 * and state management (Redux, Zustand) as needed.
 *
 * Open source — use it wisely.
 */

import React, { ReactNode, useState, useEffect } from "react";

export interface Story {
  id: string;
  src: string;
  duration?: number; // ms, auto-advance if provided
  caption?: string;
  metadata?: Record<string, any>;
}

interface StoriesContextType {
  stories: Story[];
  currentIndex: number;
  advance: () => void;
  goToPrevious: () => void;
  goToIndex: (index: number) => void;
}

const StoriesContext = React.createContext<StoriesContextType | null>(null);

/**
 * Container component
 */
export interface StoriesProps {
  stories: Story[];
  onIndexChange?: (index: number) => void;
  children: ReactNode;
}

export const Stories: React.FC<StoriesProps> = ({
  stories,
  onIndexChange,
  children,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const advance = () => {
    const next = (currentIndex + 1) % stories.length;
    setCurrentIndex(next);
    onIndexChange?.(next);
  };

  const goToPrevious = () => {
    const prev = (currentIndex - 1 + stories.length) % stories.length;
    setCurrentIndex(prev);
    onIndexChange?.(prev);
  };

  const goToIndex = (index: number) => {
    if (index >= 0 && index < stories.length) {
      setCurrentIndex(index);
      onIndexChange?.(index);
    }
  };

  const value: StoriesContextType = {
    stories,
    currentIndex,
    advance,
    goToPrevious,
    goToIndex,
  };

  return (
    <StoriesContext.Provider value={value}>
      <div role="region" aria-label="Stories carousel">
        {children}
      </div>
    </StoriesContext.Provider>
  );
};

/**
 * List of story cards
 */
interface StoriesListProps {
  children: ReactNode;
  className?: string;
}

Stories.List = ({ children, className = "" }: StoriesListProps) => (
  <div
    className={`flex overflow-x-auto snap-x snap-mandatory gap-2 pb-2 ${className}`}
    role="listbox"
  >
    {children}
  </div>
);

/**
 * Individual story card
 */
interface StoryProps {
  src: string;
  alt?: string;
  isActive?: boolean;
  onClick?: () => void;
  duration?: number;
  children?: ReactNode;
  className?: string;
}

Stories.Story = ({
  src,
  alt = "Story",
  isActive = false,
  onClick,
  duration,
  children,
  className = "",
}: StoryProps) => {
  const [timeLeft, setTimeLeft] = useState(duration || 5000);

  useEffect(() => {
    if (!isActive || !duration) return;

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 100) return duration;
        return t - 100;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [isActive, duration]);

  const progress = duration ? ((duration - timeLeft) / duration) * 100 : 0;

  return (
    <div
      className={`flex-shrink-0 w-24 h-32 cursor-pointer rounded-lg overflow-hidden snap-start transition-opacity ${
        isActive ? "ring-2 ring-offset-1 ring-blue-500" : "opacity-60"
      } ${className}`}
      onClick={onClick}
      role="option"
      aria-selected={isActive}
    >
      <div className="relative w-full h-full">
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
        />
        {isActive && duration && (
          <div className="absolute top-0 left-0 h-1 bg-blue-500 bg-opacity-50 transition-all">
            <div
              className="h-full bg-blue-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        {children && (
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent text-white text-xs">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Navigation controls
 */
interface StoriesNavProps {
  children?: ReactNode;
  className?: string;
}

Stories.Nav = ({ children, className = "" }: StoriesNavProps) => (
  <div className={`flex gap-2 mt-4 ${className}`} role="toolbar">
    {children}
  </div>
);

/**
 * Previous button
 */
Stories.PrevButton = ({ className = "" }: { className?: string }) => {
  const context = React.useContext(StoriesContext);
  if (!context) throw new Error("PrevButton must be inside Stories");

  return (
    <button
      onClick={context.goToPrevious}
      className={`px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 ${className}`}
      aria-label="Previous story"
    >
      ← Prev
    </button>
  );
};

/**
 * Next button
 */
Stories.NextButton = ({ className = "" }: { className?: string }) => {
  const context = React.useContext(StoriesContext);
  if (!context) throw new Error("NextButton must be inside Stories");

  return (
    <button
      onClick={context.advance}
      className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${className}`}
      aria-label="Next story"
    >
      Next →
    </button>
  );
};

/**
 * Index dots
 */
Stories.Dots = ({ className = "" }: { className?: string }) => {
  const context = React.useContext(StoriesContext);
  if (!context) throw new Error("Dots must be inside Stories");

  return (
    <div className={`flex gap-1 ${className}`} role="group">
      {context.stories.map((_, i) => (
        <button
          key={i}
          onClick={() => context.goToIndex(i)}
          className={`w-2 h-2 rounded-full transition-all ${
            i === context.currentIndex ? "bg-blue-500 w-4" : "bg-gray-300"
          }`}
          aria-label={`Go to story ${i + 1}`}
          aria-current={i === context.currentIndex}
        />
      ))}
    </div>
  );
};
