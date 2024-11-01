import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class DocumentEmbedding {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('text')
  content: string;

  @ApiProperty({
    description: 'Vector embedding of the content',
    type: 'array',
    items: {
      type: 'number'
    }
  })
  @Column({
    type: 'real',
    array: true,
    nullable: true,
  })
  embedding: number[];

  @ApiProperty()
  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @ApiProperty()
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}