import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { Fundraiser } from './fundraiser.entity';

@Entity()
export class FundraiserPage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 0 })
  target_amount: number;

  @Column({ nullable: true, length: 350 })
  resolution: string;

  @Column({ nullable: true, length: 500 })
  money_raised_for: string;

  @Column({ nullable: true, length: 500 })
  story: string;

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

  @OneToOne(() => Fundraiser, (fundraiser) => fundraiser.fundraiser_page, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fundraiser_id', referencedColumnName: 'fundraiser_id' })
  fundraiser: Fundraiser;
}
