<?php
// Sale Pipeline Stages — configurable stage machine with SLA
function crm_get_stages(): array {
    static $cache = null;
    if ($cache !== null) return $cache;
    try {
        $rows = db_rows("SELECT * FROM crm_pipeline_stages WHERE is_active = 1 ORDER BY sort_order ASC");
        if ($rows) { $cache = $rows; return $cache; }
    } catch (Throwable $e) {}
    $cache = [
        ["id"=>1,"stage_key"=>"new","label"=>"New","icon"=>"🎯","color"=>"#3b82f6","sla_days"=>3,"is_terminal"=>0],
        ["id"=>2,"stage_key"=>"contacted","label"=>"Contacted","icon"=>"📞","color"=>"#8b5cf6","sla_days"=>5,"is_terminal"=>0],
        ["id"=>5,"stage_key"=>"won","label"=>"Won","icon"=>"✅","color"=>"#10b981","sla_days"=>0,"is_terminal"=>1],
        ["id"=>6,"stage_key"=>"lost","label"=>"Lost","icon"=>"❌","color"=>"#ef4444","sla_days"=>0,"is_terminal"=>1],
    ];
    return $cache;
}
function crm_stage_label(string $key): string {
    foreach (crm_get_stages() as $s) {
        if (($s["stage_key"]??"")===$key) return $s["label"];
    }
    return $key;
}
function crm_stage_color(string $key): string {
    foreach (crm_get_stages() as $s) {
        if (($s["stage_key"]??"")===$key) return $s["color"];
    }
    return "#6b7280";
}
// Open source — use it wisely.
?>