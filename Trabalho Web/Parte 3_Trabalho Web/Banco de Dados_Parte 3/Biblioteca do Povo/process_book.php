<?php
$db_file = 'data.json';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nome_livro = htmlspecialchars($_POST['nome_livro'] ?? '');
    $autor = htmlspecialchars($_POST['autor'] ?? '');
    $categoria = htmlspecialchars($_POST['categoria'] ?? '');
    $quantidade = htmlspecialchars($_POST['quantidade'] ?? '');
    $url_imagem = htmlspecialchars($_POST['url_imagem'] ?? '');

    if (empty($nome_livro) || empty($autor) || empty($categoria) || empty($quantidade) || empty($url_imagem)) {
        header("Location: admin.php?error=campos_vazios");
    } else {
        $data = file_exists($db_file) ? json_decode(file_get_contents($db_file), true) : ['books' => [], 'loans' => []];
        
        $data['books'][] = [
            'nome' => $nome_livro,
            'autor' => $autor,
            'categoria' => $categoria,
            'quantidade' => $quantidade,
            'imagem' => $url_imagem,
            'status' => 'Disponível'
        ];

        file_put_contents($db_file, json_encode($data, JSON_PRETTY_PRINT));
        header("Location: admin.php?success=livro_cadastrado");
    }
}
?>