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

  const mockModel = {
    new: jest.fn().mockImplementation((dto) => ({ ...dto, save: jest.fn().mockResolvedValue({ ...dto, _id: 'newId' }) })),
    constructor: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsService,
        {
          provide: getModelToken(Account.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<AccountsService>(AccountsService);
    model = module.get<Model<AccountDocument>>(getModelToken(Account.name));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save an account with name and email', async () => {
      const createAccountDto: CreateAccountDto = { name: 'Test User', email: 'test@example.com' };
      mockModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) } as any);
      mockModel.new.mockImplementation((dto) => ({ ...dto, save: jest.fn().mockResolvedValue({ ...dto, _id: 'newId' }) }));

      const result = await service.create(createAccountDto);

      expect(mockModel.findOne).toHaveBeenCalledWith({ email: createAccountDto.email });
      expect(mockModel.new).toHaveBeenCalledWith(createAccountDto);
      expect(result.name).toEqual(createAccountDto.name);
      expect(result.email).toEqual(createAccountDto.email);
    });

    it('should create and save an account with only a name', async () => {
      const createAccountDto: CreateAccountDto = { name: 'Test User' };
      mockModel.new.mockImplementation((dto) => ({ ...dto, save: jest.fn().mockResolvedValue({ ...dto, _id: 'newId' }) }));

      const result = await service.create(createAccountDto);

      expect(mockModel.new).toHaveBeenCalledWith(createAccountDto);
      expect(result.name).toEqual(createAccountDto.name);
      expect(mockModel.findOne).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      const createAccountDto: CreateAccountDto = { name: 'Test User', email: 'test@example.com' };
      mockModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockAccount) } as any);

      await expect(service.create(createAccountDto)).rejects.toThrow(ConflictException);
      expect(mockModel.findOne).toHaveBeenCalledWith({ email: createAccountDto.email });
    });
  });

  describe('findById', () => {
    it('should find an account by id', async () => {
      mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockAccount) } as any);

      const result = await service.findById(mockAccount._id);

      expect(mockModel.findById).toHaveBeenCalledWith(mockAccount._id);
      expect(result).toEqual(mockAccount);
    });

    it('should throw NotFoundException if account not found', async () => {
      mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) } as any);

      await expect(service.findById('non-existent-id')).rejects.toThrow(NotFoundException);
      expect(mockModel.findById).toHaveBeenCalledWith('non-existent-id');
    });
  });

  describe('findByEmail', () => {
    it('should find an account by email', async () => {
      mockModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockAccount) } as any);

      const result = await service.findByEmail(mockAccount.email);

      expect(mockModel.findOne).toHaveBeenCalledWith({ email: mockAccount.email });
      expect(result).toEqual(mockAccount);
    });

    it('should throw NotFoundException if account not found', async () => {
      mockModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) } as any);

      await expect(service.findByEmail('non-existent-email@example.com')).rejects.toThrow(NotFoundException);
      expect(mockModel.findOne).toHaveBeenCalledWith({ email: 'non-existent-email@example.com' });
    });
  });

  describe('updateBalance', () => {
    it('should update the balance of an account', async () => {
      const accountToUpdate = { ...mockAccount, balance: 100, save: jest.fn().mockResolvedValue(true) };
      jest.spyOn(service, 'findById').mockResolvedValue(accountToUpdate as any);

      const updatedAccount = await service.updateBalance(mockAccount._id, 50);

      expect(service.findById).toHaveBeenCalledWith(mockAccount._id);
      expect(updatedAccount.balance).toEqual(150);
      expect(accountToUpdate.save).toHaveBeenCalled();
    });
  });
});
