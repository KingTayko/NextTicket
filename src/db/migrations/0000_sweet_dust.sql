CREATE TABLE "chamadas" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"data" timestamp DEFAULT now(),
	"descricao_problema" text NOT NULL,
	"status" text,
	"nome_tecnico" text
);
--> statement-breakpoint
CREATE TABLE "usuario" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" text NOT NULL,
	"rua" text NOT NULL,
	"cidade" text NOT NULL,
	"estado" text NOT NULL,
	"numero" text NOT NULL,
	"complemento" text
);
--> statement-breakpoint
ALTER TABLE "chamadas" ADD CONSTRAINT "chamadas_user_id_usuario_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."usuario"("id") ON DELETE no action ON UPDATE no action;