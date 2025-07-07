import { Test, TestingModule } from '@nestjs/testing';
import { AccountsService } from '../src/modules/accounts/accounts.service';
import { CreateAccountDto } from '../src/modules/accounts/dto/create-account.dto';
import { AccountsController } from '../src/modules/accounts/accounts.controller';

describe('AccountController', () => {
  let controller: AccountsController;
  let service: AccountsService;

  const mockAccount = {
    _id: '60c72b9f9b1d8c001f8e4a9a',
    name: 'Test User',
    email: 'test@example.com',
    balance: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountsController],
      providers: [
        {
          provide: AccountsService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockAccount),
            findById: jest.fn().mockResolvedValue(mockAccount),
          },
        },
      ],
    }).compile();

    controller = module.get<AccountsController>(AccountsController);
    service = module.get<AccountsService>(AccountsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an account', async () => {
      const createAccountDto: CreateAccountDto = { name: 'Test User', email: 'test@example.com' };
      const result = await controller.create(createAccountDto);
      expect(result).toEqual(mockAccount);
      expect(service.create).toHaveBeenCalledWith(createAccountDto);
    });
  });

  describe('getBalance', () => {
    it('should return the account balance', async () => {
      const result = await controller.getBalance(mockAccount._id);
      expect(result).toEqual(mockAccount);
      expect(service.findById).toHaveBeenCalledWith(mockAccount._id);
    });
  });
});
