import { IsMongoId, IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty({ description: 'The ID of the account for the transaction' })
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  accountId: string;

  @ApiProperty({ description: 'The amount to deposit or withdraw' })
  @IsNumber()
  @IsPositive()
  amount: number;
}
