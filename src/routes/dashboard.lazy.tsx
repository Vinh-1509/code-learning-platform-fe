import { createLazyFileRoute } from '@tanstack/react-router'
import { DashboardPage } from '../features/dashboard/dashboard_page'

export const Route = createLazyFileRoute('/dashboard')({
  component: DashboardPage,
})