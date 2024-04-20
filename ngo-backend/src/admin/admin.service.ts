import {Injectable, NotFoundException } from '@nestjs/common';
import { Fundraiser } from 'src/fundraiser/entities/fundraiser.entity';
import * as bcrypt from 'bcrypt';
import { Constants } from 'src/utils/constants';
import { FundRaiserRepository } from 'src/fundraiser/repo/fundraiser.repository';
import { DonationRepository } from 'src/donation/repo/donation.repository';
import { Donation } from 'src/donation/entities/donation.entity';
import { FundraiserPageRepository } from 'src/fundraiser-page/repo/fundraiser-page.repository';

@Injectable()
export class AdminService {

    constructor(
        private fundraiserRepository:FundRaiserRepository,
        private donationRepository:DonationRepository,
        private fundraiserPageRepository:FundraiserPageRepository){}

    async createdByAdmin(createUserDto:any, password:string){
        const hashedPassword = await bcrypt.hash(password,10)
        let fundraiser: Fundraiser = new Fundraiser();
        fundraiser.firstName = createUserDto.firstName;
        fundraiser.lastName = createUserDto.lastName;
        fundraiser.email = createUserDto.email;
        fundraiser.password = hashedPassword;
        fundraiser.role = Constants.ROLES.FUNDRAISER_ROLE;
        fundraiser.status = "active";
        try {
          return await this.fundraiserRepository.save(fundraiser)

        } catch (error) {
          console.log(error);
          return "Please contact saveRepository";
        }

        // user.user = user1; 
        // console.log(user1)
        // user.status = "active";
        // return this.fundraiserRepository.save(user);
      
    }

    async changeFundraiserStatus(id:string){
        // return await this.fundraiserRepository.update(id,{status:"inactive"});
        try {
          const fundraiser = await this.fundraiserRepository.findOne({where:{fundraiser_id:id}});

          if (!fundraiser) {
            throw new NotFoundException('Fundraiser not found');
          }
          console.log(fundraiser.status)
          // Toggle the status based on its current value
          fundraiser.status = fundraiser.status === 'active' ? 'inactive' : 'active';

        
          // Save the updated fundraiser
          await this.fundraiserRepository.update(id,{status:fundraiser.status});
          if(fundraiser.status === 'active'){
            return {
              "status":1
            };
          }
          else{
            return {
              "status":0
            };
          }
  
  
        } catch (error) {
          console.log(error);
          return "Please contact statusmanager";
        }
      
    }  
    
    async deleteFundraiser(id:string){
      try {
        const fundraiser = await this.fundraiserRepository.findOne({where:{fundraiser_id:id}});

        if (!fundraiser) {
          throw new NotFoundException('Fundraiser not found');
        }

        return await this.fundraiserRepository.delete(id);

      } catch (error) {
        console.log(error);
        return "Please contact deleteFundraiser";
        
      }
    }

    async getAllFundraiser(){

      try {
        const fundraisers = await this.fundraiserRepository.find();
        const filteredUsers = fundraisers.filter((fundraiser) => fundraiser.role !== 'ADMIN');
        return filteredUsers;

      } catch (error) {
          console.log(error);
          return "Please contact getAllFundraiser";
      }


    }

    async addOfflineDonation(body){
      try {
              //same code from donate service here admin passes data in body
      let donation:Donation = new Donation();
      let fundraiser:Fundraiser = await this.fundraiserRepository.findOne({where:{email:body.email},relations:["fundraiser_page"]})
      console.log(fundraiser)
      let fundraiserPage = await this.fundraiserPageRepository.findOne({where:{id:fundraiser.fundraiser_page.id}})
      console.log(fundraiserPage)
      let supportersOfFundraiser = fundraiserPage.supporters
      if(supportersOfFundraiser == null){
        supportersOfFundraiser = []
      }
        supportersOfFundraiser.push(body.donor_name)
        console.log(supportersOfFundraiser)
      if(fundraiser!=null){
      const total_amount_raised = fundraiser.total_amount_raised + parseInt(body.amount);
      const total_donations = fundraiser.total_donations + 1;
      await this.fundraiserRepository.update(fundraiser.fundraiser_id,{total_amount_raised:total_amount_raised,
      total_donations:total_donations})
      const newAmount:number = fundraiserPage.raised_amount + parseInt(body.amount);
      await this.fundraiserPageRepository.update(fundraiserPage.id,{ raised_amount:newAmount,supporters:supportersOfFundraiser})
      }
      else{
        return "Fundraiser Page Not Found"
      }
      if(fundraiser.status == "active"){
        donation.fundraiser = fundraiser;
        donation.amount = body.amount;
        donation.donor_name = body.donor_name;
        donation.comments = body.comments;
        donation.pan = body.pan;
        donation.donor_email = body.donor_email;
        donation.donor_phone = body.donor_phone;
        donation.donor_address = body.donor_address;
        return this.donationRepository.save(donation);  
      }
      else{
        return "Fundraiser not active";
      }

      } catch (error) {
        console.log(error);
        return "Please contact addOfflineDonation";
      }
    }

    async update(body,files,PageId){
      try {

      //finding fundraiserPage using id from parmameters and updating data using body data 
      let fundRaiserPageNew = await this.fundraiserPageRepository.findOne({where:{id:PageId}})
      console.log(fundRaiserPageNew)
      await this.fundraiserPageRepository.update(PageId,body) 

      //accessing existing galley of fundraiserPage and pushing new uploaded files
      const fundraiserGallery = fundRaiserPageNew.gallery
      for(let i = 0; i <files.length; i++){
          fundraiserGallery.push(files[i])
      }
      console.log(fundraiserGallery)


      //saving new data of fundraiserPage with gallery
      await this.fundraiserPageRepository.update(PageId,{gallery:fundraiserGallery}) 

  } catch (error) {
      console.log(error)
      throw new NotFoundException("Not Found")
  }

  }

  async getTotalDonationsService(){
    try {
      const Donations = await this.donationRepository.find();
      let totalDonations = 0;
      for(let i = 0; i < Donations.length; i++){
        totalDonations = totalDonations + Donations[i].amount;
      }

      return totalDonations;
    } catch (error) {
      console.log(error);
      return "Please contact getTotalDonationsService";
    }
  }

}
