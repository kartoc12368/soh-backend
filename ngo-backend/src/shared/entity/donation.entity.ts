import { Column, CreateDateColumn, Entity, Generated, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Fundraiser } from './fundraiser.entity';
import { PaymentType } from '../enums/payment-type.enum';
import { PaymentStatus } from '../enums/payment-status.enum';

@Entity()
export class Donation {
  @PrimaryGeneratedColumn('uuid')
  donation_id: string;

  @Generated()
  @Column()
  donation_id_frontend: number;

  @Column()
  amount: number;

  @Column({ nullable: true })
  donor_name: string;

  @Column({ nullable: true })
  pan: string;

  @Column({ nullable: true })
  donor_email: string;

  @Column({ nullable: true })
  donor_phone: number;

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
  donation_date: Date;

  @Column({ nullable: true })
  donor_city: string;

  @Column({ nullable: true })
  donor_state: string;

  @Column({ nullable: true })
  donor_country: string;

  @Column({ nullable: true })
  donor_bankName: string;

  @Column({ nullable: true })
  donor_bankBranch: string;

  @Column({ nullable: true })
  donor_pincode: number;

  @Column({ nullable: true })
  certificate: string;

  @Column({ nullable: true })
  reference_payment: string;

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

  @ManyToOne(() => Fundraiser, (fundraiser) => fundraiser.donations, {
    onDelete: 'SET NULL',
  })
  fundraiser: Fundraiser;
}
