import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { MessageSquare, Map, FileText, ThumbsUp } from "lucide-react"

const features = [
  {
    icon: MessageSquare,
    title: "Share Feedback",
    description: "Submit ideas, report bugs, and suggest improvements to help shape the product.",
    href: "/feedback",
  },
  {
    icon: ThumbsUp,
    title: "Vote on Features",
    description: "Upvote the features you care about most to help prioritize development.",
    href: "/feedback",
  },
  {
    icon: Map,
    title: "Track Progress",
    description: "See what's planned, in progress, and completed on our public roadmap.",
    href: "/roadmap",
  },
  {
    icon: FileText,
    title: "Stay Updated",
    description: "Follow our changelog to stay informed about the latest product updates.",
    href: "/changelog",
  },
]

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="container mx-auto flex flex-col items-center justify-center px-4 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Your Voice Shapes
          <span className="text-primary block mt-2">Our Product</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          A centralized feedback platform where your ideas matter. Share feedback,
          vote on features, and track progress as we build together.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link href="/feedback">
            <Button size="lg" className="w-full sm:w-auto">
              <MessageSquare className="h-4 w-4 mr-2" />
              Submit Feedback
            </Button>
          </Link>
          <Link href="/roadmap">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <Map className="h-4 w-4 mr-2" />
              View Roadmap
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">How It Works</h2>
          <p className="text-muted-foreground mt-2">
            Get involved in shaping the future of our product
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Link key={feature.title} href={feature.href}>
              <Card className="h-full transition-shadow hover:shadow-md cursor-pointer">
                <CardHeader>
                  <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold">Ready to Get Started?</h2>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
            Join our community and help us build a better product. Your feedback
            is invaluable.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Create an Account
              </Button>
            </Link>
            <Link href="/changelog">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                View Recent Updates
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
