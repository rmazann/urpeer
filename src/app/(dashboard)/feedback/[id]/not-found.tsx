import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, MessageSquare } from 'lucide-react'

export default function FeedbackNotFound() {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <MessageSquare className="h-12 w-12 text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-semibold mt-4">Feedback Not Found</h2>
      <p className="text-muted-foreground mt-2 max-w-md">
        This feedback item doesn&apos;t exist or may have been deleted.
      </p>
      <div className="flex gap-4 mt-8">
        <Button asChild>
          <Link href="/feedback">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Feedback
          </Link>
        </Button>
      </div>
    </div>
  )
}
