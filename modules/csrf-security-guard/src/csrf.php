<?php
// CSRF Security Guard
function secure_session_start(): void {
    if (session_status() === PHP_SESSION_NONE) {
        session_set_cookie_params([
            "lifetime" => 3600,
            "path"     => "/",
            "secure"   => isset($_SERVER["HTTPS"]),
            "httponly" => true,
            "samesite" => "Strict",
        ]);
        session_start();
    }
}
function csrf_token(): string {
    if (empty($_SESSION["csrf_token"])) {
        $_SESSION["csrf_token"] = bin2hex(random_bytes(32));
    }
    return $_SESSION["csrf_token"];
}
function csrf_field(): string {
    return "<input type=\"hidden\" name=\"csrf_token\" value=\"" . csrf_token() . "\">";
}
function csrf_verify(): bool {
    $t = $_POST["csrf_token"] ?? $_SERVER["HTTP_X_CSRF_TOKEN"] ?? "";
    return hash_equals(csrf_token(), $t);
}
function csrf_require(): void {
    if (!csrf_verify()) {
        http_response_code(403);
        die(json_encode(["ok"=>false,"msg"=>"CSRF token invalid"]));
    }
}
// Open source — use it wisely.
?>