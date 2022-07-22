import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { PaginationInput } from 'src/shares/pagination/pagination.dto';
import { TokensService } from './tokens.service';
import { SearchTokenDto } from './dto/search-token.dto';
import { TokenEntity } from './entities/token.entity';

@ApiTags('Tokens')
@Controller('tokens')
export class TokensController {
  constructor(private readonly tokensService: TokensService) {}

  @Get()
  async findAll(
    @Query() { pageNumber, pageSize }: PaginationInput,
    @Query() searchTokenDto: SearchTokenDto,
  ): Promise<Response<TokenEntity[]>> {
    return this.tokensService.findAll(searchTokenDto, pageNumber, pageSize);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<TokenEntity> {
    return this.tokensService.findOne(+id);
  }
}
