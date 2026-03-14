import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: Partial<Record<keyof UsersService, jest.Mock>>;
  let jwtService: Partial<Record<keyof JwtService, jest.Mock>>;

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should register a new user and return token', async () => {
      usersService.findByEmail!.mockResolvedValue(null);
      usersService.create!.mockResolvedValue({
        id: '1',
        name: 'João',
        email: 'joao@email.com',
        role: 'USER',
      });

      const result = await service.register({
        name: 'João',
        email: 'joao@email.com',
        password: 'senha123',
      });

      expect(result.access_token).toBe('mock-jwt-token');
      expect(result.user.email).toBe('joao@email.com');
    });

    it('should throw ConflictException if email exists', async () => {
      usersService.findByEmail!.mockResolvedValue({ id: '1' });

      await expect(
        service.register({
          name: 'João',
          email: 'joao@email.com',
          password: 'senha123',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should login and return token', async () => {
      const hashed = await bcrypt.hash('senha123', 10);
      usersService.findByEmail!.mockResolvedValue({
        id: '1',
        name: 'João',
        email: 'joao@email.com',
        password: hashed,
        role: 'USER',
      });

      const result = await service.login({
        email: 'joao@email.com',
        password: 'senha123',
      });

      expect(result.access_token).toBe('mock-jwt-token');
    });

    it('should throw UnauthorizedException on wrong password', async () => {
      const hashed = await bcrypt.hash('senha123', 10);
      usersService.findByEmail!.mockResolvedValue({
        id: '1',
        password: hashed,
      });

      await expect(
        service.login({ email: 'joao@email.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException on unknown email', async () => {
      usersService.findByEmail!.mockResolvedValue(null);

      await expect(
        service.login({ email: 'unknown@email.com', password: 'senha123' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
