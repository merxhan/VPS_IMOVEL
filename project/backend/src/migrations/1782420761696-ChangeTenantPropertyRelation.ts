import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeTenantPropertyRelation1782420761696 implements MigrationInterface {
    name = 'ChangeTenantPropertyRelation1782420761696'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "inquilinos" DROP CONSTRAINT "FK_00a2aa4193c211d03a76efcf8c5"`);
        await queryRunner.query(`ALTER TABLE "inquilinos" DROP COLUMN "propertyId"`);
        await queryRunner.query(`ALTER TABLE "inmuebles" ADD "tenantId" uuid`);
        await queryRunner.query(`ALTER TABLE "inmuebles" ADD CONSTRAINT "FK_a5c3e24baec9d31e5881ff4a8fd" FOREIGN KEY ("tenantId") REFERENCES "inquilinos"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "inmuebles" DROP CONSTRAINT "FK_a5c3e24baec9d31e5881ff4a8fd"`);
        await queryRunner.query(`ALTER TABLE "inmuebles" DROP COLUMN "tenantId"`);
        await queryRunner.query(`ALTER TABLE "inquilinos" ADD "propertyId" uuid`);
        await queryRunner.query(`ALTER TABLE "inquilinos" ADD CONSTRAINT "FK_00a2aa4193c211d03a76efcf8c5" FOREIGN KEY ("propertyId") REFERENCES "inmuebles"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
