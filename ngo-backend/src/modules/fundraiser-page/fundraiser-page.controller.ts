import { Body, Controller, Delete, FileTypeValidator, Get, Param, ParseFilePipe, ParseUUIDPipe, Post, Put, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';

import { FundraiserPageService } from './fundraiser-page.service';

import { OwnershipGuard } from 'src/shared/helper/ownership.guard';
import { RoleGuard } from 'src/shared/helper/role.guard';

import { Public } from 'src/shared/decorators/public.decorator';
import { storageForFundraiserPage } from 'src/shared/utility/storage.utility';

import { UpdateFundraiserPageDto } from './dto/update-fundraiser-page.dto';
import { ResponseStructure } from 'src/shared/interface/response-structure.interface';
import { RoleEnum } from 'src/shared/enums/role.enum';

@ApiTags('Fundraiser-Page')
@Controller('fundraiser-page')
export class FundraiserPageController {
  constructor(private readonly fundraiserPageService: FundraiserPageService) {}

  @Post('/updatePage/upload/:id')
  @ApiSecurity('JWT-auth')
  @UseGuards(new RoleGuard(RoleEnum.FUNDRAISER_ROLE), OwnershipGuard)
  @UseInterceptors(FileInterceptor('file', storageForFundraiserPage))
  @ApiOperation({ summary: 'Upload Image By Fundraiser for the page' })
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' })],
      }),
    )
    file: Express.Multer.File,

    @Param('id', ParseUUIDPipe) PageId: string,
  ): Promise<ResponseStructure> {
    console.log(file.filename);
    return await this.fundraiserPageService.uploadFile(file, PageId);
  }

  @Put('/updatePage/:id')
  @ApiSecurity('JWT-auth')
  @UseGuards(new RoleGuard(RoleEnum.FUNDRAISER_ROLE), OwnershipGuard)
  @ApiOperation({ summary: 'Update Fundraiser Page by fundraiser' })
  async updatePage(@Body() body: UpdateFundraiserPageDto, @Param('id', ParseUUIDPipe) id: string): Promise<ResponseStructure> {
    return await this.fundraiserPageService.updateFundraiserPage(body, id);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Public Fundraiser Page' })
  async getFundraiserById(@Param('id', ParseUUIDPipe) id: string): Promise<ResponseStructure> {
    return await this.fundraiserPageService.getFundraiserById(id);
  }

  @Delete(':id')
  @ApiSecurity('JWT-auth')
  @UseGuards(new RoleGuard(RoleEnum.FUNDRAISER_ROLE), OwnershipGuard)
  @ApiOperation({ summary: 'Delete Fundraiser Page Image ' })
  async deleteGalleryImage(@Param('id') filePath: string, @Req() req): Promise<ResponseStructure> {
    return await this.fundraiserPageService.deleteGalleryImage(req?.user, filePath);
  }
}
