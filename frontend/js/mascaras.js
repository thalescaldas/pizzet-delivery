// =====================================================================
// MÁSCARAS DE FORMATAÇÃO
// Uso no HTML: <input data-mask="cpf">. Tipos: nome, cpf, telefone, cep, uf, numero.
//
// Acessibilidade: a máscara é aplicada DEPOIS da digitação (evento "input"),
// então nenhuma tecla é bloqueada — setas, Tab, Backspace, Delete, colar e
// leitores de tela continuam funcionando normalmente.
// O valor é enviado à API sem máscara (só dígitos) e a API valida de novo.
// =====================================================================

const somenteDigitos = (texto) => texto.replace(/\D/g, '');

const mascaras = {
  // Letras (com acento), espaço, apóstrofo e hífen; sem espaços duplicados
  nome: (v) =>
    v
      .replace(/[^\p{L} '\-]/gu, '')
      .replace(/\s{2,}/g, ' ')
      .replace(/^\s+/, '')
      .slice(0, 120),

  // 000.000.000-00
  cpf: (v) =>
    somenteDigitos(v)
      .slice(0, 11)
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2'),

  // (00) 0000-0000 ou (00) 00000-0000
  telefone: (v) => {
    const d = somenteDigitos(v).slice(0, 11);
    if (d.length <= 2) return d.length ? `(${d}` : '';
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  },

  // 00000-000
  cep: (v) =>
    somenteDigitos(v)
      .slice(0, 8)
      .replace(/^(\d{5})(\d)/, '$1-$2'),

  // Duas letras maiúsculas
  uf: (v) =>
    v
      .replace(/[^a-zA-Z]/g, '')
      .toUpperCase()
      .slice(0, 2),

  // Somente números (ex.: número da casa)
  numero: (v) => somenteDigitos(v).slice(0, 6),

  // Preço: dígitos e uma vírgula/ponto com até 2 casas
  preco: (v) => {
    const limpo = v.replace(/[^\d,.]/g, '').replace('.', ',');
    const [inteiro, decimal] = limpo.split(',');
    return decimal === undefined
      ? inteiro.slice(0, 4)
      : `${inteiro.slice(0, 4)},${decimal.replace(/,/g, '').slice(0, 2)}`;
  },
};

/** Aplica a máscara mantendo o cursor numa posição coerente. */
export function aplicarMascara(input) {
  const tipo = input.dataset.mask;
  const formatar = mascaras[tipo];
  if (!formatar) return;

  const antes = input.value;
  const cursor = input.selectionStart ?? antes.length;
  // Quantos caracteres "relevantes" havia antes do cursor
  const relevantesAntes = antes.slice(0, cursor).replace(/[^\p{L}\d,]/gu, '').length;

  const depois = formatar(antes);
  if (depois === antes) return;
  input.value = depois;

  // Reposiciona o cursor depois do mesmo número de caracteres relevantes
  let posicao = 0;
  let contados = 0;
  while (posicao < depois.length && contados < relevantesAntes) {
    if (/[\p{L}\d,]/u.test(depois[posicao])) contados++;
    posicao++;
  }
  if (document.activeElement === input) input.setSelectionRange(posicao, posicao);
}

/** Formata valores já preenchidos (ex.: telefone vindo da API). */
export function formatarCamposComMascara(raiz) {
  raiz.querySelectorAll('[data-mask]').forEach((input) => {
    if (input.value) input.value = mascaras[input.dataset.mask]?.(input.value) ?? input.value;
  });
}

/** Ativa as máscaras em todo o documento (delegação de eventos). */
export function ativarMascaras(raiz = document) {
  raiz.addEventListener('input', (evento) => {
    if (evento.target.matches?.('[data-mask]')) aplicarMascara(evento.target);
  });
}

export const limparDigitos = somenteDigitos;
