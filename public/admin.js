const lista = document.getElementById("listaContatos");
const pesquisa = document.getElementById("pesquisa");

let senha = sessionStorage.getItem("senha") || "";
let contatos = [];

function esc(texto) {
    return String(texto ?? "").replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
}

async function api(caminho, opcoes = {}) {
    if (!senha) senha = prompt("Senha de administrador:") || "";

    const resposta = await fetch(caminho, {
        ...opcoes,
        headers: { ...(opcoes.headers || {}), "x-admin-password": senha }
    });

    if (resposta.status === 401) {
        senha = "";
        sessionStorage.removeItem("senha");
        throw new Error("Senha incorreta. Recarregue a página.");
    }

    if (!resposta.ok) throw new Error("Erro no servidor.");

    sessionStorage.setItem("senha", senha);
    return resposta.json();
}

async function carregar() {
    try {
        contatos = await api("/contatos");
        mostrar(contatos);
    } catch (erro) {
        lista.textContent = erro.message;
    }
}

function mostrar(itens) {
    lista.innerHTML = itens.map(function (c) {
        return `
            <div class="contato">
                <h3>${esc(c.nome)}</h3>
                <p><strong>Telefone:</strong> ${esc(c.telefone)}</p>
                <p><strong>Cidade:</strong> ${esc(c.cidade)}</p>
                <p><strong>Descrição:</strong> ${esc(c.descricao)}</p>
                <p><strong>Responsável:</strong> ${esc(c.responsavel)}</p>
                <p><strong>Contato:</strong> ${esc(c.contatoResponsavel)}</p>
                <button class="btn-excluir" data-id="${esc(c.id)}">Excluir</button>
            </div>`;
    }).join("");
}

lista.addEventListener("click", async function (event) {
    const botao = event.target.closest(".btn-excluir");
    if (!botao || !confirm("Excluir este contato?")) return;

    try {
        await api("/contatos/" + botao.dataset.id, { method: "DELETE" });
        carregar();
    } catch (erro) {
        alert(erro.message);
    }
});

pesquisa.addEventListener("input", function () {
    const texto = pesquisa.value.toLowerCase();

    mostrar(contatos.filter(function (c) {
        return [c.nome, c.cidade, c.responsavel].some(function (campo) {
            return (campo || "").toLowerCase().includes(texto);
        });
    }));
});

carregar();