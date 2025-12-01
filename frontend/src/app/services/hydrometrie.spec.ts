import { TestBed } from '@angular/core/testing';

import { Hydrometrie } from './hydrometrie';

describe('Hydrometrie', () => {
  let service: Hydrometrie;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Hydrometrie);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
