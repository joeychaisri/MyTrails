import type { Preview } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/contexts/AuthContext'
import { LanguageProvider } from '@/views/runner/i18n'
import '@/index.css'

// Global decorator — mirrors App.tsx providers so any story (runner or organizer)
// renders with the same context the real app gives it. Routing uses MemoryRouter
// so stories never touch the URL bar.
const queryClient = new QueryClient()

const preview: Preview = {
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <LanguageProvider>
              <MemoryRouter initialEntries={['/']}>
                <Story />
              </MemoryRouter>
            </LanguageProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    ),
  ],
  parameters: {
    options: {
      // Journey order — same sequence the Ladle config pinned
      storySort: {
        order: [
          'Runner',
          ['Browse & Discover', 'Event Page'],
          'Organizer',
          ['Login', 'Dashboard', 'Create & Edit Event', 'Manage Event', 'Account & Security'],
          'Admin',
          'Experiments (not for build)',
        ],
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },
}

export default preview
