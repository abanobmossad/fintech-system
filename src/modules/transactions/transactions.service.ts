import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, ClientSession } from 'mongoose';
import { Transaction, TransactionDocument } from './schemas/transaction.schema';
import { AccountsService } from '../accounts/accounts.service';
import { TransactionType } from '../../common/enums/transaction-type.enum';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
    private readonly accountsService: AccountsService,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  /**
   * Helper to handle session lifecycle for atomic transactions.
   */
  private async withAtomicTransaction<T>(fn: (session: ClientSession) => Promise<T>): Promise<T> {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const result = await fn(session);
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException(error.message);
    } finally {
      session.endSession();
    }
  }

  async deposit(accountId: string, amount: number): Promise<Transaction> {
    return this.withAtomicTransaction(async (session) => {
      await this.accountsService.updateBalance(accountId, amount, session);
      const newTransaction = new this.transactionModel({ accountId, amount, type: TransactionType.DEPOSIT });
      await newTransaction.save({ session });
      return newTransaction;
    });
  }

  async withdraw(accountId: string, amount: number): Promise<Transaction> {
    return this.withAtomicTransaction(async (session) => {
      const account = await this.accountsService.findById(accountId, session);
      if (account.balance < amount) {
        throw new BadRequestException('Insufficient funds');
      }
      await this.accountsService.updateBalance(accountId, -amount, session);
      const newTransaction = new this.transactionModel({ accountId, amount, type: TransactionType.WITHDRAWAL });
      await newTransaction.save({ session });
      return newTransaction;
    });
  }
}

