import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from '../src/modules/transactions/transactions.controller';
import { TransactionsService } from '../src/modules/transactions/transactions.service';
import { CreateTransactionDto } from '../src/modules/transactions/dto/create-transaction.dto';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';

describe('TransactionsController', () => {
  let controller: TransactionsController;
  let service: TransactionsService;

  const mockTransaction = {
    _id: 'test-id',
    accountId: 'test-account-id',
    amount: 100,
    type: 'DEPOSIT',
    createdAt: new Date(),
  };

  const mockError = new Error('Database error');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        {
          provide: TransactionsService,
          useValue: {
            deposit: jest.fn().mockResolvedValue(mockTransaction),
            withdraw: jest.fn().mockResolvedValue(mockTransaction),
          },
        },
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
    service = module.get<TransactionsService>(TransactionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('deposit', () => {
    const createTransactionDto: CreateTransactionDto = { accountId: 'test-account-id', amount: 100 };

    it('should successfully deposit funds', async () => {
      const result = await controller.deposit(createTransactionDto);
      
      expect(result).toEqual(mockTransaction);
      expect(service.deposit).toHaveBeenCalledWith(
        createTransactionDto.accountId,
        createTransactionDto.amount
      );
    });

    it('should handle service errors during deposit', async () => {
      jest.spyOn(service, 'deposit').mockRejectedValueOnce(mockError);
      
      await expect(controller.deposit(createTransactionDto))
        .rejects
        .toThrow(InternalServerErrorException);
    });

    it('should handle validation errors during deposit', async () => {
      const invalidDto = { ...createTransactionDto, amount: -100 };
      
      await expect(controller.deposit(invalidDto as any))
        .rejects
        .toThrow(BadRequestException);
    });
  });

  describe('withdraw', () => {
    const createTransactionDto: CreateTransactionDto = { accountId: 'test-account-id', amount: 100 };

    it('should successfully withdraw funds', async () => {
      const result = await controller.withdraw(createTransactionDto);
      
      expect(result).toEqual(mockTransaction);
      expect(service.withdraw).toHaveBeenCalledWith(
        createTransactionDto.accountId,
        createTransactionDto.amount
      );
    });

    it('should handle insufficient funds error', async () => {
      const error = new BadRequestException('Insufficient funds');
      jest.spyOn(service, 'withdraw').mockRejectedValueOnce(error);
      
      await expect(controller.withdraw(createTransactionDto))
        .rejects
        .toThrow(BadRequestException);
    });

    it('should handle service errors during withdrawal', async () => {
      jest.spyOn(service, 'withdraw').mockRejectedValueOnce(mockError);
      
      await expect(controller.withdraw(createTransactionDto))
        .rejects
        .toThrow(InternalServerErrorException);
    });
  });
});
