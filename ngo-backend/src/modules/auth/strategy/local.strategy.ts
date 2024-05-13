import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { FundRaiserRepository } from 'src/modules/fundraiser/fundraiser.repository';
import { FundraiserService } from 'src/modules/fundraiser/fundraiser.service';
import { Fundraiser } from 'src/shared/entity/fundraiser.entity';

import { Strategy } from 'passport-local';

import * as bcrypt from 'bcrypt';
import { ResponseStructure } from 'src/shared/interface/response-structure.interface';
import { ErrorResponseUtility } from 'src/shared/utility/error-response.utility';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private fundraiserRepository: FundRaiserRepository) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<ResponseStructure> {
    try {
      const fundraiser: Fundraiser = await this.fundraiserRepository.findFundRaiserByEmail(email);

      if (!fundraiser) {
        throw new NotFoundException('Fundraiser not found:' + email);
      }

      const fundraiserPassword = await this.fundraiserRepository.getFundraiser({
        where: { email: email },
        select: ['password'],
      });

      if (fundraiser && (await bcrypt?.compare(password, fundraiserPassword?.password))) {
        return { message: 'Logged In Successfully', data: fundraiser, success: true };
      }

      // if (fundraiser == undefined) {
      //   throw new UnauthorizedException('Fundraiser not found:' + email);
      // }

      if (!(await bcrypt?.compare(password, fundraiserPassword?.password))) {
        throw new UnauthorizedException('Invalid password');
      }

      return { message: 'Invalid Login' };
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }
}
