import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { TooltipProvider } from '@/shared/components/ui/tooltip'
import { AuthProvider } from '@/features/auth/AuthContext'
import UpdateAvailableModal from '@/shared/components/UpdateAvailableModal'
import { queryClient } from './queryClient'
import { router } from './router'

export default function Providers() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <RouterProvider router={router} />
          <UpdateAvailableModal />
        </TooltipProvider>
      </AuthProvider>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
