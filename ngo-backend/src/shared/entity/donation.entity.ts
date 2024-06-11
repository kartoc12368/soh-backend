import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { Fundraiser } from './fundraiser.entity';

import { PaymentStatus } from '../enums/payment-status.enum';
import { PaymentType } from '../enums/payment-type.enum';
import { ProjectName } from '../enums/project.enum';

@Entity()
export class Donation {
  @PrimaryGeneratedColumn('uuid')
  donation_id: string;

  @Column({ generated: true })
  donation_id_frontend: number;

  @Column({ type: 'float' })
  amount: number;

  @Column('character varying', {
    nullable: true,
    length: 150,
  })
  donor_first_name: string;

  @Column('character varying', {
    nullable: true,
    length: 150,
  })
  donor_last_name: string;

  @Column({ nullable: true })
  pan: string;

  @Column('character varying', { nullable: true, length: 255 })
  donor_email: string;

  @Column('character varying', { length: 15 })
  donor_phone: string;

  @Column({ nullable: true })
  donor_address: string;

  @Column({ nullable: true })
  comments: string;

  @Column({
    nullable: true,
    type: 'enum',
    enum: PaymentType,
    default: PaymentType.ONLINE,
  })
  payment_type: string;

  @Column({
    nullable: true,
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  payment_status: string;

  @Column({ nullable: true })
  order_id: string;

  @Column({ nullable: true, default: null })
  payment_id: string;

  @Column({ nullable: true, default: null })
  payment_order_id: string;

  @Column({ nullable: true, default: null })
  payment_signature: string;

  @Column({ nullable: true, type: 'date' })
  donation_date: Date;

  @Column('character varying', { nullable: true, length: 100 })
  donor_city: string;

  @Column('character varying', { nullable: true, length: 100 })
  donor_state: string;

  @Column({ nullable: true })
  donor_country: string;

  @Column({ nullable: true })
  donor_bank_name: string;

  @Column({ nullable: true })
  donor_bank_branch: string;

  @Column({ nullable: true })
  donor_pincode: number;

  @Column({ nullable: true })
  @Column({
    nullable: true,
    type: 'enum',
    enum: {
      No: 'No',
      Yes: 'Yes',
    },
    default: 'No',
  })
  certificate: string;

  @Column({ nullable: true })
  reference_payment: string;

  @Column({ nullable: true, type: 'enum', enum: ProjectName })
  project_name: string;

  @Column({ nullable: true })
  payment_method: string;

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

  @ManyToOne(() => Fundraiser, (fundraiser) => fundraiser.donations, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'fundraiser_id' })
  fundraiser: Fundraiser;
}
