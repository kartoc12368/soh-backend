import { MigrationInterface, QueryRunner } from "typeorm";

export class ImagesTable1718185375882 implements MigrationInterface {
    name = 'ImagesTable1718185375882'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fundraiser_page" DROP COLUMN "supporters"`);
        await queryRunner.query(`ALTER TABLE "fundraiser_page" DROP COLUMN "gallery"`);
        await queryRunner.query(`ALTER TABLE "fundraiser" DROP COLUMN "total_amount_raised"`);
        await queryRunner.query(`ALTER TABLE "fundraiser" DROP COLUMN "total_donations"`);
        await queryRunner.query(`ALTER TABLE "fundraiser_campaign_images" ADD "image_url" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "fundraiser_campaign_images" ADD "fundraiser_id" uuid`);
        await queryRunner.query(`ALTER TABLE "fundraiser_campaign_images" ADD CONSTRAINT "FK_d6e6ca6e5fdd3aae22fa1165f94" FOREIGN KEY ("fundraiser_id") REFERENCES "fundraiser"("fundraiser_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fundraiser_campaign_images" DROP CONSTRAINT "FK_d6e6ca6e5fdd3aae22fa1165f94"`);
        await queryRunner.query(`ALTER TABLE "fundraiser_campaign_images" DROP COLUMN "fundraiser_id"`);
        await queryRunner.query(`ALTER TABLE "fundraiser_campaign_images" DROP COLUMN "image_url"`);
        await queryRunner.query(`ALTER TABLE "fundraiser" ADD "total_donations" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "fundraiser" ADD "total_amount_raised" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "fundraiser_page" ADD "gallery" text array`);
        await queryRunner.query(`ALTER TABLE "fundraiser_page" ADD "supporters" text array`);
    }

}
