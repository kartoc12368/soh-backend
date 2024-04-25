import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';

import { FundraiserPageService } from './fundraiser-page.service';

import { OwnershipGuard } from 'src/shared/helper/ownership.guard';
import { RoleGuard } from 'src/shared/helper/role.guard';

import { Public } from 'src/shared/decorators/public.decorator';
import { Constants } from 'src/shared/utility/constants';
import { storageForFundraiserPage } from 'src/shared/utility/storage';

import { UpdateFundraiserPageDto } from './dto/update-fundraiser-page.dto';


@ApiTags('Fundraiser-Page')
@Controller('fundraiser-page')
export class FundraiserPageController {
  constructor(
    private readonly fundraiserPageService: FundraiserPageService,
  ) { }

  //upload images for fundraiserPage One by One
  @Post('/updatePage/upload/:id')
  @ApiSecurity('JWT-auth')
  @UseGuards(new RoleGuard(Constants.ROLES.FUNDRAISER_ROLE), OwnershipGuard)
  @UseInterceptors(FileInterceptor('file', storageForFundraiserPage))
  async uploadFile(@UploadedFile() file, @Param('id', ParseUUIDPipe) PageId: string) {
    console.log(file.filename);
    return await this.fundraiserPageService.uploadFile(file, PageId);
  }

  //update FundraiserPage Information
  @Put('/updatePage/:id')
  @ApiSecurity('JWT-auth')
  @UseGuards(new RoleGuard(Constants.ROLES.FUNDRAISER_ROLE), OwnershipGuard)
  // @UseInterceptors(FilesInterceptor("file",20,storage))
  async updatePage(@Body() body: UpdateFundraiserPageDto, @Param('id', ParseUUIDPipe) id: string) {
    console.log('hello');
    return await this.fundraiserPageService.update(body, id);
  }

  //public page for fundraiser
  @Get(':id')
  @Public()
  async getFundraiserById(@Param('id', ParseUUIDPipe) id: string) {
    return await this.fundraiserPageService.getFundraiserById(id);
  }

  //delete fundraiserPage Image one by one
  @Delete(':id')
  @ApiSecurity('JWT-auth')
  @UseGuards(new RoleGuard(Constants.ROLES.FUNDRAISER_ROLE), OwnershipGuard)
  async deleteGalleryImage(@Param('id') filePath: string, @Req() req) {
    return await this.fundraiserPageService.deleteGalleryImage(req.user, filePath);
  }
}
