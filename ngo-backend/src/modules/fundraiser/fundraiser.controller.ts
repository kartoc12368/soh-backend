import { Body, Controller, FileTypeValidator, Get, Param, ParseFilePipe, Post, Put, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';

import { ChangePasswordDto } from './dto/change-password.dto';
import { FindDonationsDto } from './dto/find-donation.dto';
import { UpdateFundraiserDto } from './dto/update-profile.dto';

import { Public } from 'src/shared/decorators/public.decorator';
import { RoleGuard } from 'src/shared/helper/role.guard';
import { storageForProfileImages } from 'src/shared/utility/storage.utility';

import { RoleEnum } from 'src/shared/enums/role.enum';
import { ResponseStructure } from 'src/shared/interface/response-structure.interface';
import { FundraiserService } from './fundraiser.service';

@Controller('fundRaiser')
@ApiTags('FundRaiser')
@ApiSecurity('JWT-auth')
export class FundraiserController {
  constructor(private readonly fundraiserService: FundraiserService) {}

  @Post('/changePassword')
  @UseGuards(new RoleGuard(RoleEnum.FUNDRAISER_ROLE))
  @ApiOperation({ summary: 'change Password Fundraiser using old password (roles: fundraiser)' })
  @ApiResponse({ status: 201, description: 'Api success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not found!' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error!' })
  changePassword(@Req() req, @Body() changePasswordDto: ChangePasswordDto): Promise<ResponseStructure> {
    return this.fundraiserService.changePassword(req?.user, changePasswordDto);
  }

  @Get()
  @UseGuards(new RoleGuard(RoleEnum.FUNDRAISER_ROLE))
  @ApiOperation({ summary: 'Get Logged In Fundraiser Data (roles: fundraiser)' })
  @ApiResponse({ status: 201, description: 'Api success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not found!' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error!' })
  getFundraiser(@Req() req): Promise<ResponseStructure> {
    return this.fundraiserService.getLoggedInFundraiser(req?.user);
  }

  @Put('/update')
  @UseGuards(new RoleGuard(RoleEnum.FUNDRAISER_ROLE))
  @ApiOperation({ summary: 'Update Fundraiser Profile (roles: fundraiser)' })
  @ApiResponse({ status: 201, description: 'Api success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not found!' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error!' })
  updateFundraiser(@Req() req, @Body(ValidationPipe) body: UpdateFundraiserDto): Promise<ResponseStructure> {
    return this.fundraiserService.updateFundRaiserById(req?.user, body);
  }

  @Get('/fundraiser-page')
  @UseGuards(new RoleGuard(RoleEnum.FUNDRAISER_ROLE))
  @ApiOperation({ summary: 'Get Fundraiser-page of current Fundraiser (roles: fundraiser)' })
  @ApiResponse({ status: 201, description: 'Api success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not found!' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error!' })
  getAllFundraiserPages(@Req() req): Promise<ResponseStructure> {
    return this.fundraiserService.getFundraiserPage(req?.user);
  }

  @Get('/fundraiser-page/:image')
  @Public()
  @ApiOperation({ summary: 'Fetch Fundraiser Page Images (roles: fundraiser)' })
  @ApiResponse({ status: 201, description: 'Api success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not found!' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error!' })
  getFundraiserPageImage(@Param() body, @Res() res): Promise<ResponseStructure> {
    return this.fundraiserService.findFundraiserPageImage(res, body?.image);
  }

  @Post('upload')
  @UseGuards(new RoleGuard(RoleEnum.FUNDRAISER_ROLE))
  @UseInterceptors(FileInterceptor('file', storageForProfileImages))
  @ApiOperation({ summary: 'Upload Profile Image (roles: fundraiser)' })
  @ApiResponse({ status: 201, description: 'Api success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not found!' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error!' })
  uploadProfileImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' })],
      }),
    )
    file: Express.Multer.File,
    @Req() req,
  ): Promise<ResponseStructure> {
    return this.fundraiserService.uploadProfileImage(req.user, file);
  }

  @Get('profile-image/:imagename')
  @Public()
  @ApiOperation({ summary: 'Get Fundraiser Profile Image (roles: fundraiser)' })
  @ApiResponse({ status: 201, description: 'Api success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not found!' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error!' })
  findProfileImage(@Param('imagename') imagename, @Res() res): Promise<ResponseStructure> {
    return this.fundraiserService.findProfileImage(res, imagename);
  }

  @Post('/createPage')
  @UseGuards(new RoleGuard(RoleEnum.FUNDRAISER_ROLE))
  @ApiOperation({ summary: 'Create Fundraiser Page from Fundraiser side (roles: fundraiser)' })
  @ApiResponse({ status: 201, description: 'Api success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not found!' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error!' })
  createPage(@Req() req): Promise<ResponseStructure> {
    return this.fundraiserService.createFundraiserPage(req?.user);
  }

  @Get('/donations')
  @UseGuards(new RoleGuard(RoleEnum.FUNDRAISER_ROLE))
  @ApiOperation({ summary: 'Get All Donations specific to current fundraiser with filter (roles: fundraiser)' })
  @ApiResponse({ status: 201, description: 'Api success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not found!' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error!' })
  findAll(@Query() query: FindDonationsDto, @Req() req): Promise<ResponseStructure> {
    return this.fundraiserService.getDonationFundraiser(query, req?.user);
  }

  @Get('/getRaisedAmount')
  @ApiOperation({ summary: 'Get current fundraiser raised amount (roles: fundraiser)' })
  @ApiResponse({ status: 201, description: 'Api success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not found!' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error!' })
  getRaisedAmount(@Req() req): Promise<ResponseStructure> {
    return this.fundraiserService.getRaisedAmount(req.user);
  }
}
