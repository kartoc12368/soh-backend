import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Donation } from 'src/shared/entity/donation.entity';
import { FundraiserPage } from 'src/shared/entity/fundraiser-page.entity';
import { Fundraiser } from 'src/shared/entity/fundraiser.entity';
import { Between, FindOptionsWhere } from 'typeorm';
import { DonationRepository } from '../donation/donation.repository';
import { FundraiserPageRepository } from '../fundraiser-page/fundraiser-page.repository';
import { ChangePasswordDto } from './dto/change-password.dto';
import { FindDonationsDto } from './dto/find-donation.dto';
import { UpdateFundraiserDto } from './dto/update-profile.dto';
import { FundRaiserRepository } from './fundraiser.repository';
import { v4 as uuidv4 } from "uuid";
import { of } from 'rxjs';
import * as bcrypt from 'bcrypt';
import * as exceljs from "exceljs";
import * as fs from "fs";
import * as path from 'path';


function incrementDate(date: Date): Date {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + 1);
  return newDate;
}

@Injectable()
export class FundraiserService {

  constructor(
    private fundRaiserRepository: FundRaiserRepository,
    private fundraiserPageRepository: FundraiserPageRepository,
    private donationRepository: DonationRepository) { }

  async changePassword(req, changePasswordDto: ChangePasswordDto) {
    try {
      const fundraiser: Fundraiser = req.user;
      const fundraiser2 = await this.fundRaiserRepository.findOne({ where: { email: fundraiser.email }, select: ["password", "fundraiser_id"] })
      var isSame = await bcrypt.compare(changePasswordDto.oldPassword, fundraiser2.password)
      if (isSame) {
        if (changePasswordDto.newPassword == changePasswordDto.confirmPassword) {
          const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10)
          return this.fundRaiserRepository.update(fundraiser2.fundraiser_id, { password: hashedPassword });
        }
        else {
          throw new UnauthorizedException("New password and confirm password do not match")
        }
      } else {
        throw new UnauthorizedException("Old password is incorrect")
      }
    }
    catch (error) {
      console.log(error);
    }
  }

  async getLoggedInFundraiser(user) {
    const id = user;
    try {
      return await this.fundRaiserRepository.findOneOrFail({ where: { email: id.email }, relations: ["fundraiser_page"] });

    } catch (error) {
      throw new NotFoundException("Fundraiser not found");
    }

  }

  findFundRaiserByEmail(email: string) {
    try {
      return this.fundRaiserRepository.findOne({ where: { email: email } });
    } catch (error) {
      console.log(error);
    }
  }

  async getFundRaiserStatusByEmail(email: string) {
    try {
      var fundraiser = await this.fundRaiserRepository.findOne({ where: { email: email } });
      return fundraiser.status;
    } catch (error) {
      console.log(error);
    }
  }


  async updateFundRaiserById(req, updateFundRaiserDto: UpdateFundraiserDto) {
    try {
      const fundRaiser = await this.fundRaiserRepository.findOne({ where: { fundraiser_id: req.user.id } })
      return await this.fundRaiserRepository.update(fundRaiser.fundraiser_id, updateFundRaiserDto)

    } catch (error) {
      console.log(error);
    }
  }

  async getFundraiserPage(user) {
    try {
      let fundRaiser: Fundraiser = await this.fundRaiserRepository.findOne({ where: { fundraiser_id: user.id } })
      return await this.fundraiserPageRepository.findOne({ select: ["fundraiser"], where: { fundraiser: { fundraiser_id: fundRaiser.fundraiser_id } } })
    }
    catch (error) {
      console.log(error);
    }
  }

  async uploadProfileImage(user, file) {
    try {
      let fundraiser: Fundraiser = user;
      let fundRaiser = await this.findFundRaiserByEmail(fundraiser.email)
      await this.fundRaiserRepository.update(fundRaiser.fundraiser_id, { profileImage: file.filename })
      return await this.fundRaiserRepository.update(fundRaiser.fundraiser_id, { profileImage: file.filename })

    } catch (error) {
      console.log(error);
    }
  }

  async findProfileImage(res, imagename) {
    return of(res.sendFile(path.join(process.cwd(), "uploads/profileImages/" + imagename)));
  }

  async createFundraiserPage(user) {
    try {
      let fundRaiser = await this.findFundRaiserByEmail(user.email)
      let fundRaiserPage = await this.fundraiserPageRepository.findOne({ where: { fundraiser: { fundraiser_id: fundRaiser.fundraiser_id } } })
      if (fundRaiserPage == null) {
        const fundraiserPage: FundraiserPage = new FundraiserPage();
        fundraiserPage.supporters = []
        fundraiserPage.gallery = []
        fundraiserPage.fundraiser = fundRaiser;
        await this.fundraiserPageRepository.save(fundraiserPage);
        return fundraiserPage;
      }
      else {
        return "Fundraiser Page already exists"
      }
    }
    catch (error) {
      throw new NotFoundException("Fundraiser does not exist")
    }

  }

  async getDonationByIdFundraiser(user) {
    const fundRaiser = await this.findFundRaiserByEmail(user.email)
    const donation = await this.donationRepository.find({ where: { fundraiser: { fundraiser_id: fundRaiser.fundraiser_id } } })
    return donation;
  }

  async findMany(dto: FindDonationsDto, req) {
    try {
      const { payment_option, payment_status, donation_id, from_date, to_date } = dto;
      let conditions: FindOptionsWhere<Donation> | FindOptionsWhere<Donation>[] = {}
      conditions = {
        ...conditions,
        ...(dto.payment_option ? { payment_type: payment_option } : {}),
        ...(dto.payment_status ? { payment_status: payment_status } : {}),
        ...(req.user.id ? { fundraiser: { fundraiser_id: req.user.id } } : {}),
        ...(dto.donation_id ? { donation_id_frontend: donation_id } : {}),
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
      return await this.donationRepository.find({ relations: { fundraiser: true }, where: conditions })

    } catch (error) {
      console.log(error);
    }
  }

  async downloadExcelforDonations(user, res) {
    try {
      const donations = await this.donationRepository.find({
        where: { fundraiser: { fundraiser_id: user.id } }, // Filter by fundraiser
      });

      const workbook = new exceljs.Workbook();
      const sheet = workbook.addWorksheet('donations');
      sheet.columns = [
        { header: 'Donation Id', key: 'donation_id_frontend' },
        { header: 'Donation Date', key: 'created_at' },
        { header: 'Donor Name', key: 'donor_name' },
        { header: 'Donation Amount', key: 'amount' },
        { header: 'Payment Type', key: 'payment_type' },
        { header: 'Payment Status', key: 'payment_status' },
        { header: '80G Certificate', key: 'certificate' }
      ];

      donations.forEach((value, idx) => {
        sheet.addRow({
          donation_id_frontend: value.donation_id_frontend,
          created_at: value.created_at,
          donor_name: value.donor_name,
          amount: value.amount,
          payment_type: value.payment_type,
          payment_status: value.payment_status,
          certificate: value.certificate
        });
      });

      const downloadsFolder = path.join(__dirname, '../..', 'downloads');
      if (!fs.existsSync(downloadsFolder)) {
        try {
          fs.mkdirSync(downloadsFolder);
        } catch (error) {
          console.error('Error creating downloads folder:', error);
        }
      }

      const filename = `${uuidv4()}.xlsx`;
      const filePath = path.join(downloadsFolder, filename);

      await workbook.xlsx.writeFile(filePath);
      return of(res.sendFile(path.join(process.cwd(), "downloads/" + filename)));


    } catch (error) {
      console.error('Error creating Excel file:', error);
    }

  }

  async downloadExcelReport(res, filename) {
    return of(res.sendFile(path.join(process.cwd(), "uploads/fundraiserPageImages/" + filename)));
  }


}
