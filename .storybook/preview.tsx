import type { Preview } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/contexts/AuthContext'
import { EventsProvider } from '@/contexts/EventsContext'
import { LanguageProvider } from '@/views/runner/i18n'
import '@/index.css'

// Global decorator — mirrors App.tsx providers so any story (runner or organizer)
// renders with the same context the real app gives it. Routing uses MemoryRouter
// so stories never touch the URL bar.
const queryClient = new QueryClient()

// Workaround for a Storybook 10.5 core bug: storybook/test's userEvent
// instrumentation redefines HTMLElement.prototype.focus as an accessor whose
// getter dereferences this.ownerDocument. react-aria (inside addon-docs)
// reads `.focus` off the PROTOTYPE at module init, so the getter runs with
// this = HTMLElement.prototype → "TypeError: Illegal invocation" → every MDX
// docs page dies. Restoring the plain method after core's loaders have run
// (project loaders run last) keeps docs alive; we don't use play functions,
// so losing the instrumentation costs nothing. Drop this once fixed upstream
// (same family as storybookjs/storybook#31243).
const nativeFocus = HTMLElement.prototype.focus
const restoreNativeFocus = () => {
  const d = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'focus')
  if (d?.get) {
    Object.defineProperty(HTMLElement.prototype, 'focus', {
      value: nativeFocus,
      writable: true,
      configurable: true,
    })
  }
}

const preview: Preview = {
  loaders: [restoreNativeFocus],
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <EventsProvider>
              <LanguageProvider>
                <MemoryRouter initialEntries={['/']}>
                  <Story />
                </MemoryRouter>
              </LanguageProvider>
            </EventsProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    ),
  ],
  parameters: {
    options: {
      // The 12-journey hand-off map (journey 3 · Register & Pay is reserved —
      // no registration flow in the product yet). See the Journey Map docs page.
      storySort: {
        order: [
          'Journey Map',
          'Runner',
          ['1 · Discover Events', '2 · Explore an Event'],
          'Organizer',
          [
            '4 · Get Started',
            '5 · Create & Submit Event',
            '6 · Approval Outcomes',
            '7 · Run the Event',
            '8 · Get Paid',
          ],
          'Admin',
          ['9 · Moderate Events', '10 · Platform Finance', '11 · Platform Administration'],
          'Design System',
          ['Overview', 'Colors', 'Typography', 'Surfaces', 'Components'],
          'System',
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
