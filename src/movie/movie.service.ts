import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entities/movie.entity';
import { Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
  ) {}

  async create(createMovieDto: CreateMovieDto) {
    const movie = this.movieRepository.create({
      ...createMovieDto,
    });
    return this.movieRepository.save(movie);
  }

  async findAll(name?: string) {
    if (!name) {
      return await this.movieRepository.find();
    }
    return await this.movieRepository.findAndCountBy({
      name: Like(`%${name}%`),
    });
  }

  async findOne(id: number) {
    const movie = await this.movieRepository.findBy({ id: id });
    if (!movie) throw new NotFoundException(`Movie ${id} not found`);
    return movie;
  }

  async update(id: number, updateMovieDto: UpdateMovieDto) {
    const movie = await this.movieRepository.findBy({ id: id });
    if (!movie) throw new NotFoundException(`Movie ${id} not found`);
    return await this.movieRepository.update(id, updateMovieDto);
  }

  async remove(id: number) {
    const movie = await this.movieRepository.findBy({ id: id });
    if (!movie) throw new NotFoundException(`Movie ${id} not found`);
    return await this.movieRepository.delete(id);
  }
}
