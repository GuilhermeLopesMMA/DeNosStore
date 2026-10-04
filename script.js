/* D’nós store: interações (menu, montra, detalhe do produto, mensagem de encomenda) */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  const INSTAGRAM = "@dnos.store";

  // Lê os produtos a partir do HTML (secção #produtos)
  const pecas = $$(".peca").map((li) => {
    const img = $("img", li);
    return {
      el: li,
      id: li.dataset.id,
      personaliza: (li.dataset.personaliza || "").split("|").filter(Boolean),
      nome: $(".peca__nome", li).textContent.trim(),
      desc: $(".peca__desc", li).textContent.trim(),
      src: img.getAttribute("src"),
      alt: img.getAttribute("alt"),
    };
  });

  /* Menu no telemóvel */
  const menuBotao = $(".menu-botao");
  const nav = $("#navegacao");
  const fecharMenu = () => { nav.classList.remove("aberta"); menuBotao.setAttribute("aria-expanded", "false"); };
  menuBotao.addEventListener("click", () => {
    const aberto = nav.classList.toggle("aberta");
    menuBotao.setAttribute("aria-expanded", String(aberto));
  });
  $$("a", nav).forEach((a) => a.addEventListener("click", fecharMenu));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") fecharMenu(); });

  /* Montra do início: miniaturas redondas trocam a peça na janela da caixa */
  const montraImg = $("#montra-img");
  const montraNome = $("#montra-nome");
  const miniaturas = $(".miniaturas");
  const ordemMontra = ["imanes", "quadros", "missangas", "bases", "linha", "cartas"];
  ordemMontra
    .map((id) => pecas.find((p) => p.id === id))
    .filter(Boolean)
    .forEach((p, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "miniatura";
      b.setAttribute("aria-pressed", String(i === 0));
      b.setAttribute("aria-label", p.nome);
      b.innerHTML = `<img src="${p.src}" alt="" width="52" height="52">`;
      b.addEventListener("click", () => {
        $$(".miniatura", miniaturas).forEach((m) => m.setAttribute("aria-pressed", "false"));
        b.setAttribute("aria-pressed", "true");
        montraImg.style.animation = "none"; // a animação de entrada não deve sobrepor-se à troca
        void montraImg.offsetWidth;
        montraImg.style.opacity = "0";
        setTimeout(() => {
          montraImg.src = p.src;
          montraImg.alt = p.alt;
          montraNome.textContent = p.nome;
          montraImg.style.opacity = "1";
        }, 200);
      });
      miniaturas.appendChild(b);
    });

  /* Detalhe do produto (janela de diálogo) */
  const dialogo = $("#detalhe");
  let pecaAtual = null;
  const abrirDetalhe = (p) => {
    pecaAtual = p;
    $("#detalhe-img").src = p.src;
    $("#detalhe-img").alt = p.alt;
    $("#detalhe-nome").textContent = p.nome;
    $("#detalhe-desc").textContent = p.desc;
    $("#detalhe-lista").innerHTML = p.personaliza.map((t) => `<li>${t}</li>`).join("");
    if (typeof dialogo.showModal === "function") dialogo.showModal();
    else dialogo.setAttribute("open", "");
  };
  const fecharDetalhe = () => (dialogo.close ? dialogo.close() : dialogo.removeAttribute("open"));
  pecas.forEach((p) => $(".peca__botao", p.el).addEventListener("click", () => abrirDetalhe(p)));
  $("#detalhe-fechar").addEventListener("click", fecharDetalhe);
  dialogo.addEventListener("click", (e) => { if (e.target === dialogo) fecharDetalhe(); });
  $("#detalhe-pedir").addEventListener("click", () => {
    fecharDetalhe();
    selectPeca.value = pecaAtual.nome;
    atualizarMensagem();
    $("#encomendar").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    setTimeout(() => $("#f-para").focus({ preventScroll: true }), 450);
  });

  /* Mensagem de encomenda */
  const form = $("#formulario");
  const selectPeca = $("#f-peca");
  const outra = selectPeca.querySelector('option[value="Outra ideia"]');
  pecas.forEach((p) => {
    const o = document.createElement("option");
    o.value = p.nome;
    o.textContent = p.nome;
    selectPeca.insertBefore(o, outra);
  });

  const saida = $("#mensagem");
  const formatarData = (v) => {
    if (!v) return "";
    const [a, m, d] = v.split("-");
    return `${d}/${m}/${a}`;
  };

  function construirMensagem() {
    const f = Object.fromEntries(new FormData(form));
    const linhas = ["Olá, D’nós store! 🧸"];
    if (f.peca === "Outra ideia") linhas.push("Tenho uma ideia para uma peça personalizada.");
    else if (f.peca) linhas.push(`Gostava de encomendar: ${f.peca}.`);
    else linhas.push("Gostava de encomendar uma peça personalizada.");

    const detalhes = [
      ["Para quem", f.para],
      ["Ocasião", f.ocasiao],
      ["Nomes, datas ou texto", f.texto],
      ["Cores", f.cores],
      ["Preciso até", formatarData(f.data)],
    ].filter(([, v]) => v && v.trim());
    if (detalhes.length) {
      linhas.push("");
      detalhes.forEach(([k, v]) => linhas.push(`• ${k}: ${v.trim()}`));
    }
    if (f.notas && f.notas.trim()) {
      linhas.push("", f.notas.trim());
    }
    linhas.push("", "Fico a aguardar, obrigado/a!");
    return linhas.join("\n");
  }
  function atualizarMensagem() {
    saida.textContent = construirMensagem();
    estado.textContent = "";
    copiar.textContent = "Copiar mensagem";
  }

  const estado = $("#estado");
  const copiar = $("#copiar");
  form.addEventListener("input", atualizarMensagem);
  form.addEventListener("submit", (e) => e.preventDefault());

  copiar.addEventListener("click", async () => {
    const texto = construirMensagem();
    let ok = false;
    try {
      await navigator.clipboard.writeText(texto);
      ok = true;
    } catch {
      const ta = document.createElement("textarea");
      ta.value = texto;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { ok = document.execCommand("copy"); } catch { ok = false; }
      ta.remove();
    }
    if (ok) {
      copiar.textContent = "Mensagem copiada";
      estado.textContent = `Agora abre a conversa com ${INSTAGRAM} e cola a mensagem.`;
    } else {
      estado.textContent = "Não foi possível copiar automaticamente. Seleciona o texto acima e copia-o à mão.";
    }
  });

  atualizarMensagem();

  /* Ano no rodapé */
  $("#ano").textContent = new Date().getFullYear();
})();
