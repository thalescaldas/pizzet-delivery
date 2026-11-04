#!/bin/bash
mkdir -p "${1:-tests/saida}"
# Teste ponta a ponta da API com curl (cookie jar = sessão do navegador)
A=http://localhost:5039; S=${1:-tests/saida}; ADM_PASS=$PIZZET_ADMIN_SENHA
C="$S/cli.jar"; C2="$S/cli2.jar"; AD="$S/adm.jar"; rm -f $C $C2 $AD
H=(-H "Content-Type: application/json" -H "X-PizzET-Csrf: 1")
req(){ # metodo url jar corpo
  local out; out=$(curl -s -o $S/_r.json -w "%{http_code}" -X "$1" "$A$2" -b "$3" -c "$3" "${H[@]}" ${4:+-d "$4"}); echo "$out $(head -c 260 $S/_r.json)"; }
t(){ echo "== $1"; shift; req "$@"; echo; }
t "CSRF: POST sem cabeçalho -> 400" ; curl -s -w " %{http_code}\n" -X POST $A/api/auth/entrar -H "Content-Type: application/json" -d '{}' | tail -c 120; echo
t "eu sem login -> 204" GET /api/auth/eu $C
t "registro CPF inválido -> 400" POST /api/auth/registrar $C '{"nome":"Ana Teste","cpf":"111.111.111-11","telefone":"(61) 99999-8888","email":"ana@teste.dev","senha":"senha1234"}'
t "registro nome com número -> 400" POST /api/auth/registrar $C '{"nome":"Ana 123","cpf":"529.982.247-25","telefone":"(61) 99999-8888","email":"ana@teste.dev","senha":"senha1234"}'
t "registro senha fraca -> 400" POST /api/auth/registrar $C '{"nome":"Ana Teste","cpf":"529.982.247-25","telefone":"(61) 99999-8888","email":"ana@teste.dev","senha":"aaaaaaaa"}'
t "registro OK -> 200 (já logado)" POST /api/auth/registrar $C '{"nome":"Ana Teste","cpf":"529.982.247-25","telefone":"(61) 99999-8888","email":"ana@teste.dev","senha":"senha1234"}'
t "registro CPF repetido -> 409" POST /api/auth/registrar $C2 '{"nome":"Bia Teste","cpf":"52998224725","telefone":"61988887777","email":"bia@teste.dev","senha":"senha1234"}'
t "registro e-mail repetido -> 400" POST /api/auth/registrar $C2 '{"nome":"Bia Teste","cpf":"390.533.447-05","telefone":"61988887777","email":"ANA@teste.dev","senha":"senha1234"}'
t "eu (Ana) -> 200" GET /api/auth/eu $C
t "cliente acessa admin -> 403" GET /api/admin/produtos $C
t "endereço CEP inválido -> 400" POST /api/enderecos $C '{"cep":"7004","logradouro":"Rua das Estrelas","numero":"42","bairro":"Centro","cidade":"Brasília","uf":"DF"}'
t "endereço OK -> 201" POST /api/enderecos $C '{"cep":"70040-010","logradouro":"Rua das Estrelas","numero":"42","bairro":"Centro","cidade":"Brasília","uf":"df"}'
END_ID=$(python3 -c "import json;print(json.load(open('$S/_r.json'))['id'])")
t "pedido com preço adulterado (ignorado) -> 201" POST /api/pedidos $C "{\"enderecoId\":$END_ID,\"formaPagamento\":\"PIX\",\"itens\":[{\"produtoId\":1,\"quantidade\":2,\"preco\":0.01},{\"produtoId\":8,\"quantidade\":1}],\"total\":1}"
PED=$(python3 -c "import json;d=json.load(open('$S/_r.json'));print(d['id']);import sys;print('subtotal',d['subtotal'],'taxa',d['taxaEntrega'],'total',d['total'],'status',d['status'],file=sys.stderr)")
t "pedido produto inativo -> 400" POST /api/pedidos $C "{\"enderecoId\":$END_ID,\"formaPagamento\":\"PIX\",\"itens\":[{\"produtoId\":11,\"quantidade\":1}]}"
t "pedido quantidade 0 -> 400" POST /api/pedidos $C "{\"enderecoId\":$END_ID,\"formaPagamento\":\"PIX\",\"itens\":[{\"produtoId\":1,\"quantidade\":0}]}"
t "pedido pagamento inválido -> 400" POST /api/pedidos $C "{\"enderecoId\":$END_ID,\"formaPagamento\":\"BITCOIN\",\"itens\":[{\"produtoId\":1,\"quantidade\":1}]}"
t "meus pedidos -> 200" GET /api/pedidos $C
t "Bia registra -> 200" POST /api/auth/registrar $C2 '{"nome":"Bia Teste","cpf":"390.533.447-05","telefone":"61988887777","email":"bia@teste.dev","senha":"senha1234"}'
t "Bia vê pedido da Ana -> 404" GET /api/pedidos/$PED $C2
t "Bia usa endereço da Ana -> 404" POST /api/pedidos $C2 "{\"enderecoId\":$END_ID,\"formaPagamento\":\"PIX\",\"itens\":[{\"produtoId\":1,\"quantidade\":1}]}"
t "Bia apaga endereço da Ana -> 404" DELETE /api/enderecos/$END_ID $C2
t "login senha errada -> 401" POST /api/auth/entrar $AD '{"email":"admin@pizzet.dev","senha":"errada123"}'
t "login admin -> 200" POST /api/auth/entrar $AD "{\"email\":\"admin@pizzet.dev\",\"senha\":\"$ADM_PASS\"}"
t "admin lista produtos (11, inclui inativo)" GET /api/admin/produtos $AD
t "admin cria produto -> 201" POST /api/admin/produtos $AD '{"nome":"Pizza Saturno","descricao":"Teste","categoria":"premium","preco":72.5,"imagemUrl":"assets/pizza-5.webp","ativo":true}'
NP=$(python3 -c "import json;print(json.load(open('$S/_r.json'))['id'])")
t "admin cria nome duplicado -> 409" POST /api/admin/produtos $AD '{"nome":"Pizza Saturno","categoria":"PREMIUM","preco":10}'
t "admin preço negativo -> 400" POST /api/admin/produtos $AD '{"nome":"Pizza X","categoria":"PREMIUM","preco":-1}'
t "admin imagem javascript: -> 400" POST /api/admin/produtos $AD '{"nome":"Pizza Y","categoria":"PREMIUM","preco":10,"imagemUrl":"javascript:alert(1)"}'
t "admin edita preço -> 200" PUT /api/admin/produtos/$NP $AD '{"nome":"Pizza Saturno","descricao":"Editada","categoria":"PREMIUM","preco":70,"imagemUrl":"assets/pizza-5.webp","ativo":true}'
t "admin desativa -> 204" DELETE /api/admin/produtos/$NP $AD
t "público não vê desativado -> 404" GET /api/produtos/$NP $C
t "admin vê pedido da Ana -> 200" GET /api/pedidos/$PED $AD
t "status pulando etapa (RECEBIDO->ENTREGUE) -> 409" PATCH /api/admin/pedidos/$PED/status $AD '{"status":"ENTREGUE"}'
t "status -> EM_PREPARO" PATCH /api/admin/pedidos/$PED/status $AD '{"status":"em_preparo"}'
t "status -> SAIU_PARA_ENTREGA" PATCH /api/admin/pedidos/$PED/status $AD '{"status":"SAIU_PARA_ENTREGA"}'
t "cancelar após sair -> 409" PATCH /api/admin/pedidos/$PED/status $AD '{"status":"CANCELADO"}'
t "status -> ENTREGUE" PATCH /api/admin/pedidos/$PED/status $AD '{"status":"ENTREGUE"}'
t "Ana vê status ENTREGUE" GET /api/pedidos/$PED $C
t "admin lista pedidos ENTREGUE" GET "/api/admin/pedidos?status=ENTREGUE" $AD
t "perfil: Ana muda telefone" PUT /api/perfil $C '{"nome":"Ana Maria Teste","telefone":"(61) 3333-4444"}'
t "logout Ana -> 204" POST /api/auth/sair $C
t "após logout, pedidos -> 401" GET /api/pedidos $C
t "front servido: / -> 200" GET / $C
