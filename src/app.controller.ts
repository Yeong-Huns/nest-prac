import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { AppService } from './app.service';
import { CreateMovieDTO } from './app.createMovieDTO';

type Movie = {
  id: number;
  name: string;
  character: string[];
};

@Controller('/movie')
export class AppController {
  constructor(private readonly appService: AppService) {}

  private idCounter = 4;
  private movies: Movie[] = [
    {
      id: 1,
      name: '해리포터',
      character: ['해리포터', '엠마왓슨'],
    },
    {
      id: 2,
      name: '해리포터2',
      character: ['해리포터', '엠마왓슨'],
    },
    {
      id: 3,
      name: '해리포터3',
      character: ['해리포터', '엠마왓슨'],
    },
  ];

  @Get()
  getMovies(@Query('name') name?: string) {
    if (!name) {
      return this.movies;
    }
    return this.movies.filter((movie) => movie.name.startsWith(name));
  }

  @Get('/:id')
  getMovie(@Param('id') id: number) {
    const movie = this.movies.find((movie) => movie.id === +id);
    if (!movie) throw new NotFoundException(`Movie ${id} not found`);

    return movie;
  }

  @Post()
  createMovie(@Body() movie: CreateMovieDTO) {
    const newMovie: Movie = {
      id: this.idCounter,
      ...movie,
    };
    this.idCounter++;
    this.movies.push(newMovie);
  }

  @Delete('/:id')
  deleteMovie(@Param('id') id: number) {
    const movie = this.movies.find((movie) => movie.id === +id);
    if (!movie) throw new NotFoundException(`Movie ${id} not found`);

    return this.movies.filter((movie) => movie.id !== +id);
  }
}
