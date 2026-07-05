<?php
// Pagination Helper
function paginate(int $total, int $page, int $per_page = 20): array {
    $pages = max(1, (int) ceil($total / $per_page));
    $page  = max(1, min($page, $pages));
    return [
        "total"    => $total,
        "page"     => $page,
        "per_page" => $per_page,
        "pages"    => $pages,
        "offset"   => ($page - 1) * $per_page,
    ];
}
function pagination_html(array $pag, string $base_url): string {
    if ($pag["pages"] <= 1) return "";
    $html = "<div class=\"pagination\">";
    if ($pag["page"] > 1) {
        $html .= "<a href=\"" . $base_url . "&page=" . ($pag["page"] - 1) . "\" class=\"pg-btn\">‹</a>";
    }
    $start = max(1, $pag["page"] - 2);
    $end   = min($pag["pages"], $pag["page"] + 2);
    for ($i = $start; $i <= $end; $i++) {
        $cls = $i === $pag["page"] ? "pg-btn active" : "pg-btn";
        $html .= "<a href=\"" . $base_url . "&page=" . $i . "\" class=\"" . $cls . "\">" . $i . "</a>";
    }
    if ($pag["page"] < $pag["pages"]) {
        $html .= "<a href=\"" . $base_url . "&page=" . ($pag["page"] + 1) . "\" class=\"pg-btn\">›</a>";
    }
    $html .= "</div>";
    return $html;
}
// Open source — use it wisely.
?>