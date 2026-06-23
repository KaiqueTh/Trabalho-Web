document.addEventListener('DOMContentLoaded', () => {
    // Conexão com o Supabase
    const supabaseUrl = 'https://vuirkpsdocehcvndbdia.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1aXJrcHNkb2NlaGN2bmRiZGlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNTMyOTYsImV4cCI6MjA5NzYyOTI5Nn0.836P6N_KMh1Fx26pr4anO9U2wV1yWAYQ2itRFu9d4bw'

    const supabase = 
    window.supabase.createClient(
        supabaseUrl,
        supabaseKey
    );

    let livroSelecionado = null; // Variável global para armazenar o livro selecionado

    // --- Scripts para index.html ---

    // Referências para a busca
    const searchInput = document.getElementById('searchInput');
    const suggestionsBox = document.getElementById('suggestions');
    const bookCards = document.querySelectorAll('.card');
    
    // Extrai os títulos dos livros presentes nos cards para a busca
    const bookTitles = Array.from(bookCards).map(card => card.querySelector('h3').textContent);

    // Função auxiliar para filtrar os cards na tela
    const filterBooks = (term) => {
        const lowerTerm = term.toLowerCase();
        bookCards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            if (title.includes(lowerTerm)) {
                card.style.display = 'block'; // Mostra o card se coincidir
            } else {
                card.style.display = 'none';  // Esconde o card se não coincidir
            }
        });
    };

    // Lógica de Busca em Tempo Real
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value;
            suggestionsBox.innerHTML = '';
            
            if (term.length > 0) {
                const filtered = bookTitles.filter(title => title.toLowerCase().includes(term.toLowerCase()));
                
                if (filtered.length > 0) {
                    suggestionsBox.style.display = 'block';
                    filtered.forEach(title => {
                        const div = document.createElement('div');
                        div.classList.add('suggestion-item');
                        div.textContent = title;
                        div.addEventListener('click', () => {
                            searchInput.value = title;
                            suggestionsBox.style.display = 'none';
                            filterBooks(title); // Filtra ao clicar na sugestão
                        });
                        suggestionsBox.appendChild(div);
                    });
                } else {
                    suggestionsBox.style.display = 'none';
                }
            } else {
                suggestionsBox.style.display = 'none';
            }

            // Filtra os cards em tempo real enquanto digita
            filterBooks(term);
        });

        // Fecha sugestões ao clicar fora
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target)) suggestionsBox.style.display = 'none';
        });
    }

    // Referências para o Modal de Empréstimo
    const modal = document.getElementById('loanModal');
    const modalTitle = document.getElementById('modalBookTitle');
    const closeModal = document.querySelector('.close-modal');
    const loanForm = document.getElementById('loanForm');

    // Evento para o botão "Explorar Livros" no banner
    const exploreBooksButton = document.querySelector('.banner button');
    if (exploreBooksButton) {
        exploreBooksButton.addEventListener('click', () => {
            document.querySelector('.livros-destaque').scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Evento para os botões "Solicitar Empréstimo" nos cards de livros
    const requestLoanButtons = document.querySelectorAll('.card button');
    requestLoanButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const card = event.target.closest('.card');

            livroSelecionadoId =
            Number(card.getAttribute('data-id')); // Armazena o ID do livro selecionado

            const bookTitle =
            card.querySelector('h3').textContent; // Captura o título do livro
            
            // Abre o modal em vez do alert
            if (modal) {
                modalTitle.textContent = `Livro: ${bookTitle}`;
                modal.style.display = 'block';
            }
        });
    });

    // Fechar Modal
    if (closeModal) {
        closeModal.onclick = () => modal.style.display = 'none';
    }
    window.onclick = (event) => {
        if (event.target == modal) modal.style.display = 'none';
    };

    // Envio do formulário de empréstimo
    if (loanForm) {
    loanForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nome = loanForm.userName.value;
        const email = loanForm.userEmail.value;
        const telefone = loanForm.userPhone.value;

        const { error } = await supabase
            .from('emprestimos')
            .insert([
                {
                    nome_leitor: nome,
                    email: email,
                    telefone: telefone,
                    livro_id: livroSelecionadoId
                }
            ]);

        if (error) {
            console.error("Erro Supabase:", error);

            alert(
                 "Código: " + error.code +
                 "\nMensagem: " + error.message +
                 "\nDetalhes: " + error.details
            );

            return;
        }

        alert('Empréstimo registrado com sucesso!');
        modal.style.display = 'none';
        loanForm.reset();
    });
}

    // Evento para o botão "Buscar" (comportamento mantido para o botão principal)
    const searchButton = document.querySelector('.pesquisa button');
    if (searchButton) {
        searchButton.addEventListener('click', () => {
            const searchTerm = searchInput.value;
            filterBooks(searchTerm); // Filtra ao clicar no botão buscar
        });
    }

    // --- Lógica para os Balões de Informação no Menu ---
    const infoLinks = document.querySelectorAll('.nav-info');
    const balloon = document.getElementById('infoBalloon');

    const infoContent = {
        acervo: "<strong>Acervo</strong>Estamos melhorando mais e mais, para um futuro de aprendizado para todos.",
        categorias: "<strong>Categorias</strong>Ficção Científica, Fantasia, Romance, Suspense, História, Biografias, Infantil, Acadêmicos.",
        cadastro: "<strong>Cadastro</strong>Ops, Área em desenvolvimento.",
        contato: "<strong>Contato</strong>📞 (62) 94002-8922<br>✉ bibliotecadopovo@gmail.com<br><br>Diga para nós como foi sua experiência e em que podemos melhorar."
    };

    infoLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.stopPropagation();
            const type = link.getAttribute('data-type');
            const content = infoContent[type];
            
            if (content && balloon) {
                balloon.innerHTML = content;
                
                // Posicionamento dinâmico do balão
                const rect = link.getBoundingClientRect();
                balloon.style.display = 'block';
                
                // Ajusta para ficar centralizado abaixo do link
                const leftPos = rect.left + (rect.width / 2) - (balloon.offsetWidth / 2);
                const topPos = rect.bottom + window.scrollY + 15;
                
                balloon.style.left = `${leftPos}px`;
                balloon.style.top = `${topPos}px`;
            }
        });
    });

    // Fecha o balão ao clicar fora dele
    document.addEventListener('click', (e) => {
        if (balloon && !balloon.contains(e.target)) {
            balloon.style.display = 'none';
        }
    });

    // Fecha o balão ao rolar a página para não ficar "voando"
    window.addEventListener('scroll', () => { if(balloon) balloon.style.display = 'none'; });

    // --- Scripts para admin.html ---

    // Navegação entre abas do Admin
    const menuItems = document.querySelectorAll('.sidebar .menu-item');
    const adminSections = document.querySelectorAll('.admin-section');

    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetId = item.getAttribute('data-target');

            // Remove ativo de todos e esconde todas as seções
            menuItems.forEach(i => i.classList.remove('active'));
            adminSections.forEach(s => s.classList.add('hidden-section'));

            // Ativa o clicado e mostra a seção alvo
            item.classList.add('active');
            document.getElementById(targetId).classList.remove('hidden-section');
        });
    });

    // Validação de Senha Administrativa
    const adminOverlay = document.getElementById('adminLoginOverlay');
    if (adminOverlay) {
        const adminLoginBtn = document.getElementById('adminLoginBtn');
        const adminPasswordInput = document.getElementById('adminPassword');

        adminLoginBtn.addEventListener('click', () => {
            // Definindo uma senha simples para o exemplo
            const senhaCorreta = "admin123"; 

            if (adminPasswordInput.value === senhaCorreta) {
                adminOverlay.style.display = 'none';
            } else {
                alert('Senha incorreta! Acesso negado.');
            }
        });
    }

    // Evento para o botão "Salvar Cadastro" no formulário de livros
    const registerBookForm = document.querySelector('.formulario form'); // Seleciona o formulário
    if (registerBookForm) {
        registerBookForm.addEventListener('submit', (event) => {
            const bookName = registerBookForm.querySelector('input[name="nome_livro"]').value;
            const author = registerBookForm.querySelector('input[name="autor"]').value;
            const category = registerBookForm.querySelector('input[name="categoria"]').value;
            const quantity = registerBookForm.querySelector('input[name="quantidade"]').value;
            const imageUrl = registerBookForm.querySelector('input[name="url_imagem"]').value;

            if (!bookName || !author || !category || !quantity || !imageUrl) {
                alert('Por favor, preencha todos os campos para cadastrar o livro.');
                event.preventDefault(); // Impede o envio do formulário se a validação falhar
            }
            // Se todos os campos estiverem preenchidos, o formulário será enviado para process_book.php
        });
    }
});