import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { FundraiserPage } from './fundraiser-page.entity';

@Entity()
export class FundraiserCampaignImages {
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne(() => FundraiserPage)
  @JoinColumn({ name: 'fundraiser_page_id' })
  fundraiser_page: FundraiserPage;

  @Column({ nullable: true })
  image_url: string;
}
