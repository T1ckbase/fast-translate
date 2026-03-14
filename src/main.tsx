import { QueryClient } from '@tanstack/query-core';
import { QueryClientProvider } from '@tanstack/preact-query';
import { render } from 'preact';
import App from './App';

const queryClient = new QueryClient();

render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>,
  document.body,
);
