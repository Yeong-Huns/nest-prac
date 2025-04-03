import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entities/movie.entity';
import { EntityManager, In, Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MovieResponse } from './dto/movie-response.dto';
import { MovieDetail } from './entities/movie-detail.entity';
import { Director } from '../director/entities/director.entity';
import { Genre } from '../genre/entities/genre.entity';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    @InjectRepository(MovieDetail)
    private readonly movieDetailRepository: Repository<MovieDetail>,
    @InjectRepository(Director)
    private readonly directorRepository: Repository<Director>,
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
  ) {}

  async create(createMovieDto: CreateMovieDto) {
    const { directorId, genres, detail, ...movieData } = createMovieDto;

    const [director, movieGenres, movieDetail] = await Promise.all([
      this.findDirectorById(directorId),
      this.findOrCreateGenres(genres),
      this.findOrCreateMovieDetail(detail),
    ]);

    const movie = await this.movieRepository.save({
      ...movieData,
      movieDetail,
      director,
      genres: movieGenres,
    });

    return MovieResponse.fromMovie(movie);
  }

  async findAll(name?: string) {
    const options = {
      relations: ['movieDetail', 'director', 'genres'],
      where: name ? { name: Like(`%${name}%`) } : undefined,
    };

    const movies = await this.movieRepository.find(options);
    return movies.map((movie) => MovieResponse.fromMovie(movie));
  }

  async findOne(id: number) {
    const movie = await this.findMovieById(id, [
      'movieDetail',
      'director',
      'genres',
    ]);
    return MovieResponse.fromMovie(movie);
  }

  async update(id: number, updateMovieDto: UpdateMovieDto) {
    const { detail, directorId, genres, ...movieData } = updateMovieDto;

    /* 트랜잭션으로 처리하여 데이터 일관성 유지 */
    return await this.movieRepository.manager.transaction(async (manager) => {
      /* 영화 존재 확인 */
      const movie = await this.findMovieById(id);

      /* 기본 영화 데이터 업데이트 */
      if (Object.keys(movieData).length > 0) {
        await manager.update(Movie, id, movieData);
      }

      /* 상세 정보 업데이트 */
      if (detail) {
        await this.updateMovieDetail(manager, movie, detail);
      }

      /* 감독 업데이트 */
      if (directorId) {
        const director = await this.findDirectorById(directorId);
        await manager.update(Movie, id, { director });
      }

      /* 장르 업데이트 */
      if (genres && genres.length > 0) {
        const updatedGenres = await this.findOrCreateGenres(genres);
        const movieToUpdate = await manager.findOne(Movie, {
          where: { id },
          relations: ['genres'],
        });
        movieToUpdate.genres = updatedGenres;
        await manager.save(movieToUpdate);
      }

      /* 업데이트된 영화 반환 */
      const updatedMovie = await manager.findOne(Movie, {
        where: { id },
        relations: ['movieDetail', 'director', 'genres'],
      });

      return MovieResponse.fromMovie(updatedMovie);
    });
  }

  async remove(id: number) {
    await this.findMovieById(id); // 영화가 존재하는지 확인
    await this.movieRepository.delete(id);
    return { success: true, message: `Movie with id ${id} has been deleted` };
  }

  /* 유틸리티 메서드 */
  private async findMovieById(
    id: number,
    relations: string[] = ['movieDetail', 'director'],
  ) {
    const movie = await this.movieRepository.findOne({
      where: { id },
      relations,
    });

    if (!movie) {
      throw new NotFoundException(`Movie with id ${id} not found`);
    }

    return movie;
  }

  private async findDirectorById(directorId: number) {
    const director = await this.directorRepository.findOne({
      where: { id: directorId },
    });

    if (!director) {
      throw new NotFoundException(`Director with id ${directorId} not found`);
    }

    return director;
  }

  private async findOrCreateGenres(names: string[]) {
    if (!names || names.length === 0) return [];

    const existingGenres = await this.genreRepository.find({
      where: { name: In(names) },
    });

    const existingGenreNames = existingGenres.map((genre) => genre.name);
    const newGenreNames = names.filter(
      (name) => !existingGenreNames.includes(name),
    );

    if (newGenreNames.length === 0) {
      return existingGenres;
    }

    const newGenres = newGenreNames.map((name) =>
      this.genreRepository.create({ name }),
    );
    const savedNewGenres = await this.genreRepository.save(newGenres);

    return [...existingGenres, ...savedNewGenres];
  }

  private async findOrCreateMovieDetail(detail?: string) {
    if (!detail) return null;

    const existingDetail = await this.movieDetailRepository.findOneBy({
      detail,
    });
    if (existingDetail) return existingDetail;

    return await this.movieDetailRepository.save({ detail });
  }

  private async updateMovieDetail(
    manager: EntityManager,
    movie: Movie,
    detail: string,
  ) {
    if (movie.movieDetail) {
      /* 기존 상세 정보 업데이트 */
      await manager.update(
        MovieDetail,
        { id: movie.movieDetail.id },
        { detail },
      );
    } else {
      /* 새 상세 정보 생성 */
      const newMovieDetail = manager.create(MovieDetail, { detail });
      const savedDetail = await manager.save(newMovieDetail);
      await manager.update(
        Movie,
        { id: movie.id },
        { movieDetail: savedDetail },
      );
    }
  }
}
