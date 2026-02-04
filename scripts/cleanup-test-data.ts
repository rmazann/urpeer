#!/usr/bin/env tsx

/**
 * Cleanup Test Data Script
 *
 * Removes test users and workspaces from the test database
 * Run this periodically to keep test database clean
 *
 * Usage: npm run test:cleanup
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'
import { existsSync } from 'fs'

async function cleanup() {
  // Load test environment
  const envPath = resolve(process.cwd(), '.env.test')

  if (!existsSync(envPath)) {
    console.error('❌ Error: .env.test file not found!')
    console.error('This script requires test database credentials.')
    console.error('See: e2e/TEST_DATABASE_SETUP.md')
    process.exit(1)
  }

  config({ path: envPath })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing required environment variables:')
    console.error('  - NEXT_PUBLIC_SUPABASE_URL')
    console.error('  - SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  console.log('🧹 Cleaning up test data...')
  console.log('Database:', supabaseUrl)
  console.log('')

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  try {
    // Find test users (email pattern: test-*@example.com or stress-test-*@example.com)
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email')
      .or('email.like.test-%@example.com,email.like.stress-test-%@example.com')

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError.message)
      process.exit(1)
    }

    if (profiles && profiles.length > 0) {
      console.log(`Found ${profiles.length} test users to delete`)

      let deleted = 0
      let failed = 0

      for (const profile of profiles) {
        try {
          // Delete user from auth (this cascades to profile via foreign key)
          const { error } = await supabase.auth.admin.deleteUser(profile.id)

          if (error) {
            console.error(`❌ Failed to delete user ${profile.email}:`, error.message)
            failed++
          } else {
            console.log(`✅ Deleted user: ${profile.email}`)
            deleted++
          }
        } catch (err) {
          console.error(`❌ Error deleting user ${profile.email}:`, err)
          failed++
        }
      }

      console.log('')
      console.log(`✅ Deleted ${deleted} users`)
      if (failed > 0) {
        console.log(`❌ Failed to delete ${failed} users`)
      }
    } else {
      console.log('No test users found to delete')
    }

    console.log('')

    // Find test workspaces (slug pattern: test-* or stress-test-*)
    const { data: workspaces, error: workspacesError } = await supabase
      .from('workspaces')
      .select('id, slug, name')
      .or('slug.like.test-%,slug.like.stress-test-%')

    if (workspacesError) {
      console.error('❌ Error fetching workspaces:', workspacesError.message)
      process.exit(1)
    }

    if (workspaces && workspaces.length > 0) {
      console.log(`Found ${workspaces.length} test workspaces to delete`)

      const ids = workspaces.map(w => w.id)
      const { error: deleteError } = await supabase
        .from('workspaces')
        .delete()
        .in('id', ids)

      if (deleteError) {
        console.error('❌ Error deleting workspaces:', deleteError.message)
      } else {
        workspaces.forEach(w => {
          console.log(`✅ Deleted workspace: ${w.slug} (${w.name})`)
        })
        console.log('')
        console.log(`✅ Deleted ${workspaces.length} workspaces`)
      }
    } else {
      console.log('No test workspaces found to delete')
    }

    console.log('')
    console.log('✅ Cleanup complete!')
  } catch (error) {
    console.error('❌ Cleanup failed:', error)
    process.exit(1)
  }
}

// Run cleanup
cleanup().catch(error => {
  console.error('❌ Unexpected error:', error)
  process.exit(1)
})
