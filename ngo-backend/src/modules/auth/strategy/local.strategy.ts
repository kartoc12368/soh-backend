import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { FundRaiserRepository } from 'src/modules/fundraiser/fundraiser.repository';
import { FundraiserService } from 'src/modules/fundraiser/fundraiser.service';
import { Fundraiser } from 'src/shared/entity/fundraiser.entity';

import { Strategy } from 'passport-local';

import * as bcrypt from 'bcrypt';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private fundraiserService: FundraiserService,
    private fundraiserRepository: FundRaiserRepository,
  ) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<Fundraiser> {

    const fundraiser: Fundraiser = await this.fundraiserService.findFundRaiserByEmail(email);

    const fundraiserPassword = await this.fundraiserRepository.findOne({
      where: { email: email },
      select: ['password'],
    });

    if (fundraiser && (await bcrypt.compare(password, fundraiserPassword.password))) {
      // console.log(fundraiser)
      return fundraiser;
    }

    if (fundraiser == undefined) {
      throw new UnauthorizedException('fundraiser not found:' + email);
    }

    if (!(await bcrypt.compare(password, fundraiserPassword.password))) {
      throw new UnauthorizedException('Invalid password');
    }
    return null;
  }
}
