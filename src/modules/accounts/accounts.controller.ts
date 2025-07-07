import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Account } from './schemas/account.schema';

@ApiTags('Accounts')
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @ApiOperation({ summary: 'Open a new account' })
  @ApiResponse({ status: 201, description: 'The account has been successfully created.', type: Account })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  create(@Body() createAccountDto: CreateAccountDto): Promise<Account> {
    return this.accountsService.create(createAccountDto);
  }

  @Get(':id/balance')
  @ApiOperation({ summary: 'Check the balance of an account' })
  @ApiResponse({ status: 200, description: 'The account balance.', type: Account })
  @ApiResponse({ status: 404, description: 'Account not found.' })
  getBalance(@Param('id') id: string): Promise<Account> {
    return this.accountsService.findById(id);
  }
}
