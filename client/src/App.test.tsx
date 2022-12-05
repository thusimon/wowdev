import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('renders wow token real time title', () => {
  const { getByText } = render(<App />);
  const h2Element = getByText(/World of Warcraft real-time token price/i);
  expect(h2Element).toBeInTheDocument();
});
