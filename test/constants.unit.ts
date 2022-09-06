import { expect } from 'chai';

import { createMultiAdapter } from '@/.';

describe('bidirectional-adapter', () => {
  it('converts between two simple data types', () => {
    const stringNumberAdapter = createMultiAdapter<string, number>(
      (stringValue) => parseInt(stringValue, 10),
      (numericValue) => String(numericValue)
    );

    expect(stringNumberAdapter.fromDB('123')).to.eq(123);
    expect(stringNumberAdapter.toDB(123)).to.eq('123');
  });
});
