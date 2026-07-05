<?php
// Rupiah Currency & Text Formatter
function rp(float $angka, bool $short = false): string {
    if ($short) {
        if ($angka >= 1_000_000_000) return "Rp " . number_format($angka/1_000_000_000, 1) . "M";
        if ($angka >= 1_000_000)     return "Rp " . number_format($angka/1_000_000, 1) . "jt";
        if ($angka >= 1_000)         return "Rp " . number_format($angka/1_000, 0) . "rb";
    }
    return "Rp " . number_format($angka, 0, ",", ".");
}
function terbilang(float $angka): string {
    $satuan = ["","satu","dua","tiga","empat","lima","enam","tujuh","delapan","sembilan",
               "sepuluh","sebelas","dua belas","tiga belas","empat belas","lima belas",
               "enam belas","tujuh belas","delapan belas","sembilan belas"];
    $angka = (int) round($angka);
    if ($angka < 0) return "minus " . terbilang(-$angka);
    if ($angka < 20) return $satuan[$angka];
    if ($angka < 100) return $satuan[(int)($angka/10)] . " puluh" . ($angka % 10 ? " " . $satuan[$angka % 10] : "");
    if ($angka < 200) return "seratus" . ($angka - 100 ? " " . terbilang($angka - 100) : "");
    if ($angka < 1000) return $satuan[(int)($angka/100)] . " ratus" . ($angka % 100 ? " " . terbilang($angka % 100) : "");
    if ($angka < 2000) return "seribu" . ($angka - 1000 ? " " . terbilang($angka - 1000) : "");
    if ($angka < 1000000) return terbilang((int)($angka/1000)) . " ribu" . ($angka % 1000 ? " " . terbilang($angka % 1000) : "");
    if ($angka < 1000000000) return terbilang((int)($angka/1000000)) . " juta" . ($angka % 1000000 ? " " . terbilang($angka % 1000000) : "");
    return terbilang((int)($angka/1000000000)) . " miliar" . ($angka % 1000000000 ? " " . terbilang($angka % 1000000000) : "");
}
function terbilang_rupiah(float $angka): string {
    return ucfirst(terbilang($angka)) . " rupiah";
}
// Open source — use it wisely.
?>