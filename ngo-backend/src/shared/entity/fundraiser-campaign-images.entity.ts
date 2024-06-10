import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Fundraiser } from './fundraiser.entity';

@Entity()
export class FundraiserCampaignImages {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  //   @ManyToOne(() => Fundraiser)
  //   @JoinColumn({name:"fundraiser_id"})
  //   fundraiser: Fundraiser;
}
