import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as  nodemailer from "nodemailer"
import { sendEmailDto } from './mail.interface';
import Mail from 'nodemailer/lib/mailer';

@Injectable()
export class MailerService {

  constructor(private readonly configService:ConfigService){}
  mailTransport(){
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: this.configService.get<string>("MAIL_HOST"),
      port: this.configService.get<number>("MAIL_PORT"),
      secure: false,
      auth: {
        user: this.configService.get<string>("MAIL_USER"),
        pass: this.configService.get<string>("MAIL_PASSWORD"),
      }
    })
    return transporter;
  }

  //template function is for sending custom html in email

  template( html:string, replacements: Record<string, string>){
    return html.replace(
        /{(\w*)}/g,
        function( m, key ){
          return replacements.hasOwnProperty( key ) ? replacements[ key ] : "";
        }
      );
}


  async sendMail(dto:sendEmailDto){
    const {from,recipients,subject } = dto;
    const html = dto.placeholderReplacements
     ?this.template(dto.html,dto.placeholderReplacements)
     :dto.html

    const transport = this.mailTransport();
    const options:Mail.Options = {
      from: from ??{
        name: this.configService.get<string>("APP_NAME"),
        address: this.configService.get<string>("MAIL_USER"),
      },
      to: recipients,
      subject,
      html,
    }

    try {
      const result = await transport.sendMail(options)
      return result;
    } catch (error) {
      console.log(error);
    }
  }
}
