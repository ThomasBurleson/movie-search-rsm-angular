import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { APP_BASE_HREF } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';

import { AppComponent, PaginationBar, MovieCard, HeaderBar, FilterInput, CheckGroup } from './components';

import { MovieStore, MoviesFacade, MoviesDataService } from './data-access';

@NgModule({
  imports: [BrowserModule, BrowserAnimationsModule, ReactiveFormsModule, HttpClientModule, RouterModule.forRoot([])],
  declarations: [AppComponent, MovieCard, HeaderBar, FilterInput, PaginationBar, CheckGroup],
  providers: [{ provide: APP_BASE_HREF, useValue: '/' }, MoviesDataService, MovieStore, MoviesFacade],
  bootstrap: [AppComponent],
})
export class AppModule {}
