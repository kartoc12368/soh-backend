import { Injectable } from '@nestjs/common';

import { Fundraiser } from 'src/shared/entity/fundraiser.entity';

import { DataSource, Repository } from 'typeorm';

@Injectable()
export class FundRaiserRepository extends Repository<Fundraiser> {
  constructor(private dataSource: DataSource) {
    super(Fundraiser, dataSource.createEntityManager());
  }
}
