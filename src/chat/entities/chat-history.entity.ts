import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class ChatHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  sessionId: string;

  @Column({
    type: 'enum',
    enum: ['system', 'user', 'assistant'],
  })
  role: 'system' | 'user' | 'assistant';

  @Column('text')
  content: string;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}