import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';

import { FundraiserPage } from 'src/shared/entity/fundraiser-page.entity';
import { Fundraiser } from 'src/shared/entity/fundraiser.entity';

import { FundRaiserRepository } from '../fundraiser/fundraiser.repository';
import { FundraiserPageRepository } from './fundraiser-page.repository';

import { ErrorResponseUtility } from 'src/shared/utility/error-response.utility';
import { ResponseStructure } from 'src/shared/interface/response-structure.interface';

@Injectable()
export class FundraiserPageService {
  constructor(
    private fundraiserPageRepository: FundraiserPageRepository,
    private fundraiserRepository: FundRaiserRepository,
  ) {}

  async uploadFile(file, PageId: string): Promise<ResponseStructure> {
    try {
      let fundraiserPage = await this.fundraiserPageRepository.getFundraiserPage({ where: { id: PageId } });

      //accessing existing galley of fundraiserPage and pushing new uploaded files
      const fundraiserGallery = fundraiserPage?.gallery;
      fundraiserGallery?.push(file?.filename);

      //saving new data of fundraiserPage with gallery
      await this.fundraiserPageRepository.UpdateFundraiserPage(PageId, { gallery: fundraiserGallery });
      return { message: 'Gallery updated successfully', success: true };
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async update(body, pageId): Promise<ResponseStructure> {
    try {
      //finding fundraiserPage using id from parmameters and updating data using body data
      let fundraiserPage = await this.fundraiserPageRepository.getFundraiserPage({ where: { id: pageId } });

      if (!fundraiserPage) {
        throw new NotFoundException('Fundraiser Page not found');
      }

      await this.fundraiserPageRepository.UpdateFundraiserPage(pageId, body);
      return { message: 'Fundraiser Page Details updated successfully', success: true };
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async getFundraiserById(id: string): Promise<ResponseStructure> {
    try {
      const fundraiserPage = await this.fundraiserPageRepository.getFundraiserPage({ where: { id: id } });

      if (!fundraiserPage) {
        throw new NotFoundException('Fundraiser Page not found');
      }

      const fundraiser = await this.fundraiserRepository.getFundraiser({ where: { fundraiser_page: { id: id } } });

      if (!fundraiser) {
        throw new NotFoundException('Fundraiser not found and Page is expired');
      }

      return {
        message: 'Fundraiser Page details successfully fetched',
        data: { fundraiserPage, firstName: fundraiser.firstName, lastName: fundraiser.lastName, profileImage: fundraiser.profileImage },
        success: true,
      };
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async deleteGalleryImage(user, filePath): Promise<ResponseStructure> {
    try {
      const filepath = `uploads/fundraiserPageImages/${filePath}`;

      let fundRaiser: Fundraiser = await this.fundraiserRepository.getFundraiser({ where: { fundraiser_id: user.id }, relations: ['fundraiser_page'] });
      if (!fundRaiser) {
        throw new NotFoundException('Fundraiser not found');
      }

      let fundraiserPage: FundraiserPage = await this.fundraiserPageRepository.getFundraiserPage({ where: { id: fundRaiser.fundraiser_page.id } });
      if (!fundraiserPage) {
        throw new NotFoundException('Fundraiser Page not found');
      }

      const galleryNew = fundraiserPage.gallery.filter(function (image) {
        return image !== filePath;
      });

      await this.fundraiserPageRepository.UpdateFundraiserPage(fundraiserPage.id, { gallery: galleryNew });

      await fs.promises.unlink(filepath);

      return { message: 'Image Deleted Successfully' };
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async getAllFundraiserPages(): Promise<ResponseStructure> {
    try {
      const fundraiserPages = await this.fundraiserPageRepository.getAllFundraiserPages();
      return { message: 'Fetched all fundraiser Pages', data: fundraiserPages };
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }
}
