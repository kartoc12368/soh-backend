import { Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt"){

    constructor(private readonly reflector:Reflector){
        super();
    }
    // canActivate(context: ExecutionContext){
    //     const isPublic = this.reflector.get<boolean>(
    //         'isPublic',
    //         context.getHandler()
    //       );
      
    //       if (isPublic) {
    //         return true;
    //       }
      
    //     const ctx = context.switchToHttp();
    //     const request = ctx.getRequest<Request>();

    //     for(let x = 0; x<Constants.BY_PASS_URLS.length; x++){
    //         if(request.url===Constants.BY_PASS_URLS[x]){
    //             return true;
    //         }
    //     }
    // return super.canActivate(context);
    // }

    handleRequest(err, user, info, context) {
        const request = context.switchToHttp().getRequest();
    
        const isPublic = this.reflector.get<boolean>('isPublic', context.getHandler());
        if (user){  return user};  
        
        if (isPublic){
            return false;
        }
        throw new UnauthorizedException();
      }
    

}