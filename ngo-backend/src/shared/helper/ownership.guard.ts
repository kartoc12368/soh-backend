import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { FundRaiserRepository } from 'src/modules/fundraiser/fundraiser.repository';
import { FundraiserPageRepository } from 'src/modules/fundraiser-page/fundraiser-page.repository';
import { DataSource } from 'typeorm';
import { FundraiserPage } from '../entity/fundraiser-page.entity';
import { IsUUID, isUUID } from 'class-validator';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(
    private readonly fundraiserPageRepository: FundraiserPageRepository,
    private readonly fundraiserRepository: FundRaiserRepository,
    private readonly dataSource: DataSource,
  ) { } // Inject your data service

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: any = context.switchToHttp().getRequest<Request>();
    const user = request.user;

    // Extract data ID from request (adjust based on your API)
    const dataId = request.params.id;
    if (dataId.length > 36) {
      return this.checkOwnershipforImage(dataId, user.email)
    }
    else {
      return this.checkOwnership(dataId, user.email)
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
      .leftJoinAndSelect("fundraiserPage.fundraiser", "fundraiser")
      .where('fundraiserPage.gallery @> ARRAY[:gallery]', { gallery: dataId })
      .getOne();
    console.log(fundraiserPage)
    const fundraiser = await this.fundraiserRepository.findOne({
      where: { email: email },
    });
    if (fundraiser.role == 'ADMIN') {
      return true;
    }
    if (fundraiserPage == null) {

      throw new ForbiddenException("Image Not exist for current fundraiser Page");
    }

    return fundraiserPage.fundraiser.fundraiser_id === fundraiser.fundraiser_id;
  }



}
