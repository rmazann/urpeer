'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type ChangelogPaginationProps = {
  currentPage: number
  totalCount: number
  hasMore: boolean
  pageSize: number
}

export const ChangelogPagination = ({
  currentPage,
  totalCount,
  hasMore,
  pageSize,
}: ChangelogPaginationProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const totalPages = Math.ceil(totalCount / pageSize)

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (page === 1) {
      params.delete('page')
    } else {
      params.set('page', String(page))
    }
    router.push(`/changelog?${params.toString()}`)
  }

  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <Button
        variant="outline"
        size="sm"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Previous
      </Button>

      <span className="text-sm text-muted-foreground px-4">
        Page {currentPage} of {totalPages}
      </span>

      <Button
        variant="outline"
        size="sm"
        onClick={() => goToPage(currentPage + 1)}
        disabled={!hasMore}
      >
        Next
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  )
}
