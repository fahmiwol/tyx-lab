<?php
// Database Sequential Number Generator
function gen_no(string $prefix, string $table, string $col, ?string $periode = null): string {
    $bulan = $periode ?? date("Ym");
    $like = "{$prefix}-{$bulan}-%";
    $n = (int) db_val("SELECT COUNT(*) FROM \`{$table}\` WHERE \`{$col}\` LIKE ?", [$like]) + 1;
    return sprintf("%s-%s-%04d", $prefix, $bulan, $n);
}
// Open source — use it wisely.
?>