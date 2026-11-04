// =====================================================================
// ADAPTADOR DA API C# (ASP.NET Core)
// Único arquivo que faz fetch(). Também traduz os campos da API
// (em português) para os nomes usados pelas telas.
// =====================================================================
import { nomeCategoria } from './data.js';

const base = String(window.PIZZET_API_URL || '').replace(/\/$/, '');

/** Erro com status HTTP e erros por campo (para mostrar junto aos inputs). */
export class ErroApi extends Error {
  constructor(mensagem, status, campos = {}) {
    super(mensagem);
    this.status = status;
    this.campos = campos;
  }
}

/**
 * Faz a requisição. Detalhes de segurança:
 *  - credentials: 'include' envia o cookie de login (HttpOnly, o JS não o lê);
 *  - o cabeçalho X-PizzET-Csrf é exigido pela API em POST/PUT/PATCH/DELETE (proteção CSRF);
 *  - nenhuma senha ou token é guardado no navegador.
 */
async function request(path, { method = 'GET', body } = {}) {
  let response;
  try {
    response = await fetch(`${base}${path}`, {
      method,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'X-PizzET-Csrf': '1',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new ErroApi('Não foi possível conectar ao servidor. Verifique se a API está rodando.', 0);
  }

  if (response.status === 204) return null;

  let dados = null;
  try {
    dados = await response.json();
  } catch {
    /* resposta sem corpo JSON */
  }

  if (!response.ok) throw montarErro(response.status, dados);
  return dados;
}

/** Converte a resposta de erro da API em uma mensagem amigável + erros por campo. */
function montarErro(status, dados) {
  const campos = {};
  if (dados && dados.errors) {
    for (const [chave, mensagens] of Object.entries(dados.errors)) {
      // "Cpf" -> "cpf", "Itens[0].Quantidade" -> "itens[0].Quantidade"
      const campo = chave.charAt(0).toLowerCase() + chave.slice(1);
      campos[campo] = Array.isArray(mensagens) ? mensagens[0] : String(mensagens);
    }
  }
  const primeiraMensagem = Object.values(campos)[0];
  const padrao = {
    401: 'Entre na sua conta para continuar.',
    403: 'Acesso permitido apenas para administradores.',
    404: 'Não encontrado.',
    423: 'Muitas tentativas. Aguarde alguns minutos.',
    500: 'Erro inesperado no servidor. Tente novamente.',
  };
  let mensagem = primeiraMensagem || (dados && dados.title) || padrao[status] || `Erro HTTP ${status}`;
  if (mensagem === 'One or more validation errors occurred.') mensagem = 'Verifique os campos destacados.';
  return new ErroApi(mensagem, status, campos);
}

// ---------- Tradução API -> formato das telas ----------

/** Produto da API -> objeto usado pelos cards (nomes do protótipo). */
export function paraProduto(p) {
  return {
    id: p.id,
    name: p.nome,
    description: p.descricao,
    categoryCode: p.categoria,
    category: nomeCategoria(p.categoria),
    price: Number(p.preco),
    // "assets/pizza-1.webp" (arquivo do site) ou "https://..." (imagem externa)
    imageUrl: !p.imagemUrl ? null : p.imagemUrl.startsWith('https://') ? p.imagemUrl : `./${p.imagemUrl}`,
    imagemUrlOriginal: p.imagemUrl || '',
    active: p.ativo,
    // Ilustração de reserva para produtos sem foto (ex.: bebidas)
    emoji: p.categoria === 'BEBIDA' ? '🥤' : '🍕',
    accent: p.categoria === 'BEBIDA' ? '#7b5bd9' : '#e77b35',
  };
}

function montarQuery(parametros) {
  const query = new URLSearchParams();
  for (const [chave, valor] of Object.entries(parametros)) {
    if (valor) query.set(chave, valor);
  }
  const texto = query.toString();
  return texto ? `?${texto}` : '';
}

// ---------- Endpoints ----------
export const api = {
  // Produtos (público)
  products: async ({ busca, categoria } = {}) =>
    (await request(`/api/produtos${montarQuery({ busca, categoria })}`)).map(paraProduto),

  // Autenticação
  register: (dados) => request('/api/auth/registrar', { method: 'POST', body: dados }),
  login: (email, senha) => request('/api/auth/entrar', { method: 'POST', body: { email, senha } }),
  logout: () => request('/api/auth/sair', { method: 'POST' }),
  me: () => request('/api/auth/eu'),

  // Perfil
  updateProfile: (dados) => request('/api/perfil', { method: 'PUT', body: dados }),

  // Endereços
  addresses: () => request('/api/enderecos'),
  createAddress: (dados) => request('/api/enderecos', { method: 'POST', body: dados }),
  updateAddress: (id, dados) =>
    request(`/api/enderecos/${encodeURIComponent(id)}`, { method: 'PUT', body: dados }),
  deleteAddress: (id) => request(`/api/enderecos/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  // Pedidos do cliente
  orders: () => request('/api/pedidos'),
  createOrder: (dados) => request('/api/pedidos', { method: 'POST', body: dados }),
  order: (id) => request(`/api/pedidos/${encodeURIComponent(id)}`),

  // Administração
  adminProducts: async (busca) =>
    (await request(`/api/admin/produtos${montarQuery({ busca })}`)).map(paraProduto),
  createProduct: (dados) => request('/api/admin/produtos', { method: 'POST', body: dados }),
  updateProduct: (id, dados) =>
    request(`/api/admin/produtos/${encodeURIComponent(id)}`, { method: 'PUT', body: dados }),
  deleteProduct: (id) => request(`/api/admin/produtos/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  adminOrders: (status) => request(`/api/admin/pedidos${montarQuery({ status })}`),
  updateOrderStatus: (id, status) =>
    request(`/api/admin/pedidos/${encodeURIComponent(id)}/status`, { method: 'PATCH', body: { status } }),
};
