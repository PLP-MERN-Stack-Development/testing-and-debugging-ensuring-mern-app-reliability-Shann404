import React from 'react';
import { render, screen } from '@testing-library/react';

test('simple test to verify jest setup', () => {
  render(<div>Hello World</div>);
  expect(screen.getByText('Hello World')).toBeInTheDocument();
});