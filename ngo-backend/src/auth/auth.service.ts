import {Injectable, NotFoundException} from '@nestjs/common';
import { sendEmailDto } from 'src/mailer/mail.interface';
import { MailerService } from 'src/mailer/mailer.service';
import { ForgottenPasswordRepository } from './repo/forgot-password.repo';
import { ForgottenPassword } from './entities/forgot-password.entity';
import { FundraiserService } from 'src/fundraiser/fundraiser.service';

@Injectable()
export class AuthService {

    constructor(
        private mailerService: MailerService,
        private forgottenPasswordRepository:ForgottenPasswordRepository,
        private fundraiserService:FundraiserService
    ){}

    async sendEmailForgotPassword(email:string){
        const user = await this.fundraiserService.findFundRaiserByEmail(email)
        if(!user){
            throw new NotFoundException("User not found")
        }

        var randomstring = Math.random().toString(36).slice(-8);
        var body2 = {
            "firstName":user.firstName,
            "otp":randomstring
        }
        const dto:sendEmailDto = {
            recipients: [{name: user.firstName, address:user.email}],
            subject: "Reset Password",
            html: "<p>Hi {firstName}, Reset password using:{otp} </p><p>Otp expires in<strong>10</strong>minutes</p>",
            placeholderReplacements:body2
          };
          await this.mailerService.sendMail(dto);
  
        let forgotPassword = new ForgottenPassword()
        forgotPassword.email = email
        forgotPassword.newPasswordToken = randomstring
        await this.forgottenPasswordRepository.save(forgotPassword)  
        setTimeout(async ()=>{
            try{
            var user2 = await this.forgottenPasswordRepository.findOne({where:{email:email}})
            await this.forgottenPasswordRepository.remove(user2)
            
            }catch{
                return true
            }},600000)   
                 return "true"
    }
    
       
    // async refreshToken(req: Request, res: Response): Promise<string> {
    //     const refreshToken = req.cookies['refresh_token'];
    
    //     if (!refreshToken) {
    //       throw new UnauthorizedException('Refresh token not found');
    //     }
    
    //     let payload;
    //     try {
    //       payload = this.jwtService.verify(refreshToken, {
    //         secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
    //       });
    //     } catch (error) {
    //       throw new UnauthorizedException('Invalid or expired refresh token');
    //     }
    
    //     const userExists = await this.userRepository.findOne({
    //       where: { id: payload.sub },
    //     });
    
    //     if (!userExists) {
    //       throw new BadRequestException('User no longer exists');
    //     }
    
    //     const expiresIn = 15000; // seconds
    //     const expiration = Math.floor(Date.now() / 1000) + expiresIn;
    //     const accessToken = this.jwtService.sign(
    //       { ...payload, exp: expiration },
    //       {
    //         secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
    //       },
    //     );
    
    //     res.cookie('access_token', accessToken, { httpOnly: true });
    
    //     return accessToken;
    //   }
    
    //   async issueTokens(user: User, response: Response) {
    //     const payload = { username: user.firstName, sub: user.id ,role:user.role};
    //     const accessToken = this.jwtService.sign(
    //       { ...payload },
    //       {
    //         secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
    //         expiresIn: '150sec',
    //       },
    //     );

    //     const refreshToken = this.jwtService.sign(payload, {
    //       secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
    //       expiresIn: '7d',
    //     });

    //     response.cookie('access_token', accessToken, { httpOnly: true ,maxAge:150000});
    //     response.cookie('refresh_token', refreshToken, {
    //       httpOnly: true,
    //     });
    //     return { user };
    //   }
       
     
}
