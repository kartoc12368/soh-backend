import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';

import { FundraiserService } from '../fundraiser/fundraiser.service';
import { FundraiserPageService } from './fundraiser-page.service';

import { OwnershipGuard } from 'src/shared/helper/ownership.guard';
import { RoleGuard } from 'src/shared/helper/role.guard';

import { Public } from 'src/shared/decorators/public.decorator';
import { Constants } from 'src/shared/utility/constants';

import { UpdateFundraiserPageDto } from './dto/update-fundraiser-page.dto';

import { diskStorage } from 'multer';

import { v4 as uuidv4 } from "uuid";

import * as path from 'path';



export const storage = {
  storage: diskStorage({
    destination: "./uploads/fundraiserPageImages",
    filename: (req, file, cb) => {
      const filename: string = path.parse(file.originalname).name.replace(/\s/g, "") + uuidv4();
      const extension: string = path.parse(file.originalname).ext;

      cb(null, `${filename}${extension}`)
    }
  })
}


@ApiTags("Fundraiser-Page")
@Controller('fundraiser-page')
export class FundraiserPageController {
  constructor(
    private readonly fundraiserPageService: FundraiserPageService,
    private readonly fundraiserService: FundraiserService,
  ) { }


  //upload images for fundraiserPage One by One
  @Post("/updatePage/upload/:id")
  @ApiSecurity("JWT-auth")
  @UseGuards(new RoleGuard(Constants.ROLES.FUNDRAISER_ROLE), OwnershipGuard)
  @UseInterceptors(FileInterceptor("file", storage))
  async uploadFile(@UploadedFile() file, @Param("id", ParseUUIDPipe) PageId: string) {
    return await this.fundraiserPageService.uploadFile(file, PageId);
  }

  //update FundraiserPage Information
  @Put("/updatePage/:id")
  @ApiSecurity("JWT-auth")
  @UseGuards(new RoleGuard(Constants.ROLES.FUNDRAISER_ROLE), OwnershipGuard)
  // @UseInterceptors(FilesInterceptor("file",20,storage))
  async updatePage(@Body() body: UpdateFundraiserPageDto, @Param("id", ParseUUIDPipe) id: string) {
    return await this.fundraiserPageService.update(body, id)
  }

  //public page for fundraiser
  @Get(":id")
  @Public()
  async getFundraiserById(@Param("id", ParseUUIDPipe) id: string) {
    return await this.fundraiserPageService.getFundraiserById(id);
  }

  //delete fundraiserPage Image one by one
  @Delete(":id")
  @ApiSecurity("JWT-auth")
  @UseGuards(new RoleGuard(Constants.ROLES.FUNDRAISER_ROLE), OwnershipGuard)
  async deleteGalleryImage(@Param("id") filePath: string, @Req() req) {
    return await this.fundraiserPageService.deleteGalleryImage(req.user, filePath);
  }


}
