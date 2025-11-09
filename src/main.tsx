import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'hono/jsx';
import { render } from 'hono/jsx/dom';
import { hydrateRoot } from 'hono/jsx/dom/client';
// import { hydrate, render } from 'preact/compat';
import { App } from './App';

// hydrateRoot(document.body, <App />);

const queryClient = new QueryClient();

render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
  document.body,
);

// render(<App />, document.body);
