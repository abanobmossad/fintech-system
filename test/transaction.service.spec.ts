import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from '../src/modules/transactions/transactions.service';
import { AccountsService } from '../src/modules/accounts/accounts.service';
import { getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { Transaction, TransactionDocument } from '../src/modules/transactions/schemas/transaction.schema';
import { Connection, Model, ClientSession } from 'mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TransactionType } from '../src/common/enums/transaction-type.enum';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let accountService: AccountsService;
  let connection: Connection;

  // Create a minimal mock session with only the methods we need
  const mockSession: Partial<ClientSession> = {
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    abortTransaction: jest.fn(),
    endSession: jest.fn(),
    withTransaction: jest.fn().mockImplementation((fn) => fn()),
    inTransaction: () => true,
  } as Partial<ClientSession> as ClientSession;

  // Create a minimal mock connection with only the methods we need
  const mockConnection = {
    startSession: jest.fn().mockResolvedValue(mockSession),
    withSession: jest.fn().mockImplementation(async (optionsOrOperation, operation) => {
      if (typeof optionsOrOperation === 'function') {
        return optionsOrOperation(mockSession);
      }
      return operation(mockSession);
    }),
  } as unknown as Connection;

  const mockTransaction = {
    _id: 'test-transaction-id',
    accountId: 'test-account-id',
    amount: 100,
    type: TransactionType.DEPOSIT,
    save: jest.fn().mockImplementation(function() {
      return Promise.resolve(this);
    }),
  };

  const mockAccount = {
    _id: 'test-account-id',
    name: 'Test User',
    balance: 200,
    save: jest.fn().mockImplementation(function() {
      return Promise.resolve(this);
    }),
  };

  // Mock transaction model
  const mockTransactionModel = {
    prototype: {
      save: jest.fn().mockResolvedValue(mockTransaction),
    },
  };

  // Mock the constructor
  const MockTransactionModel = function(this: any, dto: any) {
    this._id = 'new-transaction-id';
    this.accountId = dto.accountId;
    this.amount = dto.amount;
    this.type = dto.type;
    this.save = jest.fn().mockResolvedValue(this);
    return this;
  } as unknown as Model<TransactionDocument>;

  // Add static methods to the mock model
  Object.assign(MockTransactionModel, {
    ...mockTransactionModel,
    find: jest.fn().mockReturnThis(),
    findById: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockImplementation((dto) => {
      return Promise.resolve(new (MockTransactionModel as any)(dto));
    }),
    save: jest.fn().mockImplementation(function(this: any) {
      return Promise.resolve(this);
    }),
  });

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
          useValue: MockTransactionModel,
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
    
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Set up the mock implementation for the transaction model
    (MockTransactionModel as any).prototype.save = jest.fn().mockImplementation(function(this: any) {
      return Promise.resolve({
        ...this,
        _id: 'new-transaction-id',
        save: (MockTransactionModel as any).prototype.save,
      });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('deposit', () => {
    it('should deposit funds and create a transaction within a session', async () => {
      const result = await service.deposit('test-account-id', 100);

      expect(connection.startSession).toHaveBeenCalled();
      expect(mockSession.startTransaction).toHaveBeenCalled();
      expect(accountService.updateBalance).toHaveBeenCalledWith('test-account-id', 100, mockSession);
      expect(mockSession.commitTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.amount).toBe(100);
      expect(result.type).toBe(TransactionType.DEPOSIT);
    });

    it('should abort transaction on error during deposit', async () => {
      const error = new Error('Update failed');
      jest.spyOn(accountService, 'updateBalance').mockRejectedValueOnce(error);

      await expect(service.deposit('test-account-id', 100)).rejects.toThrow(error);

      expect(connection.startSession).toHaveBeenCalled();
      expect(mockSession.startTransaction).toHaveBeenCalled();
      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockSession.commitTransaction).not.toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
    });
  });

  describe('withdraw', () => {
    it('should withdraw funds and create a transaction within a session', async () => {
      const result = await service.withdraw('test-account-id', 50);

      expect(connection.startSession).toHaveBeenCalled();
      expect(mockSession.startTransaction).toHaveBeenCalled();
      expect(accountService.findById).toHaveBeenCalledWith('test-account-id', mockSession);
      expect(accountService.updateBalance).toHaveBeenCalledWith('test-account-id', -50, mockSession);
      expect(mockSession.commitTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.amount).toBe(50);
      expect(result.type).toBe(TransactionType.WITHDRAWAL);
    });

    it('should throw BadRequestException and abort for insufficient funds', async () => {
      const lowBalanceAccount = { ...mockAccount, balance: 50 };
      jest.spyOn(accountService, 'findById').mockResolvedValueOnce(lowBalanceAccount as any);
      
      await expect(service.withdraw('test-account-id', 100)).rejects.toThrow(BadRequestException);

      expect(connection.startSession).toHaveBeenCalled();
      expect(mockSession.startTransaction).toHaveBeenCalled();
      expect(accountService.findById).toHaveBeenCalledWith('test-account-id', mockSession);
      expect(accountService.updateBalance).not.toHaveBeenCalled();
      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockSession.commitTransaction).not.toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
    });
  });
});
