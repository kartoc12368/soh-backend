import { Column, CreateDateColumn, Entity, Generated, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { IsNumber } from 'class-validator';
import { Donation } from './donation.entity';
import { FundraiserPage } from './fundraiser-page.entity';

@Entity()
export class Fundraiser {
  @PrimaryGeneratedColumn('uuid')
  fundraiser_id: string;

  @Generated()
  @Column()
  f_id: number;

  @Column()
  firstName: string;

  @Column({
    nullable: true,
  })
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column()
  role: string;

  @Column({})
  status: string;

  @IsNumber()
  @Column({ nullable: true })
  mobile_number: number;

  // @Column('text',{array: true,nullable:true})
  // profilePicture:string[];

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  profileImage: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  pincode: number;

  @Column({ nullable: true })
  dob: Date;

  @Column({ nullable: true })
  pan: string;

  @Column({ default: 0 })
  total_amount_raised: number;

  @Column({ default: 0 })
  total_donations: number;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  public created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  public updated_at: Date;

  @OneToMany(() => Donation, (donation) => donation.fundraiser, {
    onDelete: 'SET NULL',
  })
  donations: Donation[];

  @OneToOne(
    () => FundraiserPage,
    (fundraiserPage) => fundraiserPage.fundraiser,
    { onDelete: 'CASCADE' },
  )
  fundraiser_page: FundraiserPage;
}
