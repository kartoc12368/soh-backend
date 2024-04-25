import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { Fundraiser } from './fundraiser.entity';

@Entity()
export class FundraiserPage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 0 })
  target_amount: number;

  @Column({ default: 0 })
  raised_amount: number;

  @Column({ nullable: true })
  resolution: string;

  @Column({ nullable: true })
  money_raised_for: string;

  @Column({ nullable: true })
  story: string;

  @Column('text', { array: true, nullable: true })
  supporters: string[];

  @Column('text', { array: true, nullable: true })
  gallery: string[];

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

  @OneToOne(() => Fundraiser, (fundraiser) => fundraiser.fundraiser_page, { onDelete: 'CASCADE', })
  @JoinColumn({ name: 'fundraiser_uuid', referencedColumnName: 'fundraiser_id', })
  fundraiser: Fundraiser;
}
