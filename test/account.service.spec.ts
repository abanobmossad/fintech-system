import { Test, TestingModule } from '@nestjs/testing';
import { AccountsService } from '../src/modules/accounts/accounts.service';
import { getModelToken } from '@nestjs/mongoose';
import { Account, AccountDocument } from '../src/modules/accounts/schemas/account.schema';
import { Model } from 'mongoose';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CreateAccountDto } from '../src/modules/accounts/dto/create-account.dto';

describe('AccountsService', () => {
  let service: AccountsService;
  let model: Model<AccountDocument>;

  const mockAccount = {
    _id: '60c72b9f9b1d8c001f8e4a9a',
    name: 'Test User',
    email: 'test@example.com',
    balance: 100,
    save: jest.fn().mockResolvedValue(this),
  };

  // Mock account document
  const mockAccountDocument = {
    _id: 'test-account-id',
    name: 'Test User',
    email: 'test@example.com',
    balance: 100,
    save: jest.fn().mockImplementation(function () {
      return Promise.resolve(this);
    }),
  };

  // Mock Model
  const MockAccountModel: any = function (dto: any) {
    return {
      ...dto,
      _id: 'new-account-id',
      save: jest.fn().mockResolvedValue({
        ...dto,
        _id: 'new-account-id',
        save: MockAccountModel.prototype.save,
      }),
    };
  };

  // Add static methods to the mock model
  MockAccountModel.findOne = jest.fn().mockReturnThis();
  MockAccountModel.findById = jest.fn().mockReturnThis();
  MockAccountModel.exec = jest.fn().mockResolvedValue(mockAccountDocument);

  beforeEach(async () => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Reset the mock implementations
    MockAccountModel.findOne.mockReturnThis();
    MockAccountModel.findById.mockReturnThis();
    MockAccountModel.exec.mockResolvedValue(mockAccountDocument);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsService,
        {
          provide: getModelToken(Account.name),
          useValue: MockAccountModel,
        },
      ],
    }).compile();

    service = module.get<AccountsService>(AccountsService);
    model = module.get<Model<AccountDocument>>(getModelToken(Account.name));

    // Add session method to the model
    (model as any).startSession = jest.fn().mockResolvedValue({
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
      withTransaction: jest.fn().mockImplementation((fn) => fn()),
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save an account with name and email', async () => {
      const createAccountDto: CreateAccountDto = { name: 'Test User', email: 'test@example.com' };
      MockAccountModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      const result = await service.create(createAccountDto);

      expect(MockAccountModel.findOne).toHaveBeenCalledWith({ email: createAccountDto.email });
      expect(result.name).toEqual(createAccountDto.name);
      expect(result.email).toEqual(createAccountDto.email);
    });

    it('should create and save an account with only a name', async () => {
      const createAccountDto: CreateAccountDto = { name: 'Test User' };
      MockAccountModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      const result = await service.create(createAccountDto);

      expect(result.name).toEqual(createAccountDto.name);
      expect(MockAccountModel.findOne).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      const createAccountDto: CreateAccountDto = { name: 'Test User', email: 'test@example.com' };
      MockAccountModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAccountDocument)
      });

      await expect(service.create(createAccountDto)).rejects.toThrow(ConflictException);
      expect(MockAccountModel.findOne).toHaveBeenCalledWith({ email: createAccountDto.email });
    });
  });

  describe('findById', () => {
    it('should find an account by id', async () => {
      MockAccountModel.findById.mockReturnValue({
        session: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockAccountDocument)
      });

      const result = await service.findById('test-account-id');

      expect(MockAccountModel.findById).toHaveBeenCalledWith('test-account-id');
      expect(result).toEqual(mockAccountDocument);
    });

    it('should throw NotFoundException if account not found', async () => {
      MockAccountModel.findById.mockReturnValue({
        session: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null)
      });

      await expect(service.findById('non-existent-id')).rejects.toThrow(NotFoundException);
      expect(MockAccountModel.findById).toHaveBeenCalledWith('non-existent-id');
    });
  });

  describe('findByEmail', () => {
    it('should find an account by email', async () => {
      const email = 'test@example.com';
      MockAccountModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAccountDocument)
      });

      const result = await service.findByEmail(email);

      expect(MockAccountModel.findOne).toHaveBeenCalledWith({ email });
      expect(result).toEqual(mockAccountDocument);
    });
  });

  describe('updateBalance', () => {
    it('should update the balance of an account', async () => {
      const accountToUpdate = {
        ...mockAccountDocument,
        balance: 100,
        save: jest.fn().mockImplementation(function (this: any) {
          return Promise.resolve(this);
        })
      };

      jest.spyOn(service, 'findById').mockResolvedValue(accountToUpdate as any);

      const updatedAccount = await service.updateBalance('test-account-id', 50);

      expect(service.findById).toHaveBeenCalledWith('test-account-id', undefined);
      expect(updatedAccount.balance).toEqual(150);
      expect(accountToUpdate.save).toHaveBeenCalled();
    });
  });
});
