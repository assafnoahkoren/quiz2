import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import { ClickToComponent } from "click-to-react-component";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// Import styles in the correct order
import '@mantine/core/styles.css';
import 'mantine-datatable/styles.layer.css';

import 'uno.css';
import { MantineProvider, DirectionProvider } from '@mantine/core';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <DirectionProvider initialDirection="rtl" detectDirection>
    <MantineProvider>
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          <App />
          <ClickToComponent editor="cursor"/>
          {/* <ReactQueryDevtools initialIsOpen={false} /> */}
        </QueryClientProvider>
      </React.StrictMode>
    </MantineProvider>
  </DirectionProvider>,
); 