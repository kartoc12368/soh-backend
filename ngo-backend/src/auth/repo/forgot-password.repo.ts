import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { ForgottenPassword } from "../entities/forgot-password.entity";



@Injectable()
export class ForgottenPasswordRepository extends Repository<ForgottenPassword>{
    constructor(private dataSource: DataSource){
        super(ForgottenPassword,dataSource.createEntityManager());
    }
}