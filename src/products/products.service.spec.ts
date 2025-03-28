import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FastifyReply } from 'fastify';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { PaginationDto } from 'src/helpers/PaginationDto';

jest.mock('../helpers/Response.ts', () => ({
  response: jest.fn((reply, status, success, data, message) => ({
    statusCode: status,
    success,
    data,
    message,
  })),
}));

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: Repository<Product>;
  let reply: FastifyReply;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get<Repository<Product>>(getRepositoryToken(Product));

    reply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as any;
  });

  it('debe retornar error si el producto ya existe', async () => {
    const createProductDto: CreateProductDto = {
      name: 'Producto 1',
      price: 10,
      stock: 10,
    };

    jest.spyOn(repository, 'findOne').mockResolvedValueOnce({
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Producto 1',
      price: 10,
      stock: 10,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Product);

    const result = await service.create(reply, createProductDto);

    expect(repository.findOne).toHaveBeenCalledWith({
      where: { name: 'Producto 1', isDeleted: false },
    });
    expect(result).toEqual({
      statusCode: 400,
      success: false,
      data: null,
      message: 'El Producto ya existe',
    });
  });

  it('debe crear un producto correctamente', async () => {
    const createProductDto: CreateProductDto = {
      name: 'Nuevo Producto',
      price: 10,
      stock: 10,
    };
    const newProduct: Product = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Nuevo Producto',
      price: 10,
      stock: 10,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Product;

    jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);
    jest.spyOn(repository, 'create').mockReturnValue(newProduct);
    jest.spyOn(repository, 'save').mockResolvedValueOnce(newProduct);

    const result = await service.create(reply, createProductDto);

    expect(repository.create).toHaveBeenCalledWith(createProductDto);
    expect(repository.save).toHaveBeenCalledWith(newProduct);
    expect(result).toEqual({
      statusCode: 201,
      success: true,
      data: newProduct,
      message: 'Producto creado correctamente',
    });
  });

  it('debe manejar errores correctamente', async () => {
    const createProductDto: CreateProductDto = {
      name: 'Error Producto',
      price: 10,
      stock: 10,
    };

    jest
      .spyOn(repository, 'findOne')
      .mockRejectedValueOnce(new Error('DB Error'));

    const result = await service.create(reply, createProductDto);

    expect(result).toHaveProperty('statusCode', 500);
    expect(result).toHaveProperty('success', false);
    expect(result).toHaveProperty('message', 'DB Error');
  });

  it('debe retornar error si el nombre del producto ya existe al actualizar', async () => {
    const existingProduct: Product = {
      id: 'uuid-1',
      name: 'Producto A',
      price: 10,
      stock: 10,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Product;

    const conflictingProduct: Product = {
      id: 'uuid-2',
      name: 'Producto B',
      price: 20,
      stock: 5,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Product;

    jest.spyOn(repository, 'findOne').mockResolvedValueOnce(existingProduct);
    jest.spyOn(repository, 'findOne').mockResolvedValueOnce(conflictingProduct);

    const result = await service.update('uuid-1', reply, {
      name: 'Producto B',
    });

    expect(result).toEqual({
      statusCode: 400,
      success: false,
      data: null,
      message: 'Ya Existe un producto con este nombre Producto B',
    });
  });

  it('debe retornar error si el producto ya está eliminado', async () => {
    jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);

    const result = await service.remove('uuid-1', reply);

    expect(result).toEqual({
      statusCode: 404,
      success: false,
      data: null,
      message: 'Producto no encontrado',
    });
  });

  it('debe manejar errores en findAll', async () => {
    const mockQuery: PaginationDto = { page: 1, pageSize: 10 };

    jest
      .spyOn(service, 'findAll')
      .mockRejectedValueOnce(new Error('DB Error en findAll'));

    await expect(service.findAll(reply, mockQuery)).rejects.toThrowError(
      'DB Error en findAll',
    );
  });

  it('debe manejar errores en findOne', async () => {
    jest
      .spyOn(repository, 'findOne')
      .mockRejectedValueOnce(new Error('DB Error en findOne'));

    const result = await service.findOne('uuid-1', reply);

    expect(result).toEqual({
      statusCode: 500,
      success: false,
      data: null,
      message: 'DB Error en findOne',
    });
  });

  it('debe manejar errores en update', async () => {
    jest
      .spyOn(repository, 'findOne')
      .mockRejectedValueOnce(new Error('DB Error en update'));

    const result = await service.update('uuid-1', reply, {
      name: 'Producto Modificado',
    });

    expect(result).toEqual({
      statusCode: 500,
      success: false,
      data: null,
      message: 'DB Error en update',
    });
  });

  it('debe manejar errores en remove', async () => {
    jest
      .spyOn(repository, 'findOne')
      .mockRejectedValueOnce(new Error('DB Error en remove'));

    const result = await service.remove('uuid-1', reply);

    expect(result).toEqual({
      statusCode: 500,
      success: false,
      data: null,
      message: 'DB Error en remove',
    });
  });
});
