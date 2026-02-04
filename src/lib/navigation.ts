import {
  MessageSquare,
  Map,
  FileText,
  User,
  LayoutDashboard,
  FolderKanban,
  type LucideIcon,
} from 'lucide-react'

export type NavItem = {
  title: string
  href: string
  icon: LucideIcon
  badge?: string
  requiredRole?: 'admin'
}

export type NavSection = {
  title?: string
  items: NavItem[]
}

export const navigationConfig: NavSection[] = [
  {
    items: [
      {
        title: 'Feedback',
        href: '/feedback',
        icon: MessageSquare,
      },
      {
        title: 'Roadmap',
        href: '/roadmap',
        icon: Map,
      },
      {
        title: 'Changelog',
        href: '/changelog',
        icon: FileText,
      },
      {
        title: 'Profile',
        href: '/profile',
        icon: User,
      },
    ],
  },
  {
    title: 'Admin',
    items: [
      {
        title: 'Dashboard',
        href: '/admin',
        icon: LayoutDashboard,
        requiredRole: 'admin',
      },
      {
        title: 'Feedback Management',
        href: '/admin/feedback',
        icon: FolderKanban,
        requiredRole: 'admin',
      },
      {
        title: 'Changelog Management',
        href: '/admin/changelog',
        icon: FileText,
        requiredRole: 'admin',
      },
    ],
  },
]

export const filterNavigationByRole = (
  role: string | undefined
): NavSection[] => {
  return navigationConfig
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (!item.requiredRole) return true
        return role === item.requiredRole
      }),
    }))
    .filter((section) => section.items.length > 0)
}
