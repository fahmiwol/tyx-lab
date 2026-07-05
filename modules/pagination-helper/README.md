# Pagination Helper

Generic pagination functions: compute offset/pages for DB queries, and render HTML navigation.

## API

`paginate(int $total, int $page, int $per_page = 20): array`
- Returns: {total, page, per_page, pages, offset}
- Bounds-checks page automatically

`pagination_html(array $pag, string $base_url): string`
- Renders HTML <div class="pagination"> with prev/next/links
- Shows pages ±2 from current

## Example
```php
$total = 150;
$page = (int)($_GET["page"] ?? 1);
$pag = paginate($total, $page, 20);

$items = db_rows("SELECT * FROM items LIMIT ? OFFSET ?", [$pag["per_page"], $pag["offset"]]);

echo pagination_html($pag, "?page=");
```

*Open source — use it wisely.*
