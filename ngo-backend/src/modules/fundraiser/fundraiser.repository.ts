import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';


import { Fundraiser } from 'src/shared/entity/fundraiser.entity';
import { ErrorResponseUtility } from 'src/shared/utility/error-response.utility';
import { GeneratePasswordDto } from '../admin/dto/generate-password.dto';
import { Constants } from 'src/shared/utility/constants';


@Injectable()
export class FundRaiserRepository extends Repository<Fundraiser> {
  constructor(private dataSource: DataSource) {
    super(Fundraiser, dataSource.createEntityManager());
  }

  async getFundraiser(obj: object) {
    try {
      return await this.findOne(obj);
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async findFundRaiserByEmail(email: string) {
    try {
      return this.findOne({ where: { email: email } });
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async getFundRaiserStatusByEmail(email: string) {
    try {
      var fundraiser = await this.findOne({ where: { email: email } });

      return fundraiser.status;
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }


  async getAllFundraisers(obj: object) {
    try {
      return await this.find(obj);
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }


  async UpdateFundraiser(id, setObj: Object) {
    try {

      return await this.update(id, setObj);

    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async countFundraisers(obj: object) {
    try {
      return await this.count(obj);
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }

  }

  async createFundraiserByAdmin(generatePasswordDto: GeneratePasswordDto, password: string) {
    try {
      const hashedPassword = await bcrypt?.hash(password, 10);

      if (!hashedPassword) {
        throw new NotFoundException("Hashed Password not found");
      }

      let fundraiser: Fundraiser = new Fundraiser();

      fundraiser.firstName = generatePasswordDto?.firstName;
      fundraiser.email = generatePasswordDto?.email;
      fundraiser.mobile_number = generatePasswordDto?.mobile_number;
      fundraiser.password = hashedPassword;
      fundraiser.role = Constants?.ROLES?.FUNDRAISER_ROLE;
      fundraiser.status = 'active';

      return await this.save(fundraiser);

    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async deleteFundraiser(id) {
    try {
      await this.delete(id);
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

}
