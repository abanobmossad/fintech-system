import { Test, TestingModule } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
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

  const mockError = new InternalServerErrorException();

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

    // Create a testing app with validation pipes
    const app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }));
    await app.init();
    
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
      
      // Test the DTO validation directly
      const dto = new CreateTransactionDto();
      Object.assign(dto, invalidDto);
      
      // Validate the DTO
      const validationPipe = new ValidationPipe();
      const errors = await validationPipe.transform(dto, {
        type: 'body',
        metatype: CreateTransactionDto,
      }).catch(err => {
        const response = err.getResponse();
        return Array.isArray(response.message) ? response.message : [response.message];
      });
      
      expect(errors).toContain('amount must be a positive number');
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
