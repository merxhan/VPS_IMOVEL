import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveLeads1718749870000 implements MigrationInterface {
    name = 'RemoveLeads1718749870000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key if exists
        await queryRunner.query(`ALTER TABLE "documentos" DROP CONSTRAINT IF EXISTS "FK_b251bd46eefdb4fb6a34c9c10bd"`); // This is an assumed generic name, but TypeORM will drop column cleanly if we do it. Better to just drop the column and cascade.
        await queryRunner.query(`ALTER TABLE "documentos" DROP COLUMN IF EXISTS "leadId" CASCADE`);
        
        // Drop tables
        await queryRunner.query(`DROP TABLE IF EXISTS "lead_notes" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "leads" CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Down migration omitted for simplicity as this is a complete feature removal
    }
}
