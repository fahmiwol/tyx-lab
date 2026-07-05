# Image with Fallback Component

React component that displays an image with inline SVG fallback on load error. Useful for UGC, avatars, product photos where URLs may break.

## Why

- **Graceful degradation**: User-generated URLs fail? Show placeholder, not broken image icon
- **Inline fallback**: No external image needed (base64-encoded SVG)
- **Preserve layout**: Fallback respects width, height, className
- **Transparent**: Props pass through; drop-in replacement for `<img>`

## Usage

```tsx
import { ImageWithFallback } from '@/components/ImageWithFallback';

// Simple
<ImageWithFallback
  src="https://api.example.com/images/user-123.jpg"
  alt="User profile"
/>

// With styling
<ImageWithFallback
  src="https://example.com/product.jpg"
  alt="Product"
  className="w-64 h-64 object-cover rounded-lg"
  style={{ aspectRatio: '1/1' }}
/>

// In a gallery
{items.map(item => (
  <ImageWithFallback
    key={item.id}
    src={item.imageUrl}
    alt={item.title}
    className="w-48 h-48 rounded-lg"
  />
))}
```

## Fallback Behavior

When image fails to load (`onError`):
1. Component sets internal `didError` state
2. Renders a container div instead of `<img>`
3. Displays placeholder SVG inside
4. Preserves original dimensions and className

HTML fallback:
```html
<div class="inline-block bg-gray-100 text-center align-middle w-64 h-64 rounded-lg">
  <div class="flex items-center justify-center w-full h-full">
    <img src="data:image/svg+xml;base64,..." alt="Broken image placeholder" />
  </div>
</div>
```

## Placeholder

Built-in SVG (frame + broken-image icon):
- Transparent background (matches parent)
- 30% opacity (subtle)
- Readable even at small sizes
- Pure SVG (no external dependencies)

To customize, replace `ERROR_IMG_SRC`:

```tsx
const CUSTOM_PLACEHOLDER = `data:image/svg+xml;base64,...`;

// Then use in component
<img src={CUSTOM_PLACEHOLDER} ... />
```

## Props

All standard `<img>` attributes work:

| Prop | Type | Description |
|------|------|-------------|
| `src` | string | Image URL |
| `alt` | string | Alt text |
| `className` | string | Tailwind/CSS classes |
| `style` | CSSProperties | Inline styles |
| `width` / `height` | number | Dimensions |
| `loading` | 'lazy' \| 'eager' | Loading strategy |
| `crossOrigin` | string | CORS handling |
| `data-*` | any | Data attributes |

## Examples

### User Avatar

```tsx
<ImageWithFallback
  src={user.avatarUrl}
  alt={user.name}
  className="w-12 h-12 rounded-full border-2 border-gray-200"
/>
```

If URL breaks, shows gray circle with placeholder icon.

### Product Grid

```tsx
{products.map(product => (
  <div key={product.id} className="col-span-1">
    <ImageWithFallback
      src={product.imageUrl}
      alt={product.name}
      className="w-full h-auto rounded-md"
      loading="lazy"
    />
    <h3>{product.name}</h3>
  </div>
))}
```

### Blog Post Featured Image

```tsx
<ImageWithFallback
  src={post.featuredImageUrl}
  alt={post.title}
  className="w-full h-96 object-cover rounded-xl"
  priority
/>
```

## Styling the Fallback

Fallback respects className:

```tsx
<ImageWithFallback
  src={src}
  alt="test"
  className="w-64 h-64 rounded-full border-4 border-red-500"
/>

// Fallback <div> gets: "inline-block bg-gray-100 text-center align-middle w-64 h-64 rounded-full border-4 border-red-500"
// Note: Some CSS properties may not apply to <div> (e.g., object-fit)
```

For complex layouts, consider CSS fallback:

```css
img.image-with-fallback {
  background: url('data:image/svg+xml;...') center / contain no-repeat;
  background-color: #f3f4f6;
}
```

## Debugging

To see when images fail:

```tsx
const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  console.error('Image failed:', e.currentTarget.src);
  setDidError(true);
};
```

Component logs original URL in `data-original-url` attribute for debugging:

```tsx
<img ... data-original-url="https://api.example.com/image-123.jpg" />
```

## Performance

- **No lazy-load by default**: Set `loading="lazy"` for off-screen images
- **Inline SVG**: No external request (instant fallback)
- **Minimal re-render**: Only one state update on error
- **Small bundle**: < 1KB minified

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- All modern mobile browsers

Fallback SVG uses standard XML (no exotic features).

## Integration with Next.js Image

To use with Next.js `Image` component:

```tsx
import Image from 'next/image';
import { ImageWithFallback } from '@/components/ImageWithFallback';

// Standard <img> (this module)
<ImageWithFallback src={...} />

// Or use Image with onError handler
<Image
  src={src}
  alt={alt}
  onError={() => setShowFallback(true)}
  {...}
/>
```

## Related Modules

- `aes-256-gcm-secret`: Encrypt image URLs before storing
- `currency-formatter`: Display product prices alongside images

*Open source — use it wisely.*
