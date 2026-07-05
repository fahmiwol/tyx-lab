# Sale Pipeline Stages

Configurable sales pipeline stage machine with SLA tracking, terminal state detection, and stage-to-label/color mapping. Abstracts lead/deal workflow stages as a reusable pattern.

## Use case

Any system with a multi-stage sales funnel: leads → contacted → negotiation → proposal → won/lost/bounce. Each stage has an SLA timer, icon, and color for UI rendering.

## API

`crm_get_stages(): array`
- Returns all active stages from DB or fallback defaults
- Stages have: id, stage_key, label, icon, color, sla_days, is_terminal

`crm_stage_label(string $key): string`
- Lookup stage label by key

`crm_stage_color(string $key): string`
- Lookup stage color hex by key for UI theming

## Database schema (optional)
```sql
CREATE TABLE crm_pipeline_stages (
  id INT PK, stage_key VARCHAR(50), label VARCHAR(100),
  icon VARCHAR(10), color VARCHAR(7), sla_days INT,
  is_terminal TINYINT, sort_order INT, is_active TINYINT
);
```

## Example

```php
$stages = crm_get_stages();
foreach ($stages as $s) {
  echo "{$s[label]}: {$s[sla_days]} days, terminal={$s[is_terminal]}\n";
}
```

*Open source — use it wisely.*
