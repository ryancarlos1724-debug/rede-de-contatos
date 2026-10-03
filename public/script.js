const form = document.getElementById("formContato");
const mensagem = document.getElementById("mensagem");

form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const botao = form.querySelector("button[type=submit]");
    botao.disabled = true;
    mensagem.textContent = "Enviando...";

    const contato = {
        nome: document.getElementById("nome").value,
        telefone: document.getElementById("telefone").value,
        cidade: document.getElementById("cidade").value,
        descricao: document.getElementById("descricao").value,
        responsavel: document.getElementById("responsavel").value,
        contatoResponsavel: document.getElementById("contatoResponsavel").value
    };

    try {
        const resposta = await fetch("/contatos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(contato)
        });

        if (!resposta.ok) throw new Error();

        form.reset();
        mensagem.textContent = "Contato enviado com sucesso. Obrigado!";
    } catch (erro) {
        mensagem.textContent = "Não foi possível enviar. Tente novamente.";
    } finally {
        botao.disabled = false;
    }
});