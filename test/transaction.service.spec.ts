import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from '../src/modules/transactions/transactions.service';
import { AccountsService } from '../src/modules/accounts/accounts.service';
import { getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { Transaction } from '../src/modules/transactions/schemas/transaction.schema';
import { Connection, Model } from 'mongoose';
import { BadRequestException } from '@nestjs/common';
import { TransactionType } from '../src/common/enums/transaction-type.enum';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let accountService: AccountsService;
  let connection: Connection;

  const mockSession = {
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    abortTransaction: jest.fn(),
    endSession: jest.fn(),
  };

  const mockConnection = {
    startSession: jest.fn().mockResolvedValue(mockSession),
  };

  const mockTransaction = {
    accountId: 'test-account-id',
    amount: 100,
    type: TransactionType.DEPOSIT,
    save: jest.fn().mockResolvedValue(this),
  };

  const mockAccount = {
    _id: 'test-account-id',
    name: 'Test User',
    balance: 200,
    save: jest.fn().mockResolvedValue(this),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: AccountsService,
          useValue: {
            findById: jest.fn().mockResolvedValue(mockAccount),
            updateBalance: jest.fn().mockResolvedValue(mockAccount),
          },
        },
        {
          provide: getModelToken(Transaction.name),
          useValue: {
            new: jest.fn().mockReturnValue(mockTransaction),
            save: jest.fn().mockResolvedValue(mockTransaction),
          },
        },
        {
          provide: getConnectionToken(),
          useValue: mockConnection,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    accountService = module.get<AccountsService>(AccountsService);
    connection = module.get<Connection>(getConnectionToken());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('deposit', () => {
    it('should deposit funds and create a transaction within a session', async () => {
      await service.deposit('test-account-id', 100);

      expect(connection.startSession).toHaveBeenCalled();
      expect(mockSession.startTransaction).toHaveBeenCalled();
      expect(accountService.updateBalance).toHaveBeenCalledWith('test-account-id', 100, mockSession);
      expect(mockSession.commitTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
    });

    it('should abort transaction on error during deposit', async () => {
      jest.spyOn(accountService, 'updateBalance').mockRejectedValueOnce(new Error('Update failed'));

      await expect(service.deposit('test-account-id', 100)).rejects.toThrow('Update failed');

      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockSession.commitTransaction).not.toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
    });
  });

  describe('withdraw', () => {
    it('should withdraw funds and create a transaction within a session', async () => {
      await service.withdraw('test-account-id', 50);

      expect(connection.startSession).toHaveBeenCalled();
      expect(mockSession.startTransaction).toHaveBeenCalled();
      expect(accountService.findById).toHaveBeenCalledWith('test-account-id', mockSession);
      expect(accountService.updateBalance).toHaveBeenCalledWith('test-account-id', -50, mockSession);
      expect(mockSession.commitTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
    });

    it('should throw BadRequestException and abort for insufficient funds', async () => {
      jest.spyOn(accountService, 'findById').mockResolvedValue({ ...mockAccount, balance: 50 } as any);
      
      await expect(service.withdraw('test-account-id', 100)).rejects.toThrow(BadRequestException);

      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockSession.commitTransaction).not.toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
    });
  });
});
