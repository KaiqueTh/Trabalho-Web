<?php
$db_file = 'data.json';
$data = file_exists($db_file) ? json_decode(file_get_contents($db_file), true) : ['books' => [], 'loans' => []];

// Lógica para agrupar Usuários Únicos
$usuarios_unicos = [];
foreach ($data['loans'] as $loan) {
    $email = strtolower($loan['email']);
    if (!isset($usuarios_unicos[$email])) {
        $usuarios_unicos[$email] = [
            'nome' => $loan['user'],
            'email' => $loan['email'],
            'telefone' => $loan['phone']
        ];
    }
}

// Dados para Relatórios
$total_pendentes = count(array_filter($data['loans'], function($l) { return $l['status'] == 'Pendente'; }));
$categorias = array_count_values(array_column($data['books'], 'categoria'));
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Painel Administrativo - Biblioteca</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div id="adminLoginOverlay" class="admin-login-overlay">
        <div class="login-box">
            <h2>🔐 Área Restrita</h2>
            <input type="password" id="adminPassword" placeholder="Senha">
            <button id="adminLoginBtn">Acessar</button>
        </div>
    </div>

    <div class="admin-container">
        <aside class="sidebar">
            <h2>🛡️ Painel Admin</h2>
            <ul>
                <li class="menu-item active" data-target="dashboard">📈 Dashboard</li>
                <li class="menu-item" data-target="secao-livros">📖 Gerenciar Livros</li>
                <li class="menu-item" data-target="secao-usuarios">👥 Lista de Usuários</li>
                <li class="menu-item" data-target="secao-emprestimos">📋 Empréstimos</li>
                <li class="menu-item" data-target="secao-relatorios">📊 Relatórios</li>
                <li><a href="index.html" style="color:white; text-decoration:none;">⬅️ Sair</a></li>
            </ul>
        </aside>

        <main class="admin-main">
            <!-- ABA DASHBOARD -->
            <div id="dashboard" class="admin-section">
                <h1>Dashboard Administrativo</h1>
                <div class="stats">
                    <div class="stat-card">
                        <h3><?php echo count($data['books']); ?></h3>
                        <p>Livros no Acervo</p>
                    </div>
                    <div class="stat-card">
                        <h3><?php echo count($data['loans']); ?></h3>
                        <p>Total de Pedidos</p>
                    </div>
                    <div class="stat-card" style="border-left-color: #e74c3c;">
                        <h3><?php echo $total_pendentes; ?></h3>
                        <p>Pendentes</p>
                    </div>
                </div>
            </div>

            <!-- ABA LIVROS (Cadastro + Tabela) -->
            <div id="secao-livros" class="admin-section hidden-section">
                <section class="formulario">
                    <h2>Cadastrar Novo Livro</h2>
                    <form action="process_book.php" method="POST">
                        <input type="text" name="nome_livro" placeholder="Nome do Livro" required>
                        <input type="text" name="autor" placeholder="Autor" required>
                        <input type="text" name="categoria" placeholder="Categoria" required>
                        <input type="number" name="quantidade" placeholder="Quantidade" required>
                        <input type="text" name="url_imagem" placeholder="URL da Imagem" required>
                        <button type="submit">Adicionar ao Acervo</button>
                    </form>
                </section>
                <section class="tabela-livros">
                    <h2>Acervo de Livros</h2>
                    <table>
                        <thead><tr><th>Livro</th><th>Autor</th><th>Categoria</th><th>Qtd</th><th>Status</th></tr></thead>
                        <tbody>
                            <?php foreach (array_reverse($data['books']) as $book): ?>
                            <tr>
                                <td><?php echo $book['nome']; ?></td>
                                <td><?php echo $book['autor']; ?></td>
                                <td><?php echo $book['categoria']; ?></td>
                                <td><?php echo $book['quantidade']; ?></td>
                                <td><span class="status-badge status-disponivel"><?php echo $book['status']; ?></span></td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </section>
            </div>

            <!-- ABA USUÁRIOS -->
            <div id="secao-usuarios" class="admin-section hidden-section">
                <section class="tabela-livros">
                    <h2>Usuários que Solicitaram Livros</h2>
                    <table>
                        <thead><tr><th>Nome</th><th>E-mail</th><th>Telefone</th></tr></thead>
                        <tbody>
                            <?php foreach ($usuarios_unicos as $user): ?>
                            <tr>
                                <td><?php echo $user['nome']; ?></td>
                                <td><?php echo $user['email']; ?></td>
                                <td><?php echo $user['telefone']; ?></td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </section>
            </div>

            <!-- ABA EMPRÉSTIMOS -->
            <div id="secao-emprestimos" class="admin-section hidden-section">
                <section class="tabela-livros">
                    <h2>Gerenciar Pedidos de Empréstimo</h2>
                    <table>
                        <thead><tr><th>Nome</th><th>E-mail</th><th>Telefone</th><th>Livro</th><th>Data</th><th>Status</th></tr></thead>
                        <tbody>
                            <?php foreach (array_reverse($data['loans']) as $loan): ?>
                            <tr>
                                <td><?php echo $loan['user']; ?></td>
                                <td><?php echo $loan['email']; ?></td>
                                <td><?php echo $loan['phone']; ?></td>
                                <td><strong><?php echo $loan['book']; ?></strong></td>
                                <td><?php echo $loan['date']; ?></td>
                                <td><span class="status-badge status-pendente"><?php echo $loan['status']; ?></span></td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </section>
            </div>

            <!-- ABA RELATÓRIOS -->
            <div id="secao-relatorios" class="admin-section hidden-section">
                <section class="formulario">
                    <h2>Relatório Geral do Sistema</h2>
                    <p><strong>Total de Movimentações:</strong> <?php echo count($data['loans']); ?> pedidos registrados.</p>
                    <p><strong>Eficiência do Acervo:</strong> <?php echo count($data['books']); ?> títulos diferentes.</p>
                    <hr style="margin: 20px 0; border: 0; border-top: 1px solid #eee;">
                    <h3>Distribuição por Categorias:</h3>
                    <ul style="list-style: none; padding-top: 10px;">
                        <?php foreach ($categorias as $cat => $count): ?>
                            <li style="margin-bottom: 8px;">
                                <span style="background: #1e3a5f; color: white; padding: 2px 8px; border-radius: 4px;"><?php echo $count; ?></span> 
                                <?php echo $cat; ?>
                            </li>
                        <?php endforeach; ?>
                    </ul>
                </section>
            </div>
        </main>
    </div>

    <div id="infoBalloon" class="info-balloon"></div>

    <script src="script.js"></script>
</body>
</html>