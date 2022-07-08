import { PaginationBar } from './components/pagination/pagination.component';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';

import { AppComponent, MovieCard, HeaderBar } from './components';
import { HttpClientModule } from '@angular/common/http';

import { MoviesFacade, MoviesDataService } from './data-access';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  providers: [MoviesFacade, MoviesDataService],
  declarations: [AppComponent, MovieCard, HeaderBar, PaginationBar],
  bootstrap: [AppComponent],
})
export class AppModule {}
