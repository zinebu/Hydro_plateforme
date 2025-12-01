import { TestBed } from '@angular/core/testing';

import { SidebarComponent } from './sidebar';

describe('SidebarComponent', () => {
  let service: SidebarComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SidebarComponent);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
