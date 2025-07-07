import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';
import { Account, AccountDocument } from './schemas/account.schema';
import { CreateAccountDto } from './dto/create-account.dto';

@Injectable()
export class AccountsService {
  constructor(@InjectModel(Account.name) private accountModel: Model<AccountDocument>) {}

  async create(createAccountDto: CreateAccountDto): Promise<Account> {
    const { email } = createAccountDto;
    if (email) {
      const existingAccount = await this.findByEmail(email);
      if (existingAccount) {
        throw new ConflictException('Account with this email already exists');
      }
    }
    const createdAccount = new this.accountModel(createAccountDto);
    return createdAccount.save();
  }

  async findById(id: string, session?: ClientSession): Promise<AccountDocument> {
    const account = await this.accountModel.findById(id).session(session || null).exec();
    if (!account) {
      throw new NotFoundException(`Account with ID #${id} not found`);
    }
    return account;
  }

  async findByEmail(email: string): Promise<AccountDocument> {
    const account = await this.accountModel.findOne({ email }).exec();
    if (!account) {
      throw new NotFoundException(`Account with email #${email} not found`);
    }
    return account;
  }

  async updateBalance(id: string, amount: number, session?: ClientSession): Promise<AccountDocument> {
    const account = await this.findById(id, session);
    account.balance += amount;
    return account.save({ session });
  }
}
