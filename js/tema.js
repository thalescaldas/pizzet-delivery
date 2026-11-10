// Aplicado antes do CSS para evitar que o tema escuro pisque ao abrir a página.
var temaAtual = 'claro';
try {
  var temaSalvo = localStorage.getItem('pizzet-tema');
  if (temaSalvo === 'escuro' || temaSalvo === 'claro') {
    temaAtual = temaSalvo;
  }
} catch (erro) {
  temaAtual = 'claro';
}

function aplicarTema() {
  document.documentElement.setAttribute('data-tema', temaAtual);
  var metaCor = document.querySelector('meta[name="theme-color"]');
  if (metaCor) {
    metaCor.setAttribute('content', temaAtual === 'claro' ? '#e8e4ef' : '#090710');
  }
  var botao = document.getElementById('alternar-tema');
  if (botao) {
    var emojiTema = temaAtual === 'claro' ? '🌙' : '☀️';
    botao.innerHTML = '<span class="emoji-cabecalho" aria-hidden="true">' + emojiTema + '</span>';
    botao.setAttribute('aria-label', temaAtual === 'claro' ? 'Ativar modo escuro' : 'Ativar modo claro');
    botao.setAttribute('title', botao.getAttribute('aria-label'));
  }
}

function alternarTema() {
  if (temaAtual === 'claro') {
    temaAtual = 'escuro';
  } else {
    temaAtual = 'claro';
  }
  aplicarTema();
  try {
    localStorage.setItem('pizzet-tema', temaAtual);
  } catch (erro) {
    // O botão continua funcionando mesmo com o armazenamento bloqueado.
  }
}

aplicarTema();

