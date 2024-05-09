import { Injectable, NotFoundException } from '@nestjs/common';

import { FundraiserPage } from 'src/shared/entity/fundraiser-page.entity';
import { Fundraiser } from 'src/shared/entity/fundraiser.entity';

import { FundRaiserRepository } from '../fundraiser/fundraiser.repository';
import { FundraiserPageRepository } from './fundraiser-page.repository';

import * as fs from 'fs';

@Injectable()
export class FundraiserPageService {
  constructor(
    private fundraiserPageRepository: FundraiserPageRepository,
    private fundraiserRepository: FundRaiserRepository,
  ) { }

  async uploadFile(file, PageId: string) {
    try {
      let fundRaiserPageNew = await this.fundraiserPageRepository.findOne({ where: { id: PageId } });

      //accessing existing galley of fundraiserPage and pushing new uploaded files
      const fundraiserGallery = fundRaiserPageNew.gallery;
      fundraiserGallery.push(file.filename);

      //saving new data of fundraiserPage with gallery
      await this.fundraiserPageRepository.update(PageId, { gallery: fundraiserGallery });
    } catch (error) {
      console.log(error);
    }
  }

  async update(body, PageId) {
    try {
      //finding fundraiserPage using id from parmameters and updating data using body data
      let fundRaiserPageNew = await this.fundraiserPageRepository.findOne({ where: { id: PageId } });

      if (!fundRaiserPageNew) {
        return { error: new NotFoundException('FundraiserPage not found') };
      }

      await this.fundraiserPageRepository.update(PageId, body);
    } catch (error) {
      console.log(error);

      throw new NotFoundException('Not Found');
    }
  }

  async getFundraiserById(id: string) {
    try {
      const fundraiserPage = await this.fundraiserPageRepository.findOne({ where: { id: id } });

      const fundraiser = await this.fundraiserRepository.findOne({ where: { fundraiser_page: { id: id } } })

      console.log(fundraiser)

      if (!fundraiserPage) {
        throw new NotFoundException('Fundraiser not found');
      }

      return { fundraiserPage, firstName: fundraiser.firstName, lastName: fundraiser.lastName, profileImage: fundraiser.profileImage };
    } catch (error) {
      throw new NotFoundException('Fundraiser Page not found');
    }
  }

  async deleteGalleryImage(user, filePath) {
    try {
      let fundraiser = user;

      const filepath = `uploads/fundraiserPageImages/${filePath}`;

      let fundRaiser: Fundraiser = await this.fundraiserRepository.findOne({ where: { fundraiser_id: fundraiser.id }, relations: ['fundraiser_page'] });

      let fundraiserPage: FundraiserPage = await this.fundraiserPageRepository.findOne({ where: { id: fundRaiser.fundraiser_page.id } });

      let gallery = fundraiserPage.gallery;

      const galleryNew = gallery.filter(function (image) {
        return image !== filePath;
      });

      await this.fundraiserPageRepository.update(fundraiserPage.id, { gallery: galleryNew });

      await fs.promises.unlink(filepath);

      return 'Image Deleted';
    } catch (error) {
      throw new NotFoundException('Image Does not exist');
    }
  }
}
