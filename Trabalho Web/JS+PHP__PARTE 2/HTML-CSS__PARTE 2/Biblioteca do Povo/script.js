document.addEventListener('DOMContentLoaded', () => {
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
            const bookTitle = event.target.closest('.card').querySelector('h3').textContent;
            
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
        loanForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(loanForm);
            formData.append('bookTitle', modalTitle.textContent.replace('Livro: ', ''));

            fetch('process_loan.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.text())
            .then(data => {
                alert('Solicitação enviada com sucesso!');
                modal.style.display = 'none';
                loanForm.reset();
            })
            .catch(error => {
                alert('Erro ao enviar solicitação.');
            });
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