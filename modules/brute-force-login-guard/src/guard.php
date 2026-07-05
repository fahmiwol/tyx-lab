<?php
// Brute Force Login Guard — rate limit login attempts by IP + identifier
function login_check_attempts(string $identifier): int {
    try {
        global $pdo;
        $pdo->exec("CREATE TABLE IF NOT EXISTS login_attempts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            identifier VARCHAR(200),
            ip VARCHAR(50),
            attempted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_ident (identifier),
            INDEX idx_time (attempted_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
        db_run("DELETE FROM login_attempts WHERE attempted_at < DATE_SUB(NOW(), INTERVAL 15 MINUTE)");
        $ip = $_SERVER["REMOTE_ADDR"] ?? "";
        return (int) db_val(
            "SELECT COUNT(*) FROM login_attempts WHERE (identifier = ? OR ip = ?) AND attempted_at > DATE_SUB(NOW(), INTERVAL 15 MINUTE)",
            [$identifier, $ip]
        );
    } catch (Throwable $e) { return 0; }
}
function login_record_attempt(string $identifier): void {
    try {
        db_run("INSERT INTO login_attempts (identifier, ip) VALUES (?, ?)", [
            $identifier, $_SERVER["REMOTE_ADDR"] ?? ""
        ]);
    } catch (Throwable $e) {}
}
function login_clear_attempts(string $identifier): void {
    try {
        $ip = $_SERVER["REMOTE_ADDR"] ?? "";
        db_run("DELETE FROM login_attempts WHERE identifier = ? OR ip = ?", [$identifier, $ip]);
    } catch (Throwable $e) {}
}
// Open source — use it wisely.
?>