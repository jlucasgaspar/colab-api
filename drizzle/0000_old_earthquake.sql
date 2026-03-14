CREATE TYPE "public"."priority" AS ENUM('BAIXA', 'MEDIA', 'ALTA');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('NA_FILA', 'EM_TRIAGEM', 'EM_PROGRESSO', 'CONCLUIDO', 'NEGADO');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('USER', 'ADMIN');--> statement-breakpoint
CREATE TABLE "reports" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"location" text NOT NULL,
	"image_url" text,
	"category" text,
	"priority" "priority",
	"technical_summary" text,
	"status" "report_status" DEFAULT 'NA_FILA' NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"role" "role" DEFAULT 'USER' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;