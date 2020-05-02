import { TestBed } from '@angular/core/testing';

import { PalletService } from './pallet.service';

describe('PalletService', () => {
  let service: PalletService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PalletService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
