# Imagens do cardápio PizzET

22 imagens individuais geradas pela ferramenta integrada ImageGen, sem uso da API por CLI: nove pizzas salgadas, seis pizzas doces e sete bebidas sem marcas comerciais. Imagens ilustrativas de produtos fictícios.

Os arquivos PNG usam fundo transparente. A galeria `index.html` permite visualizar e baixar cada imagem. O quadriculado é desenhado pelo CSS da galeria e não faz parte dos PNGs.

`catalogo-imagens.json` relaciona os nomes dos produtos, os arquivos e os prompts exatos usados para gerar cada imagem. As pizzas compartilham iluminação, enquadramento e proporção, mas têm ingredientes específicos. As bebidas são diferenciadas por embalagem, conteúdo e cor da tampa.

As 22 imagens estão integradas ao catálogo em `js/dados.js`, nos produtos de IDs 101 a 122. Elas aparecem nos cards, nos detalhes e no carrinho. A administração permite selecionar cada imagem. O catálogo mantém também a bebida original, totalizando 23 itens. As cinco pizzas antigas com imagem repetida foram retiradas.
