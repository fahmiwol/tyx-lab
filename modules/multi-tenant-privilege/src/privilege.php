<?php
// multi-tenant-privilege.php — Granular role-based access control
// Supports per-module actions: view, create, edit, delete
define('ROLE_LEVEL_FULL_ACCESS', 100);

function load_privileges(): void {
    if (isset($_SESSION['_privs'])) return;

    $role_id = $_SESSION['role_id'] ?? 0;
    if (!$role_id) {
        $_SESSION['_privs'] = [];
        return;
    }

    try {
        $rows = db_rows("SELECT * FROM privileges WHERE role_id = ?", [$role_id]);
        $privs = [];
        foreach ($rows as $row) {
            $privs[$row['module']] = $row;
        }
        $_SESSION['_privs'] = $privs;
    } catch (Throwable $e) {
        $_SESSION['_privs'] = [];
    }
}

function role_has_full_access(): bool {
    return (int) ($_SESSION['role_level'] ?? 0) >= ROLE_LEVEL_FULL_ACCESS;
}

function can(string $module, string $action = 'view'): bool {
    load_privileges();
    if (role_has_full_access()) return true;

    $privs = $_SESSION['_privs'] ?? [];
    if (!isset($privs[$module])) return false;
    return (bool) ($privs[$module]['can_' . $action] ?? false);
}

function require_priv(string $module, string $action = 'view'): void {
    if (!can($module, $action)) {
        http_response_code(403);
        if (!empty($_SERVER['HTTP_X_REQUESTED_WITH'])) {
            json_err('Akses ditolak', 403);
        }
        global $page_403;
        $page_403 = true;
        return;
    }
}
?>
