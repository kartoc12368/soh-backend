import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { FundRaiserRepository } from 'src/modules/fundraiser/fundraiser.repository';
import { FundraiserPageRepository } from 'src/modules/fundraiser-page/fundraiser-page.repository';

@Injectable()
export class OwnershipGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: any = context.switchToHttp().getRequest<Request>();
    const user = request.user;

    // Extract data ID from request (adjust based on your API)
    const dataId = request.params.id;
    // Retrieve data using your service
    return this.checkOwnership(dataId, user.email);
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

  constructor(
    private readonly fundraiserPageRepository: FundraiserPageRepository,
    private readonly fundraiserRepository: FundRaiserRepository,
  ) { } // Inject your data service
}
