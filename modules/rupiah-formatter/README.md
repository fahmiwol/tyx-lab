# Rupiah Currency & Text Formatter

Format Indonesian currency (IDR) with short notation (millions/thousands) and convert numbers to Indonesian words.

## API

`rp(float $angka, bool $short = false): string`
- Short mode: 1500000 → "Rp 1.5jt"
- Normal: 1500000 → "Rp 1.500.000"

`terbilang(float $angka): string`
- Convert 123 → "seratus dua puluh tiga"

`terbilang_rupiah(float $angka): string`
- Convert 1500000 → "Satu juta lima ratus ribu rupiah"

## Example
```php
echo rp(1_500_000, short: true); // "Rp 1.5jt"
echo terbilang(1500000); // "satu juta lima ratus ribu"
echo terbilang_rupiah(50_000); // "Lima puluh ribu rupiah"
```

*Open source — use it wisely.*
