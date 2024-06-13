import { Injectable } from '@nestjs/common';

import { DataSource, Repository } from 'typeorm';

import { FundraiserCampaignImages } from 'src/shared/entity/fundraiser-campaign-images.entity';
import { ErrorResponseUtility } from 'src/shared/utility/error-response.utility';

@Injectable()
export class FundraiserCampaignImagesRepository extends Repository<FundraiserCampaignImages> {
  constructor(private dataSource: DataSource) {
    super(FundraiserCampaignImages, dataSource.createEntityManager());
  }

  async getFundraiserByImage(dataId) {
    try {
      return await this.findOne({ where: { image_url: dataId }, relations: ['fundraiser_page'] });
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }
}
