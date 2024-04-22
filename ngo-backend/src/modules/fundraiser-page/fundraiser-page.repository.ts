import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { FundraiserPage } from 'src/shared/entity/fundraiser-page.entity';

@Injectable()
export class FundraiserPageRepository extends Repository<FundraiserPage> {
  constructor(private dataSource: DataSource) {
    super(FundraiserPage, dataSource.createEntityManager());
  }
}
