import { CanActivate, ExecutionContext, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { FundraiserPageRepository } from 'src/modules/fundraiser-page/fundraiser-page.repository';
import { FundRaiserRepository } from 'src/modules/fundraiser/fundraiser.repository';

import { FundraiserPage } from '../entity/fundraiser-page.entity';

import { DataSource } from 'typeorm';

import { Request } from 'express';

import { Observable } from 'rxjs';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(
    private readonly fundraiserPageRepository: FundraiserPageRepository,
    private readonly fundraiserRepository: FundRaiserRepository,
    private readonly dataSource: DataSource,
  ) { }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request: any = context.switchToHttp().getRequest<Request>();

    const user = request?.user;

    const dataId = request?.params?.id;

    if (dataId.length > 36) {
      return this.checkOwnershipforImage(dataId, user.email);
    } else {
      return this.checkOwnership(dataId, user.email);
    }
  }

  async checkOwnership(dataId: string, email: string): Promise<boolean> {
    const fundraiserPage = await this.fundraiserPageRepository.findOne({
      relations: ['fundraiser'],
      where: { id: dataId },
    });

    const fundraiser = await this.fundraiserRepository.findOne({
      where: { email: email },
    });

    if (fundraiser.role == 'ADMIN') {
      return true;
    }

    if (fundraiserPage == null) {
      throw new NotFoundException('Fundraiser page not found');
    }

    return fundraiserPage.fundraiser.fundraiser_id === fundraiser.fundraiser_id;
  }

  async checkOwnershipforImage(dataId: string, email: string): Promise<boolean> {
    const fundraiserPage = await this.dataSource
      .getRepository(FundraiserPage)
      .createQueryBuilder('fundraiserPage')
      .leftJoinAndSelect('fundraiserPage.fundraiser', 'fundraiser')
      .where('fundraiserPage.gallery @> ARRAY[:gallery]', { gallery: dataId })
      .getOne();

    const fundraiser = await this.fundraiserRepository.findOne({
      where: { email: email },
    });

    if (fundraiser.role == 'ADMIN') {
      return true;
    }

    if (fundraiserPage == null) {
      throw new ForbiddenException('Image Not exist for current fundraiser Page');
    }

    return fundraiserPage.fundraiser.fundraiser_id === fundraiser.fundraiser_id;
  }
}
