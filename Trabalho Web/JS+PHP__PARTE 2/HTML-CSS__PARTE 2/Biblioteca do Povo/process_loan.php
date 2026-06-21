<?php
$db_file = 'data.json';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $data = file_exists($db_file) ? json_decode(file_get_contents($db_file), true) : ['books' => [], 'loans' => []];

    $new_loan = [
        'user' => htmlspecialchars($_POST['userName']),
        'email' => htmlspecialchars($_POST['userEmail']),
        'phone' => htmlspecialchars($_POST['userPhone']),
        'book' => htmlspecialchars($_POST['bookTitle']),
        'date' => date('d/m/Y H:i'),
        'status' => 'Pendente'
    ];

    $data['loans'][] = $new_loan;

    file_put_contents($db_file, json_encode($data, JSON_PRETTY_PRINT));
    echo "Sucesso";
}
?>