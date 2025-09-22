import express from "express";
import { ENV } from "./config/env.js";
import { db } from "./config/db.js";
import { usuarioTable, chamadasTable } from "./db/schema.js";
import { eq } from "drizzle-orm";

import job from "./config/cron.js";

const app = express();
const PORT = ENV.PORT || 5001;

if(ENV.NODE_ENV==="production")job.start();

app.use(express.json());

/* ---------- HEALTH ---------- */
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true });
});

/* ---------- USUÁRIOS ---------- */
// Criar usuário
app.post("/api/usuarios", async (req, res) => {
  try {
    const { nome, rua, cidade, estado, numero, complemento } = req.body;
    if (!nome || !rua || !cidade || !estado || !numero) {
      return res.status(400).json({ error: "Campos obrigatórios faltando" });
    }
    const novoUsuario = await db.insert(usuarioTable).values({
      nome,
      rua,
      cidade,
      estado,
      numero,
      complemento
    }).returning();
    res.status(201).json(novoUsuario[0]);
  } catch (error) {
    console.error("Erro ao criar usuário", error);
    res.status(500).json({ error: "Erro interno" });
  }
});

// Listar todos
app.get("/api/usuarios", async (req, res) => {
  try {
    const usuarios = await db.select().from(usuarioTable);
    res.status(200).json(usuarios);
  } catch (error) {
    console.error("Erro ao buscar usuários", error);
    res.status(500).json({ error: "Erro interno" });
  }
});

// Buscar por ID
app.get("/api/usuarios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await db.select().from(usuarioTable)
      .where(eq(usuarioTable.id, parseInt(id)));
    if (!usuario.length) return res.status(404).json({ error: "Usuário não encontrado" });
    res.status(200).json(usuario[0]);
  } catch (error) {
    console.error("Erro ao buscar usuário", error);
    res.status(500).json({ error: "Erro interno" });
  }
});

/* ---------- CHAMADAS ---------- */
// Criar chamada
app.post("/api/chamadas", async (req, res) => {
  try {
    const { userId, descricaoProblema, status, nomeTecnico } = req.body;

    if (!userId || !descricaoProblema) {
      return res.status(400).json({ error: "userId e descricaoProblema são obrigatórios" });
    }

    const novaChamada = await db.insert(chamadasTable).values({
      userId,
      descricaoProblema,
      status,
      nomeTecnico
    }).returning();

    res.status(201).json(novaChamada[0]);
  } catch (error) {
    console.error("Erro ao criar chamada", error);
    res.status(500).json({ error: "Erro interno" });
  }
});

// Listar todas
app.get("/api/chamadas", async (req, res) => {
  try {
    // Fazer join entre chamadas e usuários
    const chamadas = await db
      .select({
        id: chamadasTable.id,
        descricaoProblema: chamadasTable.descricaoProblema,
        status: chamadasTable.status,
        nomeTecnico: chamadasTable.nomeTecnico,
        data: chamadasTable.data,
        userId: chamadasTable.userId,
        nomeUsuario: usuarioTable.nome, // pega o nome do usuário
      })
      .from(chamadasTable)
      .leftJoin(usuarioTable, eq(chamadasTable.userId, usuarioTable.id));

    res.status(200).json(chamadas);
  } catch (error) {
    console.error("Erro ao buscar chamadas", error);
    res.status(500).json({ error: "Erro interno" });
  }
});

// Listar chamadas de um usuário
app.get("/api/chamadas/usuario/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const chamadas = await db.select().from(chamadasTable)
      .where(eq(chamadasTable.userId, parseInt(userId)));
    res.status(200).json(chamadas);
  } catch (error) {
    console.error("Erro ao buscar chamadas do usuário", error);
    res.status(500).json({ error: "Erro interno" });
  }
});

// Atualizar status da chamada de um usuário específico (PUT)
app.put("/api/chamadas/:userId/:id", async (req, res) => {
  try {
    const { userId, id } = req.params;
    const { status, nomeTecnico } = req.body;

    const updated = await db.update(chamadasTable)
      .set({ status, nomeTecnico })
      .where(
        eq(chamadasTable.id, parseInt(id)),
        eq(chamadasTable.userId, parseInt(userId))
      )
      .returning();

    if (!updated.length) {
      return res.status(404).json({ error: "Chamada do usuário não encontrada" });
    }

    res.status(200).json(updated[0]);
  } catch (error) {
    console.error("Erro ao atualizar chamada", error);
    res.status(500).json({ error: "Erro interno" });
  }
});

// Deletar chamada
app.delete("/api/chamadas/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(chamadasTable).where(eq(chamadasTable.id, parseInt(id)));
    res.status(200).json({ message: "Chamada removida com sucesso" });
  } catch (error) {
    console.error("Erro ao remover chamada", error);
    res.status(500).json({ error: "Erro interno" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on PORT: ${PORT}`);
});
