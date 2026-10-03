require("dotenv").config();
const path = require("path");
const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const ws = require("ws");

const { SUPABASE_URL, SUPABASE_SECRET_KEY, ADMIN_PASSWORD } = process.env;

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY || !ADMIN_PASSWORD) {
    console.error("Faltam variáveis: SUPABASE_URL, SUPABASE_SECRET_KEY e ADMIN_PASSWORD");
    process.exit(1);
}

const app = express();

app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "public")));

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
    realtime: { transport: ws }
});

function exigirSenha(req, res, next) {
    if (req.get("x-admin-password") !== ADMIN_PASSWORD) {
        return res.status(401).json({ erro: "Não autorizado" });
    }
    next();
}

const limpar = (valor, max) => String(valor ?? "").trim().slice(0, max);

function paraCamelCase(linha) {
    return {
        id: linha.id,
        nome: linha.nome,
        telefone: linha.telefone,
        cidade: linha.cidade,
        descricao: linha.descricao,
        responsavel: linha.responsavel,
        contatoResponsavel: linha.contato_responsavel
    };
}

app.get("/contatos", exigirSenha, async (req, res) => {
    const { data, error } = await supabase
        .from("contatos")
        .select("*")
        .order("id", { ascending: false });

    if (error) {
        console.error(error);
        return res.status(500).json({ erro: "Erro ao buscar contatos" });
    }

    res.json(data.map(paraCamelCase));
});

app.post("/contatos", async (req, res) => {
    const novo = {
        nome: limpar(req.body.nome, 100),
        telefone: limpar(req.body.telefone, 30),
        cidade: limpar(req.body.cidade, 100),
        descricao: limpar(req.body.descricao, 1000),
        responsavel: limpar(req.body.responsavel, 100),
        contato_responsavel: limpar(req.body.contatoResponsavel, 30)
    };

    if (!novo.nome || !novo.telefone) {
        return res.status(400).json({ erro: "Nome e telefone são obrigatórios" });
    }

    const { error } = await supabase.from("contatos").insert([novo]);

    if (error) {
        console.error(error);
        return res.status(500).json({ erro: "Erro ao salvar contato" });
    }

    res.status(201).json({ ok: true });
});

app.delete("/contatos/:id", exigirSenha, async (req, res) => {
    const { error } = await supabase
        .from("contatos")
        .delete()
        .eq("id", req.params.id);

    if (error) {
        console.error(error);
        return res.status(500).json({ erro: "Erro ao excluir contato" });
    }

    res.json({ mensagem: "Contato excluído com sucesso" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});