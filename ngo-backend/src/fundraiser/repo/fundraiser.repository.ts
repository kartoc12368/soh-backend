import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { Fundraiser } from "../entities/fundraiser.entity";


@Injectable()
export class FundRaiserRepository extends Repository<Fundraiser>{
    constructor(private dataSource: DataSource){
        super(Fundraiser,dataSource.createEntityManager());
    }
}