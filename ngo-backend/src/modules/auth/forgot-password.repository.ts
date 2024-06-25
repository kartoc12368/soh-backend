import { Injectable } from '@nestjs/common';

import { DataSource, Repository } from 'typeorm';

import { ErrorResponseUtility } from 'src/shared/utility/error-response.utility';
import { ResetPassword } from 'src/shared/entity/reset-password.entity';

@Injectable()
export class ForgottenPasswordRepository extends Repository<ResetPassword> {
  constructor(private dataSource: DataSource) {
    super(ResetPassword, dataSource.createEntityManager());
  }

  async createForgottenPassword(email, randomstring) {
    try {
      let forgotPassword = new ResetPassword();

      const expireTime = new Date().getTime() + 15 * 60000;

      forgotPassword.email = email;
      forgotPassword.otp = randomstring;
      forgotPassword.expireAt = expireTime;

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

  async updateOtp(id, setObj: Object) {
    try {
      return await this.update(id, setObj);
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }
}
