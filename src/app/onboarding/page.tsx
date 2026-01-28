'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, ArrowRight, HelpCircle, Link2, Check, Loader2 } from 'lucide-react'
import { createWorkspace, checkSlugAvailability } from '@/features/onboarding/actions/create-workspace'
import { toast } from 'sonner'

const TOTAL_STEPS = 4

const FeatureCards = () => (
  <div className="flex flex-col gap-4 items-center justify-center">
    <div className="bg-[#F07167] text-white font-bold text-3xl md:text-4xl px-8 py-6 rounded-2xl rotate-3 shadow-lg">
      Collect
    </div>
    <div className="bg-[#7C6AA5] text-white font-bold text-3xl md:text-4xl px-8 py-6 rounded-2xl -rotate-2 shadow-lg">
      Discuss
    </div>
    <div className="bg-[#2A9D8F] text-white font-bold text-3xl md:text-4xl px-8 py-6 rounded-2xl rotate-1 shadow-lg">
      Plan
    </div>
    <div className="bg-[#6B9BD2] text-white font-bold text-3xl md:text-4xl px-8 py-6 rounded-2xl -rotate-3 shadow-lg">
      Publish
    </div>
  </div>
)

const StepIndicator = ({ currentStep }: { currentStep: number }) => (
  <div className="flex gap-2">
    {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
      <div
        key={i}
        className={`h-1.5 rounded-full transition-all duration-300 ${
          i === currentStep - 1
            ? 'w-6 bg-foreground'
            : i < currentStep - 1
            ? 'w-2 bg-foreground/60'
            : 'w-2 bg-muted-foreground/30'
        }`}
      />
    ))}
  </div>
)

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingSlug, setIsCheckingSlug] = useState(false)
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)

  const [formData, setFormData] = useState({
    website: '',
    name: '',
    slug: '',
  })

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSkip = () => {
    if (step === 1) {
      setStep(2)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleNameChange = (value: string) => {
    setFormData({ ...formData, name: value })
    // Auto-generate slug from name
    const newSlug = generateSlug(value)
    setFormData(prev => ({ ...prev, name: value, slug: newSlug }))
    setSlugAvailable(null)
  }

  const handleSlugChange = async (value: string) => {
    const sanitizedSlug = generateSlug(value)
    setFormData({ ...formData, slug: sanitizedSlug })
    setSlugAvailable(null)

    if (sanitizedSlug.length >= 3) {
      setIsCheckingSlug(true)
      const result = await checkSlugAvailability(sanitizedSlug)
      setSlugAvailable(result.available)
      setIsCheckingSlug(false)
    }
  }

  const handleComplete = async () => {
    setIsLoading(true)

    try {
      const result = await createWorkspace({
        name: formData.name,
        slug: formData.slug,
        website: formData.website || undefined,
      })

      if (result.success) {
        toast.success('Workspace created successfully!')
        router.push('/feedback')
      } else {
        toast.error(result.error || 'Failed to create workspace')
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Onboarding error:', error)
      toast.error('An unexpected error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return true // Website is optional
      case 2:
        return formData.name.length >= 2
      case 3:
        return formData.slug.length >= 3 && slugAvailable === true
      default:
        return true
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="bg-background rounded-3xl shadow-2xl overflow-hidden max-w-4xl w-full grid md:grid-cols-2">
        {/* Left side - Form */}
        <div className="p-8 md:p-12 flex flex-col min-h-[500px]">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <StepIndicator currentStep={step} />
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <HelpCircle className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1">
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">First things first.</h1>
                  <p className="text-muted-foreground mt-2">
                    Which website do you want<br />to collect feedback for?
                  </p>
                </div>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="mywebsite.com"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="pr-10"
                  />
                  {formData.website && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="h-2 w-2 rounded-full bg-red-400" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">Pick a name.</h1>
                  <p className="text-muted-foreground mt-2">
                    What should we call this workspace?<br />Usually, this is your product name.
                  </p>
                </div>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="My Workspace"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="pr-10"
                  />
                  {formData.name && formData.name.length < 2 && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="h-2 w-2 rounded-full bg-red-400" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">Pick a subdomain.</h1>
                  <p className="text-muted-foreground mt-2">
                    Choose a unique address for<br />your workspace on Urpeer.
                  </p>
                </div>
                <div className="relative">
                  <div className="flex items-center border rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                    <span className="pl-3 text-muted-foreground">
                      <Link2 className="h-4 w-4" />
                    </span>
                    <Input
                      type="text"
                      placeholder="my-workspace"
                      value={formData.slug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    <span className="pr-3 text-muted-foreground text-sm">.urpeer.com</span>
                  </div>
                  <div className="absolute -right-8 top-1/2 -translate-y-1/2">
                    {isCheckingSlug && (
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    )}
                    {!isCheckingSlug && slugAvailable === true && (
                      <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                    {!isCheckingSlug && slugAvailable === false && (
                      <div className="h-2 w-2 rounded-full bg-red-400" />
                    )}
                  </div>
                </div>
                {slugAvailable === false && (
                  <p className="text-sm text-red-500">This subdomain is already taken</p>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">You&apos;re all set!</h1>
                  <p className="text-muted-foreground mt-2">
                    Let&apos;s get collecting feedback.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Navigation */}
          <div className="flex items-center gap-3 mt-8">
            {step > 1 && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleBack}
                disabled={isLoading}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}

            {step === 1 && (
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="text-muted-foreground"
              >
                Skip <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}

            {step > 1 && step < TOTAL_STEPS && (
              <Button
                onClick={handleNext}
                disabled={!canProceed() || isLoading}
                className={!canProceed() ? 'opacity-50' : ''}
              >
                Next <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}

            {step === TOTAL_STEPS && (
              <Button
                onClick={handleComplete}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Get Started <ArrowRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Right side - Feature Cards */}
        <div className="hidden md:flex bg-muted/50 p-12 items-center justify-center">
          <FeatureCards />
        </div>
      </div>
    </div>
  )
}
