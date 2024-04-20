import { Body, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, ParseUUIDPipe, Post, Put, Req, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FundraiserPageService } from './fundraiser-page.service';
import { FundraiserService } from 'src/fundraiser/fundraiser.service';
import { Public } from 'src/public.decorator';
import { FundRaiserRepository } from 'src/fundraiser/repo/fundraiser.repository';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FundraiserPageRepository } from './repo/fundraiser-page.repository';
import { RoleGuard } from 'src/auth/guard/role.guard';
import { Constants } from 'src/utils/constants';
import { UpdateFundraiserPageDto } from './dto/update-fundraiser-page.dto';
import { OwnershipGuard } from './guard/ownership.guard';
import { diskStorage } from 'multer';
import {v4 as uuidv4} from "uuid";
import * as path from 'path';
import { FundraiserPage } from './entities/fundraiser-page.entity';
import { Fundraiser } from 'src/fundraiser/entities/fundraiser.entity';
import * as fs from 'fs'; // Import entire fs module
import { FileInterceptor } from '@nestjs/platform-express';


export const storage =   {  storage:diskStorage({
  destination:"./uploads/fundraiserPageImages",
  filename:(req,file,cb)=>{
    const filename:string = path.parse(file.originalname).name.replace(/\s/g, "") + uuidv4();
    const extension:string = path.parse(file.originalname).ext;

    cb(null, `${filename}${extension}`)
  } 
})
}


@ApiTags("Fundraiser-Page")
@Controller('fundraiser-page')
export class FundraiserPageController {
  constructor(private readonly fundraiserPageService: FundraiserPageService,
    private readonly fundRaiserRepository:FundRaiserRepository,
    private readonly fundraiserService:FundraiserService,
    private readonly fundraiserPageRepository:FundraiserPageRepository
    ) {}


    //upload images for fundraiserPage One by One
    @ApiSecurity("JWT-auth")
    @UseGuards(new RoleGuard(Constants.ROLES.FUNDRAISER_ROLE),OwnershipGuard)  
    @Post("/:id/updatePage/upload")
    @UseInterceptors(FileInterceptor("file",storage))
    async uploadFile(@UploadedFile() file,@Req() req,@Param("id",ParseUUIDPipe)PageId:string){
      let fundraiser:Fundraiser = req.user;
      let fundRaiserPageNew = await this.fundraiserPageRepository.findOne({where:{id:PageId}})
            //accessing existing galley of fundraiserPage and pushing new uploaded files
        const fundraiserGallery = fundRaiserPageNew.gallery
            fundraiserGallery.push(file.filename)
        
        console.log(fundraiserGallery)


        //saving new data of fundraiserPage with gallery
        await this.fundraiserPageRepository.update(PageId,{gallery:fundraiserGallery}) 


    }

    //update FundraiserPage Information
  @ApiSecurity("JWT-auth")
  @UseGuards(new RoleGuard(Constants.ROLES.FUNDRAISER_ROLE),OwnershipGuard)
  @Put("/:id/updatePage")
  // @UseInterceptors(FilesInterceptor("file",20,storage))
  async updatePage(@Req() req,@Body() body:UpdateFundraiserPageDto,@Param("id",ParseUUIDPipe)id:string){
    console.log("new")
    console.log(body)
    // let user:User = req.user;
    // body = JSON.parse(body.data)

    // const dtoInstance = new UpdateFundraiserPageDto(body);
    // const dtoKeys = Object.keys(dtoInstance);
    // console.log(dtoKeys)

  
    // Filter out extra parameters from the body
    // const filteredBody = Object.keys(body)
    //   .filter(key => dtoKeys.includes(key))
    //   .reduce((obj, key) => {
    //     obj[key] = body[key];
    //     return obj;
    //   }, {});
  
    // // console.log(filteredBody)
    // const response = [];
    // try {
    //   files.forEach(file => {
    //     // const fileReponse = {
    //     //   filename: file.filename,
    //     // };
    //     response.push(file.filename);
    //     // console.log(response)
    //   });
    
    // } catch (error) {
    //   return true;
    // }
return await this.fundraiserPageService.update(body,id)
  }


    //public page for fundraiser
    @Get(":id")
    @Public()
    async getFundraiserById(@Param("id",ParseUUIDPipe) id:string){
      try {
        const fundraiserPage = await this.fundraiserPageRepository.findOne({where:{id:id}});
        if (!fundraiserPage) {
          throw new NotFoundException('Fundraiser not found');
        }
        return fundraiserPage;
      } catch (error) {
        throw new NotFoundException("Fundraiser Page not found")
      }
    }


    //delete fundraiserPage Image one by one
    @ApiSecurity("JWT-auth")
    @UseGuards(new RoleGuard(Constants.ROLES.FUNDRAISER_ROLE),OwnershipGuard)  
    @Delete(":id")
    async deleteGalleryImage(@Param("id"  )filePath:string,@Req() req){
      let fundraiser= req.user;
      const filepath = `uploads/fundraiserPageImages/${filePath}`; // Assuming file path construction logic
      let fundRaiser:Fundraiser = await this.fundRaiserRepository.findOne({where:{fundraiser_id:fundraiser.id},relations:["fundraiser_page"]})
      let fundraiserPage:FundraiserPage = await this.fundraiserPageRepository.findOne({where:{id:fundRaiser.fundraiser_page.id}})
      let gallery = fundraiserPage.gallery;
      const galleryNew = gallery.filter(function (image) {
        return image !== filePath;
    });

      try{
        await fs.promises.unlink(filepath); // Use promises for async deletion
        await this.fundraiserPageRepository.update(fundraiserPage.id,{gallery:galleryNew})
        return "Image Deleted";
  
      }
      catch(error){
        throw new NotFoundException("Image Does not exist")
  
      }
    
    }
  

}
