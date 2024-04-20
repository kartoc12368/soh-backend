import { Injectable, NotFoundException,} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { FundraiserPageRepository } from './repo/fundraiser-page.repository';
import { FundRaiserRepository } from 'src/fundraiser/repo/fundraiser.repository';

@Injectable()
export class FundraiserPageService {

    constructor(private dataSource:DataSource,
        private fundRaiserPageRepository:FundraiserPageRepository,
        private fundRaiserRepository:FundRaiserRepository,
        ){}

    async update(body,PageId){
        try {

        //finding fundraiserPage using id from parmameters and updating data using body data 
        let fundRaiserPageNew = await this.fundRaiserPageRepository.findOne({where:{id:PageId}})
        console.log(fundRaiserPageNew)
        await this.fundRaiserPageRepository.update(PageId,body) 


    } catch (error) {
        console.log(error)
        throw new NotFoundException("Not Found")
    }

    }
    
//     async updateRaisedAmount(){
//         let raised_amount = 0;
//         const firstUser = await this.dataSource
//     .getRepository(Donation)
//     .createQueryBuilder("donation")
//     .leftJoinAndSelect("donation.fundraiser","fundraiser")
//     .where("donation.donation_id = :id", { id: 20 })
//     .getOne()
// console.log(firstUser)
//     }
}
