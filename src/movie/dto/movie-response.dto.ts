import { Movie } from '../entities/movie.entity';
import { dateFormatter } from '../../common/utils/date-formatter';

export class MovieResponse {
  name: string;
  genre: string;
  character: string[];
  detail: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;

  private constructor(movie: Movie) {
    this.name = movie.name;
    this.genre = movie.genre;
    this.character = movie.character;
    this.detail = movie.movieDetail?.detail ?? null;
    this.createdAt = dateFormatter(movie.createdAt.toISOString());
    this.updatedAt = dateFormatter(movie.updatedAt.toISOString());
    this.version = movie.version;
  }

  static fromMovie(movie: Movie) {
    console.log(movie);
    return new MovieResponse(movie);
  }
}
