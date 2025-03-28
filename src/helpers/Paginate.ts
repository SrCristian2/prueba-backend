import {
  FindOptionsOrder,
  FindOptionsWhere,
  ObjectLiteral,
  Repository,
} from 'typeorm';

export const paginate = async <T>(
  repository: Repository<T extends ObjectLiteral ? T : any>,
  relations: string[] = [],
  where: FindOptionsWhere<T extends ObjectLiteral ? T : any> = {},
  page: number = 1,
  pageSize: number = 10,
  order: FindOptionsOrder<T extends ObjectLiteral ? T : any> = {},
) => {
  try {
    const [items, total] = await repository.findAndCount({
      where,
      relations,
      order,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const totalPages = Math.ceil(total / pageSize);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      items,
      pagination: {
        total,
        currentPage: page,
        pageSize,
        totalPages,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null,
      },
    };
  } catch (error) {
    console.error('Error during pagination:', error);
    throw error;
  }
};
