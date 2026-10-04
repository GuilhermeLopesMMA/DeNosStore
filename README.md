# D’nós store · site

Site estático: não precisa de servidor, base de dados nem build. Basta abrir o `index.html`.

## Estrutura
- `index.html`: conteúdo (textos, produtos, perguntas)
- `styles.css`: cores e layout (as cores estão no topo, em `:root`)
- `script.js`: menu, montra do início, janela de detalhe e mensagem de encomenda
- `assets/`: logótipo, fotografias e fontes (alojadas localmente)

## Trocar fotografias
As fotos atuais foram recortadas de uma captura de ecrã do Instagram, por isso têm pouca resolução.
Substitui os ficheiros em `assets/` pelas fotos originais com **o mesmo nome**
(`quadros.jpg`, `linha.jpg`, `imanes.jpg`, `missangas.jpg`, `bases.jpg`, `cartas.jpg`, `embalagem.jpg`).
Proporção ideal: 5:6 (ex.: 1000 × 1200 px).

## Acrescentar um produto
No `index.html`, na secção `#produtos`, copia um `<li class="peca">` e muda o `data-id`,
o `data-personaliza` (opções separadas por `|`), a imagem, o `alt`, o nome e a descrição.
A montra do início, a janela de detalhe e o formulário de encomenda atualizam-se sozinhos.
Para a peça aparecer nas miniaturas do início, junta o `data-id` a `ordemMontra` no `script.js`.

## Publicar
Qualquer alojamento estático serve: GitHub Pages, Netlify ou Cloudflare Pages (arrastar a pasta).
Depois de ter domínio, troca `assets/og.jpg` na meta `og:image` pelo URL completo, para a pré-visualização funcionar quando o link é partilhado.
