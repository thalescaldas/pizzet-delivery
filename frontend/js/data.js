// =====================================================================
// Textos e formatações usados em várias telas.
// O catálogo NÃO fica mais aqui: ele vem da API C# (tabela produtos).
// =====================================================================

/** Formata número como moeda brasileira: 49.9 -> "R$ 49,90" */
export const money = (n) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(n) || 0);

/** Categorias: código da API -> nome exibido (igual ao protótipo). */
export const CATEGORIAS = [
  { codigo: 'TRADICIONAL', nome: 'Tradicionais' },
  { codigo: 'ESPECIAL', nome: 'Especiais' },
  { codigo: 'PREMIUM', nome: 'Premium' },
  { codigo: 'DOCE', nome: 'Doces' },
  { codigo: 'BEBIDA', nome: 'Bebidas' },
];

export function nomeCategoria(codigo) {
  const categoria = CATEGORIAS.find((c) => c.codigo === codigo);
  return categoria ? categoria.nome : codigo;
}

/** Status do pedido: código da API -> texto e ícone. */
export const STATUS = {
  RECEBIDO: { texto: 'Recebido', icone: '✓' },
  EM_PREPARO: { texto: 'Em preparo', icone: '👨‍🍳' },
  SAIU_PARA_ENTREGA: { texto: 'Saiu para entrega', icone: '🛸' },
  ENTREGUE: { texto: 'Entregue', icone: '🏠' },
  CANCELADO: { texto: 'Cancelado', icone: '✕' },
};

/** Ordem das etapas na tela de acompanhamento (Cancelado é tratado à parte). */
export const ETAPAS = ['RECEBIDO', 'EM_PREPARO', 'SAIU_PARA_ENTREGA', 'ENTREGUE'];

export const textoStatus = (codigo) => (STATUS[codigo] ? STATUS[codigo].texto : codigo);

/** Formas de pagamento SIMULADAS (nenhuma cobrança real). */
export const PAGAMENTOS = [
  { codigo: 'PIX', nome: 'Pix (simulado)' },
  { codigo: 'CARTAO', nome: 'Cartão na entrega (simulado)' },
  { codigo: 'DINHEIRO', nome: 'Dinheiro na entrega (simulado)' },
];

export const nomePagamento = (codigo) =>
  (PAGAMENTOS.find((p) => p.codigo === codigo) || { nome: codigo }).nome;

/** Taxa exibida no carrinho. O valor que vale é o calculado pelo servidor. */
export const TAXA_ENTREGA_ESTIMADA = 7.9;

/** "2026-11-04T10:28:19" -> "04/11/2026 10:28" */
export function formatarData(iso) {
  if (!iso) return '';
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return '';
  return data.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

/** "70040010" -> "70040-010" */
export const formatarCep = (cep) => String(cep || '').replace(/^(\d{5})(\d{3})$/, '$1-$2');

/** "61999998888" -> "(61) 99999-8888" */
export function formatarTelefone(tel) {
  const d = String(tel || '').replace(/\D/g, '');
  if (d.length === 11) return d.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  if (d.length === 10) return d.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  return d;
}
