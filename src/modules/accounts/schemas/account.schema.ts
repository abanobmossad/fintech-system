import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AccountDocument = Account & Document;

@Schema({ timestamps: true })
export class Account {
  @Prop({ required: true })
  name: string;

  @Prop({ required: false, unique: true, sparse: true })
  email?: string;

  @Prop({ required: false })
  mobile?: string;

  @Prop({ default: 0 })
  balance: number;

  createdAt: Date;

  updatedAt: Date;
}

export const AccountSchema = SchemaFactory.createForClass(Account);
