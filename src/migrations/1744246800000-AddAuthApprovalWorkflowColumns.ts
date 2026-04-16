import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAuthApprovalWorkflowColumns1744246800000
  implements MigrationInterface
{
  name = "AddAuthApprovalWorkflowColumns1744246800000";
  transaction = false;

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "refresh_token_hash" character varying
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "rejection_reason" text
    `);

    await queryRunner.query(`
      ALTER TABLE "documents"
      ADD COLUMN IF NOT EXISTS "rejection_reason" text
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = current_schema()
            AND table_name = 'users'
            AND column_name = 'role'
            AND is_nullable = 'NO'
        ) THEN
          ALTER TABLE "users" ALTER COLUMN "role" DROP NOT NULL;
        END IF;
      END
      $$;
    `);

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
        WHERE c.relname = 'users'
          AND a.attname = 'account_status'
          AND a.attnum > 0
          AND NOT a.attisdropped
        LIMIT 1;

        IF enum_type IS NOT NULL THEN
          EXECUTE format(
            'ALTER TYPE %I.%I ADD VALUE IF NOT EXISTS %L',
            enum_schema,
            enum_type,
            'PENDING_APPROVAL'
          );

          EXECUTE format(
            'ALTER TYPE %I.%I ADD VALUE IF NOT EXISTS %L',
            enum_schema,
            enum_type,
            'REJECTED'
          );
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "account_status" SET DEFAULT 'PENDING_APPROVAL'
    `);

    await queryRunner.query(`
      ALTER TABLE "documents"
      ALTER COLUMN "file_url" DROP NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
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
        WHERE c.relname = 'users'
          AND a.attname = 'account_status'
          AND a.attnum > 0
          AND NOT a.attisdropped
        LIMIT 1;

        IF enum_type IS NOT NULL AND EXISTS (
          SELECT 1
          FROM pg_enum e
          JOIN pg_type t2 ON t2.oid = e.enumtypid
          JOIN pg_namespace n2 ON n2.oid = t2.typnamespace
          WHERE n2.nspname = enum_schema
            AND t2.typname = enum_type
            AND e.enumlabel = 'PENDING_SIGNATURE'
        ) THEN
          ALTER TABLE "users"
          ALTER COLUMN "account_status" SET DEFAULT 'PENDING_SIGNATURE';
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM "documents"
          WHERE "file_url" IS NULL
        ) THEN
          ALTER TABLE "documents"
          ALTER COLUMN "file_url" SET NOT NULL;
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`
      ALTER TABLE "documents"
      DROP COLUMN IF EXISTS "rejection_reason"
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN IF EXISTS "rejection_reason"
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN IF EXISTS "refresh_token_hash"
    `);
  }
}
