import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';

import { of } from 'rxjs';
import { MoviesFacade } from '../../data-access';
import { AppComponent } from './app.component';

describe('test app', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [AppComponent],
      // provide the component-under-test and dependent service
      providers: [
        {
          provide: MoviesFacade,
          useFactory: () => ({
            vm$: of({}),
          }),
        },
      ],
    });
  });

  it(`can be instantiated'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });
});
