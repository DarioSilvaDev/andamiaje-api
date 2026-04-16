import { MigrationInterface, QueryRunner } from "typeorm";

export class AddExtendedFormsAndReviewAudit1744800000000
  implements MigrationInterface
{
  name = "AddExtendedFormsAndReviewAudit1744800000000";
  transaction = false;

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      DECLARE
        enum_schema text;
        enum_type text;
      BEGIN
        SELECT n.nspname, t.typname
          INTO enum_schema, enum_type
        FROM pg_attribute a
        JOIN pg_class c ON c.oid = a.attrelid
        JOIN pg_type t ON t.oid = a.atttypid
        JOIN pg_namespace n ON n.oid = t.typnamespace
        WHERE c.relname = 'forms'
          AND a.attname = 'type'
          AND a.attnum > 0
          AND NOT a.attisdropped
        LIMIT 1;

        IF enum_type IS NOT NULL THEN
          EXECUTE format(
            'ALTER TYPE %I.%I ADD VALUE IF NOT EXISTS %L',
            enum_schema,
            enum_type,
            'REPORTE_MENSUAL'
          );

          EXECUTE format(
            'ALTER TYPE %I.%I ADD VALUE IF NOT EXISTS %L',
            enum_schema,
            enum_type,
            'SEGUIMIENTO_ACOMPANIANTE_EXTERNO'
          );

          EXECUTE format(
            'ALTER TYPE %I.%I ADD VALUE IF NOT EXISTS %L',
            enum_schema,
            enum_type,
            'SEGUIMIENTO_FAMILIA'
          );

          EXECUTE format(
            'ALTER TYPE %I.%I ADD VALUE IF NOT EXISTS %L',
            enum_schema,
            enum_type,
            'FACTURA'
          );
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "monthly_reports" (
        "id" SERIAL PRIMARY KEY,
        "form_id" integer NOT NULL,
        "professional_id" integer,
        "period" character varying(50) NOT NULL,
        "activities" text NOT NULL,
        "progress" text NOT NULL,
        "observations" text NOT NULL,
        CONSTRAINT "FK_monthly_reports_form"
          FOREIGN KEY ("form_id") REFERENCES "forms"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_monthly_reports_professional"
          FOREIGN KEY ("professional_id") REFERENCES "users"("id") ON DELETE SET NULL
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "companion_followups" (
        "id" SERIAL PRIMARY KEY,
        "form_id" integer NOT NULL,
        "professional_id" integer,
        "period" character varying(50) NOT NULL,
        "accompaniment_detail" text NOT NULL,
        "student_evolution" text NOT NULL,
        "recommendations" text NOT NULL,
        CONSTRAINT "FK_companion_followups_form"
          FOREIGN KEY ("form_id") REFERENCES "forms"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_companion_followups_professional"
          FOREIGN KEY ("professional_id") REFERENCES "users"("id") ON DELETE SET NULL
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "family_followups" (
        "id" SERIAL PRIMARY KEY,
        "form_id" integer NOT NULL,
        "professional_id" integer,
        "period" character varying(50) NOT NULL,
        "family_context" text NOT NULL,
        "intervention_summary" text NOT NULL,
        "recommendations" text NOT NULL,
        CONSTRAINT "FK_family_followups_form"
          FOREIGN KEY ("form_id") REFERENCES "forms"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_family_followups_professional"
          FOREIGN KEY ("professional_id") REFERENCES "users"("id") ON DELETE SET NULL
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "invoice_forms" (
        "id" SERIAL PRIMARY KEY,
        "form_id" integer NOT NULL,
        "issuer_name" character varying(150) NOT NULL,
        "tax_id" character varying(30) NOT NULL,
        "billing_period" character varying(50) NOT NULL,
        "amount" numeric(12,2) NOT NULL,
        "service_description" text NOT NULL,
        CONSTRAINT "FK_invoice_forms_form"
          FOREIGN KEY ("form_id") REFERENCES "forms"("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_type
          WHERE typname = 'form_review_audits_action_enum'
        ) THEN
          CREATE TYPE "form_review_audits_action_enum" AS ENUM ('APPROVED', 'REJECTED');
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "form_review_audits" (
        "id" SERIAL PRIMARY KEY,
        "form_id" integer NOT NULL,
        "document_id" integer,
        "reviewed_by" integer NOT NULL,
        "action" "form_review_audits_action_enum" NOT NULL,
        "reason" text,
        "metadata" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "FK_form_review_audits_form"
          FOREIGN KEY ("form_id") REFERENCES "forms"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_form_review_audits_document"
          FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_form_review_audits_reviewer"
          FOREIGN KEY ("reviewed_by") REFERENCES "users"("id")
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_form_review_audits_form"
      ON "form_review_audits" ("form_id");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_form_review_audits_created_at"
      ON "form_review_audits" ("created_at");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_form_review_audits_created_at";
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_form_review_audits_form";
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS "form_review_audits";
    `);

    await queryRunner.query(`
      DROP TYPE IF EXISTS "form_review_audits_action_enum";
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS "invoice_forms";
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS "family_followups";
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS "companion_followups";
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS "monthly_reports";
    `);
  }
}
