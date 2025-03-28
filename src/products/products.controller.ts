import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Res,
  Put,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FastifyReply } from 'fastify';
import { PaginationDto } from '../helpers/PaginationDto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(
    @Res() reply: FastifyReply,
    @Body() createProductDto: CreateProductDto,
  ) {
    return this.productsService.create(reply, createProductDto);
  }

  @Get()
  findAll(@Res() reply: FastifyReply, @Query() query: PaginationDto) {
    return this.productsService.findAll(reply, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Res() reply: FastifyReply) {
    return this.productsService.findOne(id, reply);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Res() reply: FastifyReply,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, reply, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Res() reply: FastifyReply) {
    return this.productsService.remove(id, reply);
  }
}
