import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FastifyReply } from 'fastify';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;
  let reply: FastifyReply;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: {
            create: jest.fn().mockResolvedValue({}),
            findAll: jest.fn().mockResolvedValue({}),
            findOne: jest.fn().mockResolvedValue({}),
            update: jest.fn().mockResolvedValue({}),
            remove: jest.fn().mockResolvedValue({}),
          },
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);

    reply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as any;
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('debe llamar a ProductsService.create y retornar el resultado', async () => {
      const dto: CreateProductDto = {
        name: 'Nuevo Producto',
        price: 10,
        stock: 5,
      };
      const mockResponse = { success: true, data: dto };

      (service.create as jest.Mock).mockResolvedValueOnce(
        Promise.resolve(mockResponse),
      );

      const result = await controller.create(reply, dto);

      expect(service.create).toHaveBeenCalledWith(reply, dto);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findAll', () => {
    it('debe llamar a ProductsService.findAll y retornar los productos', async () => {
      const mockResponse = {
        success: true,
        data: [{ id: '1', name: 'Producto 1' }],
      };

      (service.findAll as jest.Mock).mockResolvedValueOnce(
        Promise.resolve(mockResponse),
      );

      const result = await controller.findAll(reply);

      expect(service.findAll).toHaveBeenCalledWith(reply);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findOne', () => {
    it('debe llamar a ProductsService.findOne con un id y retornar un producto', async () => {
      const id = '1';
      const mockResponse = { success: true, data: { id, name: 'Producto 1' } };

      (service.findOne as jest.Mock).mockResolvedValueOnce(
        Promise.resolve(mockResponse),
      );

      const result = await controller.findOne(id, reply);

      expect(service.findOne).toHaveBeenCalledWith(id, reply);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('update', () => {
    it('debe llamar a ProductsService.update con un id y dto', async () => {
      const id = '1';
      const dto: UpdateProductDto = { name: 'Producto Actualizado' };
      const mockResponse = { success: true, data: { id, ...dto } };

      (service.update as jest.Mock).mockResolvedValueOnce(
        Promise.resolve(mockResponse),
      );

      const result = await controller.update(id, reply, dto);

      expect(service.update).toHaveBeenCalledWith(id, reply, dto);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('remove', () => {
    it('debe llamar a ProductsService.remove con un id', async () => {
      const id = '1';
      const mockResponse = { success: true, message: 'Producto eliminado' };

      (service.remove as jest.Mock).mockResolvedValueOnce(
        Promise.resolve(mockResponse),
      );

      const result = await controller.remove(id, reply);

      expect(service.remove).toHaveBeenCalledWith(id, reply);
      expect(result).toEqual(mockResponse);
    });
  });
});
