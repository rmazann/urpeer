import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const startTime = Date.now()

  try {
    // Check database connection
    const supabase = await createClient()
    const { error } = await supabase.from('workspaces').select('id').limit(1)

    if (error) {
      return Response.json(
        {
          status: 'unhealthy',
          database: 'error',
          error: error.message,
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      )
    }

    const responseTime = Date.now() - startTime

    return Response.json({
      status: 'healthy',
      database: 'connected',
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '0.1.0',
    })
  } catch (error) {
    return Response.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    )
  }
}
