import { Injectable } from '@nestjs/common';

import { DataSource, Repository } from 'typeorm';

import { FundraiserPage } from 'src/shared/entity/fundraiser-page.entity';
import { ErrorResponseUtility } from 'src/shared/utility/error-response.utility';

@Injectable()
export class FundraiserPageRepository extends Repository<FundraiserPage> {
  constructor(private dataSource: DataSource) {
    super(FundraiserPage, dataSource.createEntityManager());
  }
  async getFundraiserPage(obj: object): Promise<FundraiserPage> {
    try {
      return await this.findOne(obj);
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async UpdateFundraiserPage(id, setObj: Object) {
    try {
      await this.update(id, setObj);
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async getAllFundraiserPages() {
    try {
      return await this.find();
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async deleteFundraiserPage(id) {
    try {
      await this.delete(id);
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async createFundraiserPage(fundRaiser) {
    try {
      const fundraiserPage: FundraiserPage = new FundraiserPage();

      fundraiserPage.supporters = [];

      fundraiserPage.gallery = [];

      fundraiserPage.fundraiser = fundRaiser;

      return await this.save(fundraiserPage);
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async getFundraiserByImage(dataId) {
    try {
      const fundraiserPage = await this.dataSource
        .getRepository(FundraiserPage)
        .createQueryBuilder('fundraiserPage')
        .leftJoinAndSelect('fundraiserPage.fundraiser', 'fundraiser')
        .where('fundraiserPage.gallery @> ARRAY[:gallery]', { gallery: dataId })
        .getOne();
      return fundraiserPage;
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }
}
