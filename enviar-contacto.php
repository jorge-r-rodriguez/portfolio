<?php
// Configuración de seguridad
$allowed_origin = 'https://jorgerodriguez.es';
$recipient_email = 'info@jorgerodriguez.es';

// Headers
header('Content-Type: application/json');

// Validar origen de la solicitud (CORS)
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
if ($origin && $origin !== $allowed_origin && strpos($origin, 'localhost') === false) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Origen no autorizado']);
    exit();
}

// Permitir CORS si viene del origen correcto
if ($origin === $allowed_origin || strpos($origin, 'localhost') !== false) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
}

// Manejo de peticiones OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Solo acepta peticiones POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit();
}

// Rate limiting básico: máximo 10 solicitudes por IP por hora
$ip = $_SERVER['REMOTE_ADDR'];
$rate_limit_file = sys_get_temp_dir() . '/contact_form_' . md5($ip) . '.txt';

if (file_exists($rate_limit_file)) {
    $data = json_decode(file_get_contents($rate_limit_file), true);
    $current_time = time();
    
    // Si han pasado más de una hora, resetear el contador
    if ($current_time - $data['first_request'] > 3600) {
        $data = ['count' => 1, 'first_request' => $current_time];
    } else {
        $data['count']++;
        // Si ha enviado más de 10 solicitudes en una hora, rechazar
        if ($data['count'] > 10) {
            http_response_code(429);
            echo json_encode(['success' => false, 'message' => 'Demasiadas solicitudes. Intenta más tarde.']);
            exit();
        }
    }
    file_put_contents($rate_limit_file, json_encode($data));
} else {
    file_put_contents($rate_limit_file, json_encode(['count' => 1, 'first_request' => time()]));
}

// Obtener datos del formulario
$name = isset($_POST['name']) ? trim($_POST['name']) : '';
$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$message = isset($_POST['message']) ? trim($_POST['message']) : '';

// Validación de campos
$errors = [];

// Validar longitud de campos
if (empty($name) || strlen($name) < 2 || strlen($name) > 100) {
    $errors[] = 'El nombre debe tener entre 2 y 100 caracteres';
}

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 255) {
    $errors[] = 'El correo electrónico es inválido';
}

if (empty($message) || strlen($message) < 10 || strlen($message) > 5000) {
    $errors[] = 'El mensaje debe tener entre 10 y 5000 caracteres';
}

// Detectar spam simple
$spam_keywords = ['viagra', 'casino', 'poker', 'lottery', 'bitcoin', 'click here', 'buy now'];
$message_lower = strtolower($message);
foreach ($spam_keywords as $keyword) {
    if (strpos($message_lower, $keyword) !== false) {
        $errors[] = 'El mensaje contiene contenido no permitido';
        break;
    }
}

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => implode(', ', $errors)]);
    exit();
}

// Sanitizar datos
$name = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
$email = htmlspecialchars($email, ENT_QUOTES, 'UTF-8');
$message = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');

// Proteger contra inyección de headers en el email
$email = str_replace(["\n", "\r"], '', $email);
$name = str_replace(["\n", "\r"], '', $name);

// Configurar correo
$to = $recipient_email; // Email fijo, no desde el formulario
$subject = 'Nueva solicitud de contacto - Portfolio';
$subject = str_replace(["\n", "\r"], '', $subject);

$headers = "MIME-Version: 1.0\r\n";
$headers .= "Content-type: text/html; charset=UTF-8\r\n";
$headers .= "From: noreply@jorgerodriguez.es\r\n";
$headers .= "Reply-To: " . $email . "\r\n";
$headers .= "X-Mailer: ContactForm\r\n";

// Crear cuerpo del correo en HTML
$body = "<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { background-color: #f4f4f4; padding: 20px; }
        .email-content { background-color: #fff; padding: 30px; border-radius: 5px; }
        .header { border-bottom: 3px solid #0066ff; padding-bottom: 20px; margin-bottom: 20px; }
        .field { margin-bottom: 20px; }
        .label { font-weight: bold; color: #0066ff; }
        .value { margin-top: 5px; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #777; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='email-content'>
            <div class='header'>
                <h2>📧 Fromulario web de Jorge Rodriguez</h2>
            </div>
            
            <div class='field'>
                <div class='label'>Nombre:</div>
                <div class='value'>" . $name . "</div>
            </div>
            
            <div class='field'>
                <div class='label'>Correo electrónico:</div>
                <div class='value'><a href='mailto:" . $email . "'>" . $email . "</a></div>
            </div>
            
            <div class='field'>
                <div class='label'>Mensaje:</div>
                <div class='value'>" . nl2br($message) . "</div>
            </div>
            
            <div class='footer'>
                <p>Este mensaje fue enviado desde el formulario de contacto de tu portfolio.</p>
                <p>IP del remitente: " . htmlspecialchars($_SERVER['REMOTE_ADDR'], ENT_QUOTES, 'UTF-8') . "</p>
                <p>Responde directamente a este correo o contacta al remitente en: " . $email . "</p>
            </div>
        </div>
    </div>
</body>
</html>";

// Enviar correo
$mail_sent = mail($to, $subject, $body, $headers);

if ($mail_sent) {
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => '¡Mensaje enviado exitosamente! Te contactaré pronto.',
        'timestamp' => date('Y-m-d H:i:s')
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al enviar el correo. Intenta de nuevo más tarde.'
    ]);
}
?>

