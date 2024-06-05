import { Injectable } from '@nestjs/common';

import { DataSource, Repository } from 'typeorm';

import { ForgottenPassword } from 'src/shared/entity/forgot-password.entity';
import { ErrorResponseUtility } from 'src/shared/utility/error-response.utility';

@Injectable()
export class ForgottenPasswordRepository extends Repository<ForgottenPassword> {
  constructor(private dataSource: DataSource) {
    super(ForgottenPassword, dataSource.createEntityManager());
  }

  async createForgottenPassword(email, randomstring) {
    try {
      let forgotPassword = new ForgottenPassword();

      forgotPassword.email = email;

      forgotPassword.new_password_token = randomstring;

      await this.save(forgotPassword);
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async getFundraiserByOtp(obj: object) {
    try {
      return await this.findOne(obj);
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async deleteOtp(user2) {
    try {
      await this.remove(user2);
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async getAllOtp(obj?: object) {
    try {
      return await this.find(obj);
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }
}
