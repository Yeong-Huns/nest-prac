import { Movie } from '../entities/movie.entity';
import { dateFormatter } from '../../common/utils/date-formatter';
import { GenreResponse } from '../../genre/dto/genre-response.dto';

export class MovieResponse {
  name: string;
  genre: GenreResponse[];
  character: string[];
  detail: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
  director: string;

  private constructor(movie: Movie) {
    this.name = movie.name;
    this.genre = movie.genres.map((genre) => GenreResponse.fromGenre(genre));
    this.character = movie.character;
    this.detail = movie.movieDetail?.detail ?? null;
    this.createdAt = dateFormatter(movie.createdAt);
    this.updatedAt = dateFormatter(movie.updatedAt);
    this.version = movie.version;
    this.director = movie.director.name;
  }

  static fromMovie(movie: Movie) {
    return new MovieResponse(movie);
  }
}
