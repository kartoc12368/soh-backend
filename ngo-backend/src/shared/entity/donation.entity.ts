import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { Fundraiser } from './fundraiser.entity';

import { PaymentStatus } from '../enums/payment-status.enum';
import { PaymentType } from '../enums/payment-type.enum';
import { ProjectName } from '../enums/project.enum';
import * as crypto from 'crypto';

@Entity()
export class Donation {
  private static readonly encryptionKey = crypto.createHash('sha256').update('your-256-bit-secret').digest('base64').substr(0, 32);
  private static readonly algorithm = 'aes-256-cbc';

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

  @Column('character varying', {
    nullable: true,
    transformer: {
      to(value: string): string {
        if (!value) return value;
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(Donation.algorithm, Donation.encryptionKey, iv);
        let encrypted = cipher.update(value, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return `${iv.toString('hex')}:${encrypted}`;
      },
      from(value: string): string {
        if (!value) return value;
        const [iv, encrypted] = value.split(':');
        const decipher = crypto.createDecipheriv(Donation.algorithm, Donation.encryptionKey, Buffer.from(iv, 'hex'));
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
      },
    },
  })
  pan: string;

  @Column('character varying', { nullable: true, length: 255 })
  donor_email: string;

  @Column('character varying', { length: 15 })
  donor_phone: string;

  @Column('character varying', {
    nullable: true,
    length: 255,
  })
  donor_address: string;

  @Column('character varying', {
    nullable: true,
    length: 255,
  })
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

  @Column({ nullable: true, type: 'json' })
  donation_activity: object;

  @Column({ nullable: true })
  payment_method: string;

  @Column({ nullable: true })
  payment_info: string;

  @Column({ type: 'json', nullable: true, select: false })
  payment_details: object;

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
