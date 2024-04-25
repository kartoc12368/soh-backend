import { Injectable } from '@nestjs/common';

import { DataSource, Repository } from 'typeorm';

import { FundraiserPage } from 'src/shared/entity/fundraiser-page.entity';

@Injectable()
export class FundraiserPageRepository extends Repository<FundraiserPage> {
  constructor(private dataSource: DataSource) {
    super(FundraiserPage, dataSource.createEntityManager());
  }
  async getFundraiserPage(id: string): Promise<FundraiserPage> {
    try {
      return await this.findOne({ where: { id: id }, relations: ['fundraiser'] });
    } catch (error) {
      console.log(error);
    }
  }
}
