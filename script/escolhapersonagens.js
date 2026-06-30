document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.card');
    const btnJogar = document.querySelector('.jogar');
 
    const MINIMO_JOGADORES = 2;
 
    function atualizarBotaoJogar() {
        const habilitados = document.querySelectorAll('.card.habilitado').length;
        btnJogar.disabled = habilitados < MINIMO_JOGADORES;
    }
 
    cards.forEach((card) => {
        const botao = card.querySelector('button');
        const input = card.querySelector('input[type="text"]');
 
        botao.classList.add('habilitar-btn');
 
        botao.addEventListener('click', () => {
            const habilitado = card.classList.toggle('habilitado');
 
            if (habilitado) {
                botao.textContent = 'Desabilitar';
                botao.classList.remove('habilitar-btn');
                botao.classList.add('desabilitar-btn');
                input.disabled = false;
            } else {
                botao.textContent = 'Habilitar';
                botao.classList.remove('desabilitar-btn');
                botao.classList.add('habilitar-btn');
                input.disabled = true;
                input.value = '';
            }
 
            atualizarBotaoJogar();
        });
 
        input.disabled = true;
    });
 
    atualizarBotaoJogar();
});