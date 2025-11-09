import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'hono/jsx';
import { render } from 'hono/jsx/dom';
import { App } from './App';

const queryClient = new QueryClient();

render(
  <StrictMode>
    {/* @ts-ignore */}
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
  document.body,
);
