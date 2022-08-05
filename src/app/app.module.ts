import { PaginationBar } from './components/pagination/pagination.component';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';

import { AppComponent, MovieCard, HeaderBar, FilterInput, CheckGroup } from './components';
import { HttpClientModule } from '@angular/common/http';

import { MovieStore, MoviesFacade, MoviesDataService } from './data-access';
import { RouterModule } from '@angular/router';
import { APP_BASE_HREF } from '@angular/common';

@NgModule({
  imports: [BrowserModule, BrowserAnimationsModule, ReactiveFormsModule, HttpClientModule, RouterModule.forRoot([])],
  declarations: [AppComponent, MovieCard, HeaderBar, FilterInput, PaginationBar, CheckGroup],
  providers: [MoviesFacade, MoviesDataService, MovieStore, { provide: APP_BASE_HREF, useValue: '/' }],
  bootstrap: [AppComponent],
})
export class AppModule {}
