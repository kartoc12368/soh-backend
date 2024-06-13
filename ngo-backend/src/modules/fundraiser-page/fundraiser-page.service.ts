import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';

import { FundraiserPage } from 'src/shared/entity/fundraiser-page.entity';
import { Fundraiser } from 'src/shared/entity/fundraiser.entity';

import { FundRaiserRepository } from '../fundraiser/fundraiser.repository';
import { FundraiserPageRepository } from './fundraiser-page.repository';

import { ErrorResponseUtility } from 'src/shared/utility/error-response.utility';
import { ResponseStructure } from 'src/shared/interface/response-structure.interface';
import { FundraiserCampaignImagesRepository } from './fundraiser-campaign-images.repository';
import { FundraiserCampaignImages } from 'src/shared/entity/fundraiser-campaign-images.entity';
import { DonationRepository } from '../donation/donation.repository';

@Injectable()
export class FundraiserPageService {
  constructor(
    private fundraiserPageRepository: FundraiserPageRepository,
    private fundraiserRepository: FundRaiserRepository,
    private fundraiserCampaignImagesRepository: FundraiserCampaignImagesRepository,
    private donationRepository: DonationRepository,
  ) {}

  async uploadFile(files, PageId: string, user): Promise<ResponseStructure> {
    try {
      let fundraiser = await this.fundraiserRepository.getFundraiser({ where: { email: user?.email } });
      if (!fundraiser) {
        throw new NotFoundException('Fundraiser Not Found');
      }
      let fundraiserPage = await this.fundraiserPageRepository.getFundraiserPage({ where: { id: PageId } });

      if (!fundraiserPage) {
        throw new NotFoundException('Fundraiser Page Not Found');
      }

      //accessing existing galley of fundraiserPage and pushing new uploaded files
      files.forEach(async (file) => {
        console.log(file?.filename, 'hh');
        const fundraiserCampaignImages: FundraiserCampaignImages = new FundraiserCampaignImages();
        fundraiserCampaignImages.fundraiser_page = fundraiserPage;
        fundraiserCampaignImages.image_url = file?.filename;
        console.log(fundraiserCampaignImages);
        await this.fundraiserCampaignImagesRepository.save(fundraiserCampaignImages);
      });

      //saving new data of fundraiserPage with gallery
      return { message: 'Gallery Updated Successfully', success: true };
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async updateFundraiserPage(body, pageId): Promise<ResponseStructure> {
    try {
      //finding fundraiserPage using id from parmameters and updating data using body data
      let fundraiserPage = await this.fundraiserPageRepository.getFundraiserPage({ where: { id: pageId } });

      if (!fundraiserPage) {
        throw new NotFoundException('Fundraiser Page Not Found');
      }

      await this.fundraiserPageRepository.UpdateFundraiserPage(pageId, body);
      return { message: 'Fundraiser Page Details Updated Successfully', success: true };
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async getFundraiserById(id: string): Promise<ResponseStructure> {
    try {
      const fundraiserPage = await this.fundraiserPageRepository.getFundraiserPage({ where: { id: id } });

      if (!fundraiserPage) {
        throw new NotFoundException('Fundraiser Page Not Found');
      }

      const fundraiser = await this.fundraiserRepository.getFundraiser({ where: { fundraiser_page: { id: id } } });

      if (!fundraiser) {
        throw new NotFoundException('Fundraiser Not Found and Page is Expired');
      }

      let gallery = await this.fundraiserCampaignImagesRepository.find({ select: ['image_url'], where: { fundraiser_page: { fundraiser: { fundraiser_id: fundraiser.fundraiser_id } } } });
      const FundraiserRaisedAmount = await this.donationRepository.getRaisedAmount(fundraiser);
      const FundraiserSupporters = await this.donationRepository.getDonorNames(fundraiser);

      return {
        message: 'Fundraiser Page Details Successfully Fetched',
        data: { fundraiserPage, firstName: fundraiser.firstName, lastName: fundraiser.lastName, profileImage: fundraiser.profileImage, gallery: gallery, raised_amount: FundraiserRaisedAmount, supporters: FundraiserSupporters },
        success: true,
      };
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async deleteGalleryImage(user, imageUrl): Promise<ResponseStructure> {
    try {
      const filepath = `uploads/fundraiserPageImages/${imageUrl}`;

      const GalleryImage = await this.fundraiserCampaignImagesRepository.findOne({ where: { image_url: imageUrl } });

      if (!GalleryImage) {
        throw new NotFoundException('Image Not Found');
      }

      await this.fundraiserCampaignImagesRepository.delete(GalleryImage?.id);

      await fs.promises.unlink(filepath);

      return { message: 'Image Deleted Successfully' };
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async getAllFundraiserPages(): Promise<ResponseStructure> {
    try {
      const fundraiserPages = await this.fundraiserPageRepository.getAllFundraiserPages();

      if (!fundraiserPages) {
        throw new NotFoundException('Fundraiser Page Not Found');
      }

      return { message: 'Fetched all fundraiser Pages', data: fundraiserPages };
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }
}
