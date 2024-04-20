import { Injectable, UnauthorizedException } from '@nestjs/common';
import { FundRaiserRepository } from './repo/fundraiser.repository';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Fundraiser } from './entities/fundraiser.entity';
import * as bcrypt from 'bcrypt';
import { UpdateFundraiserDto } from './dto/update-profile.dto';
import { FundraiserPageRepository } from 'src/fundraiser-page/repo/fundraiser-page.repository';
import { DonationRepository } from 'src/donation/repo/donation.repository';
import { FindDonationsDto } from './dto/find-donation.dto';
import { Between, FindOptionsWhere } from 'typeorm';
import { Donation } from 'src/donation/entities/donation.entity';

function incrementDate(date: Date): Date {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + 1);
  return newDate;
}

@Injectable()
export class FundraiserService {

    constructor(private fundRaiserRepository:FundRaiserRepository,
      private fundraiserPageRepository:FundraiserPageRepository,
      private donationRepository:DonationRepository){}
    
    findFundRaiserByEmail(email: string) {
        return this.fundRaiserRepository.findOne({where: {email: email}});
      }

    async getFundRaiserStatusByEmail(email: string) {
        var fundraiser = await this.fundRaiserRepository.findOne({where: {email: email}});
        return fundraiser.status;
    }  

    async changePassword(req,changePasswordDto:ChangePasswordDto){
        const fundraiser:Fundraiser = req.user;
        const fundraiser2 = await this.fundRaiserRepository.findOne({where:{email:fundraiser.email},select:["password","fundraiser_id"]})
        var isSame = await bcrypt.compare(changePasswordDto.oldPassword,fundraiser2.password)
        if(isSame){
          if(changePasswordDto.newPassword==changePasswordDto.confirmPassword){
            const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword,10)
            return this.fundRaiserRepository.update(fundraiser2.fundraiser_id,{password:hashedPassword});
          }
          else{
            throw new UnauthorizedException("New password and confirm password do not match")
          }
      }else{
        throw new UnauthorizedException("Old password is incorrect")
      }
      }

    async updateFundRaiserById(req,updateFundRaiserDto:UpdateFundraiserDto){
      // const user:User = req.user;
      console.log(updateFundRaiserDto)
      const fundRaiser = await this.fundRaiserRepository.findOne({where:{fundraiser_id:req.user.id}})
      const updatedFund = await this.fundRaiserRepository.update(fundRaiser.fundraiser_id,updateFundRaiserDto  
        // firstName:fundraiser.firstName,
        // lastName:fundraiser.lastName,
        // mobile_number:fundraiser.mobile_number,
        // profilePicture:fundraiser.profilePicture,
        // address:fundraiser.address,
        // city:fundraiser.city,
        // state:fundraiser.state,
        // country:fundraiser.country,
        // pincode:fundraiser.pincode,
        // dob:fundraiser.dob,
        // pan:fundraiser.pan,
      )

      // console.log(updatedFund)

    }  

    async getFundraiserPage(fundraiser){
      console.log(fundraiser)
      return await this.fundraiserPageRepository.findOne({select:["fundraiser"],where:{fundraiser:{fundraiser_id:fundraiser.fundraiser_id}}})
    }
    
    async getDonationByIdFundraiser(user){
      const fundRaiser = await this.findFundRaiserByEmail(user.email)
      const donation = await this.donationRepository.find({where:{fundraiser:{fundraiser_id:fundRaiser.fundraiser_id}}})
      return donation;
    }

    async findMany(dto:FindDonationsDto,req){
      const {payment_option,payment_status,donation_id,from_date,to_date} = dto;
      let conditions: FindOptionsWhere<Donation> | FindOptionsWhere<Donation>[]= {      }
      conditions = {
        ...conditions,
        ...(dto.payment_option?{payment_type:payment_option}:{}),
        ...(dto.payment_status?{payment_status:payment_status}:{}),
        ...(req.user.id?{fundraiser:{fundraiser_id:req.user.id}}:{}),
        ...(dto.donation_id?{donation_id_frontend:donation_id}:{}),
        ...(dto.from_date || dto.to_date
          ? {
              created_at: Between(
                dto.from_date ? new Date(dto.from_date) : new Date('1970-01-01'),
                dto.to_date ? incrementDate(new Date(to_date)) : new Date()
              ),
            }
          : {}), // Only add filter if either from_date or to_date is provided
          }

      console.log(conditions)
      return await this.donationRepository.find({relations:{fundraiser:true},where:conditions})
    }
    
}
