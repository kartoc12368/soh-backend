import { CanActivate, ExecutionContext, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { FundraiserPageRepository } from 'src/modules/fundraiser-page/fundraiser-page.repository';
import { FundRaiserRepository } from 'src/modules/fundraiser/fundraiser.repository';

import { Request } from 'express';

import { Observable } from 'rxjs';
import { FundraiserCampaignImagesRepository } from 'src/modules/fundraiser-page/fundraiser-campaign-images.repository';
import { ErrorResponseUtility } from '../utility/error-response.utility';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(
    private readonly fundraiserPageRepository: FundraiserPageRepository,
    private readonly fundraiserRepository: FundRaiserRepository,
    private fundraiserCampaignImagesRepository: FundraiserCampaignImagesRepository,
  ) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request: any = context?.switchToHttp()?.getRequest<Request>();

    const user = request?.user;

    const dataId = request?.params?.id;

    if (dataId.length > 36) {
      return this.checkOwnershipforImage(dataId, user?.email);
    } else {
      return this.checkOwnership(dataId, user?.email);
    }
  }

  async checkOwnership(dataId: string, email: string): Promise<boolean> {
    try {
      const fundraiserPage = await this.fundraiserPageRepository.getFundraiserPage({
        relations: ['fundraiser'],
        where: { id: dataId },
      });

      const fundraiser = await this.fundraiserRepository.getFundraiser({
        where: { email: email },
      });

      if (fundraiser?.role == 'ADMIN') {
        return true;
      }

      if (fundraiserPage == null) {
        throw new NotFoundException('Fundraiser page not found');
      }

      return fundraiserPage?.fundraiser?.fundraiser_id === fundraiser?.fundraiser_id;
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async checkOwnershipforImage(dataId: string, email: string): Promise<boolean> {
    try {
      const fundraiserImage = await this.fundraiserCampaignImagesRepository.getFundraiserByImage(dataId);

      const fundraiser = await this.fundraiserRepository.getFundraiser({ where: { email: email }, relations: ['fundraiser_page'] });

      if (fundraiser?.role == 'ADMIN') {
        return true;
      }

      if (fundraiserImage == null) {
        throw new ForbiddenException('Image Not exist for current fundraiser Page');
      }

      return fundraiserImage?.fundraiser_page?.id === fundraiser?.fundraiser_page?.id;
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }
}
