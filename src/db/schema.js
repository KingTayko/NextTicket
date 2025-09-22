import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";

// Tabela de Usuários
export const usuarioTable = pgTable("usuario", {
  id: serial("id").primaryKey(),  // ID do usuário, auto-incrementado
  nome: text("nome").notNull(),   // Nome do usuário
  rua: text("rua").notNull(),     // Rua do endereço
  cidade: text("cidade").notNull(), // Cidade do endereço
  estado: text("estado").notNull(), // Estado do endereço
  numero: text("numero").notNull(), // Número do endereço
  complemento: text("complemento"), // Complemento (não obrigatório)
});

// Tabela de Chamadas
export const chamadasTable = pgTable("chamadas", {
  id: serial("id").primaryKey(),                 // ID da chamada, auto-incrementado
  userId: integer("user_id").notNull().references(() => usuarioTable.id), // ID do usuário (referência para 'usuario')
  data: timestamp("data").defaultNow(),          // Data da chamada
  descricaoProblema: text("descricao_problema").notNull(), // Descrição do problema
  status: text("status"),                        // Status da chamada (ex: "aberta", "em andamento", "fechada")
  nomeTecnico: text("nome_tecnico"),             // Nome do técnico responsável
});
