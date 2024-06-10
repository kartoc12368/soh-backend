import { Column, CreateDateColumn, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { RoleEnum } from '../enums/role.enum';
import { Donation } from './donation.entity';
import { FundraiserPage } from './fundraiser-page.entity';

@Entity()
export class Fundraiser {
  @PrimaryGeneratedColumn('uuid')
  fundraiser_id: string;

  @Column({ generated: true })
  f_id: number;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ nullable: true, name: 'last_name' })
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column('character varying', {
    length: 255,
    nullable: true,
    select: false,
  })
  password: string;

  @Column({ type: 'enum', enum: RoleEnum, default: RoleEnum.FUNDRAISER_ROLE })
  role: string;

  @Column()
  status: string;

  @Column({ nullable: true })
  mobile_number: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column('character varying', { name: 'profile_image', nullable: true, length: 200 })
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
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updated_at: Date;

  @OneToMany(() => Donation, (donation) => donation.fundraiser, { onDelete: 'SET NULL' })
  donations: Donation[];

  @OneToOne(() => FundraiserPage, (fundraiserPage) => fundraiserPage.fundraiser, { onDelete: 'CASCADE' })
  fundraiser_page: FundraiserPage;
}
