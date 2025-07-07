import { Controller, Post, Body } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Transaction } from './schemas/transaction.schema';

@ApiTags('Transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('deposit')
  @ApiOperation({ summary: 'Deposit funds into an account' })
  @ApiResponse({ status: 201, description: 'The deposit was successful.', type: Transaction })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  deposit(@Body() createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    return this.transactionsService.deposit(createTransactionDto.accountId, createTransactionDto.amount);
  }

  @Post('withdraw')
  @ApiOperation({ summary: 'Withdraw funds from an account' })
  @ApiResponse({ status: 201, description: 'The withdrawal was successful.', type: Transaction })
  @ApiResponse({ status: 400, description: 'Invalid input or insufficient funds.' })
  withdraw(@Body() createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    return this.transactionsService.withdraw(createTransactionDto.accountId, createTransactionDto.amount);
  }
}
