import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1782325118341 implements MigrationInterface {
    name = 'InitialSchema1782325118341'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "usuarios" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "phone" character varying NOT NULL, "password" character varying NOT NULL, "name" character varying NOT NULL, "role" character varying NOT NULL DEFAULT 'USER', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_2514d37d064085405337e3cf0b7" UNIQUE ("phone"), CONSTRAINT "PK_d7281c63c176e152e4c531594a8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "documentos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "filePath" character varying NOT NULL, "mimeType" character varying NOT NULL, "fileSize" integer NOT NULL, "propertyId" uuid, "tenantId" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_30b7ee230a352e7582842d1dc02" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "inquilinos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "email" character varying NOT NULL, "phone" character varying NOT NULL, "documentType" character varying NOT NULL, "documentValue" character varying NOT NULL, "contractStart" date, "contractEnd" date, "propertyId" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_39aad3bb882f88fd66600174690" UNIQUE ("documentValue"), CONSTRAINT "PK_18584087b5524c28000808c161b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "inmuebles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "address" character varying NOT NULL, "cep" character varying, "rentValue" numeric(10,2) NOT NULL, "status" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ab1c553f1f68daa577fd4ae72c0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "documentos" ADD CONSTRAINT "FK_bb483423dd570142a1017405550" FOREIGN KEY ("propertyId") REFERENCES "inmuebles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "documentos" ADD CONSTRAINT "FK_2b0ff8f3d2cc9dd63231c2b9cdd" FOREIGN KEY ("tenantId") REFERENCES "inquilinos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "inquilinos" ADD CONSTRAINT "FK_00a2aa4193c211d03a76efcf8c5" FOREIGN KEY ("propertyId") REFERENCES "inmuebles"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "inquilinos" DROP CONSTRAINT "FK_00a2aa4193c211d03a76efcf8c5"`);
        await queryRunner.query(`ALTER TABLE "documentos" DROP CONSTRAINT "FK_2b0ff8f3d2cc9dd63231c2b9cdd"`);
        await queryRunner.query(`ALTER TABLE "documentos" DROP CONSTRAINT "FK_bb483423dd570142a1017405550"`);
        await queryRunner.query(`DROP TABLE "inmuebles"`);
        await queryRunner.query(`DROP TABLE "inquilinos"`);
        await queryRunner.query(`DROP TABLE "documentos"`);
        await queryRunner.query(`DROP TABLE "usuarios"`);
    }

}
