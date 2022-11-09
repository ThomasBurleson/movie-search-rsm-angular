import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent, MovieCard, HeaderBar } from './components';
import { HttpClientModule } from '@angular/common/http';

import { MoviesDataService, MoviesStore } from './data-access';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  providers: [MoviesStore, MoviesDataService],
  declarations: [AppComponent, MovieCard, HeaderBar],
  bootstrap: [AppComponent],
})
export class AppModule {}
