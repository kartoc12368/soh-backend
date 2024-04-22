import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Donation } from 'src/shared/entity/donation.entity';

@Injectable()
export class DonationRepository extends Repository<Donation> {
  constructor(private dataSource: DataSource) {
    super(Donation, dataSource.createEntityManager());
  }
}
