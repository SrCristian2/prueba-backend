import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FastifyReply } from 'fastify';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { response } from '../helpers/Response';
import { PaginationDto } from '../helpers/PaginationDto';
import { paginate } from '../helpers/Paginate';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}
  async create(reply: FastifyReply, createProductDto: CreateProductDto) {
    try {
      const { name } = createProductDto;
      const productExists = await this.productRepository.findOne({
        where: { name, isDeleted: false },
      });

      if (productExists) {
        return response(reply, 400, false, null, 'El Producto ya existe');
      }

      const product = this.productRepository.create(createProductDto);
      await this.productRepository.save(product);

      return response(
        reply,
        201,
        true,
        product,
        'Producto creado correctamente',
      );
    } catch (error: any) {
      return this.catchError(reply, error);
    }
  }

  async findAll(reply: FastifyReply, query: PaginationDto) {
    try {
      const { page, pageSize } = query;
      const allProducts = await paginate(
        this.productRepository,
        [],
        { isDeleted: false },
        page,
        pageSize,
        { createdAt: 'DESC' },
      );

      return response(
        reply,
        200,
        true,
        allProducts,
        'Productos obtenidos correctamente',
      );
    } catch (error: any) {
      return this.catchError(reply, error);
    }
  }

  async findOne(id: string, reply: FastifyReply) {
    try {
      const product = await this.productRepository.findOne({
        where: { id, isDeleted: false },
      });

      if (!product) {
        return response(reply, 404, false, null, 'Producto no encontrado');
      }

      return response(
        reply,
        200,
        true,
        product,
        'Producto obtenido correctamente',
      );
    } catch (error: any) {
      return this.catchError(reply, error);
    }
  }

  async update(
    id: string,
    reply: FastifyReply,
    updateProductDto: UpdateProductDto,
  ) {
    try {
      const product = await this.productRepository.findOne({
        where: { id, isDeleted: false },
      });

      if (!product) {
        return response(reply, 404, false, null, 'Producto no encontrado');
      }
      const { name } = updateProductDto;

      if (name !== product.name) {
        const productExists = await this.productRepository.findOne({
          where: { name, isDeleted: false },
        });

        if (productExists) {
          return response(
            reply,
            400,
            false,
            null,
            `Ya Existe un producto con este nombre ${name}`,
          );
        }
      }
      const updatedProduct = this.productRepository.merge(
        product,
        updateProductDto,
      );
      await this.productRepository.save(updatedProduct);

      return response(
        reply,
        200,
        true,
        updatedProduct,
        'Producto actualizado correctamente',
      );
    } catch (error: any) {
      return this.catchError(reply, error);
    }
  }

  async remove(id: string, reply: FastifyReply) {
    try {
      const product = await this.productRepository.findOne({
        where: { id, isDeleted: false },
      });

      if (!product) {
        return response(reply, 404, false, null, 'Producto no encontrado');
      }

      await this.productRepository.update(id, { isDeleted: true });

      return response(
        reply,
        200,
        true,
        null,
        'Producto eliminado correctamente',
      );
    } catch (error: any) {
      return this.catchError(reply, error);
    }
  }
  catchError(reply: FastifyReply, error: any) {
    return response(reply, 500, false, null, error.message);
  }
}
