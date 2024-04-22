import { Injectable } from '@nestjs/common';

import { DataSource, Repository } from 'typeorm';

import { ForgottenPassword } from 'src/shared/entity/forgot-password.entity';

@Injectable()
export class ForgottenPasswordRepository extends Repository<ForgottenPassword> {
  constructor(private dataSource: DataSource) {
    super(ForgottenPassword, dataSource.createEntityManager());
  }
}
