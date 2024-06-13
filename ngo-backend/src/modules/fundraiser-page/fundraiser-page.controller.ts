import { Body, Controller, Delete, FileTypeValidator, Get, Param, ParseFilePipe, ParseUUIDPipe, Post, Put, Req, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';

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
  @UseInterceptors(FilesInterceptor('files', 20, storageForFundraiserPage))
  @ApiOperation({ summary: 'Upload Image By Fundraiser for the page (roles: fundraiser)' })
  @ApiResponse({ status: 201, description: 'Api success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not found!' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error!' })
  uploadFile(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' })],
      }),
    )
    files: Express.Multer.File,

    @Param('id', ParseUUIDPipe) PageId: string,
    @Req() req: any,
  ): Promise<ResponseStructure> {
    console.log(files);
    return this.fundraiserPageService.uploadFile(files, PageId, req.user);
  }

  @Put('/updatePage/:id')
  @ApiSecurity('JWT-auth')
  @UseGuards(new RoleGuard(RoleEnum.FUNDRAISER_ROLE), OwnershipGuard)
  @ApiOperation({ summary: 'Update Fundraiser Page by fundraiser (roles: fundraiser)' })
  @ApiResponse({ status: 201, description: 'Api success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not found!' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error!' })
  updatePage(@Body() body: UpdateFundraiserPageDto, @Param('id', ParseUUIDPipe) id: string): Promise<ResponseStructure> {
    return this.fundraiserPageService.updateFundraiserPage(body, id);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Public Fundraiser Page (roles: user)' })
  @ApiResponse({ status: 201, description: 'Api success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not found!' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error!' })
  getFundraiserById(@Param('id', ParseUUIDPipe) id: string): Promise<ResponseStructure> {
    return this.fundraiserPageService.getFundraiserById(id);
  }

  @Delete(':id')
  @ApiSecurity('JWT-auth')
  @UseGuards(new RoleGuard(RoleEnum.FUNDRAISER_ROLE), OwnershipGuard)
  @ApiOperation({ summary: 'Delete Fundraiser Page Image (roles: fundraiser)' })
  @ApiResponse({ status: 201, description: 'Api success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not found!' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error!' })
  deleteGalleryImage(@Param('id') filePath: string, @Req() req): Promise<ResponseStructure> {
    return this.fundraiserPageService.deleteGalleryImage(req?.user, filePath);
  }
}
