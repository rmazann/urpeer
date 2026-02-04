# Auth & Profile Management

## Problem: Orphaned Auth Users

During signup, if profile creation fails, an auth user is created without a corresponding profile record. This creates an "orphaned" user who:
- Cannot interact with the platform (RLS policies require profiles)
- Cannot retry signup (email already exists)
- Requires manual cleanup

## Solution: Multi-Layer Defense

### 1. Application-Level Protection

#### During Signup (src/features/auth/actions/auth.ts)
- Attempts to create profile immediately after auth user creation
- Logs errors but doesn't block signup
- User proceeds to onboarding where profile creation is retried

#### During Onboarding (src/features/onboarding/actions/create-workspace.ts)
- **Primary defense layer**: Checks if profile exists before workspace creation
- Creates profile if missing (lines 34-57)
- Uses idempotent upsert as fallback (lines 109-121)
- Blocks workspace creation if profile cannot be created

#### Utility Function (src/lib/utils/ensure-profile.ts)
- Reusable function: `ensureProfileExists(userId, email?, fullName?)`
- Handles race conditions (duplicate key errors)
- Can be called at any critical point in the application

### 2. Database-Level Cleanup

#### Cleanup Functions (supabase/migrations/20260129000001_orphan_user_cleanup.sql)

Two PostgreSQL functions for managing orphaned users:

##### find_orphaned_auth_users()
Returns list of auth users without profiles (older than 1 hour):
```sql
SELECT * FROM find_orphaned_auth_users();
```

Output:
- `user_id`: UUID of orphaned user
- `email`: User's email
- `created_at`: When user was created
- `age_hours`: How old the orphaned user is

##### cleanup_orphaned_auth_users(min_age_hours)
Deletes orphaned users older than specified hours (default 24):
```sql
-- Check before deleting
SELECT * FROM find_orphaned_auth_users();

-- Delete orphans older than 24 hours (safe default)
SELECT * FROM cleanup_orphaned_auth_users(24);

-- More aggressive: delete orphans older than 1 hour
SELECT * FROM cleanup_orphaned_auth_users(1);
```

### 3. Monitoring & Maintenance

#### Manual Checks
Run periodically (weekly/monthly):
```sql
SELECT * FROM find_orphaned_auth_users();
```

#### Scheduled Cleanup (Optional)
You can schedule automatic cleanup using:
- **Supabase Edge Functions** + Cron trigger
- **pg_cron** extension (if enabled)
- **External cron job** calling a cleanup API endpoint

Example cron schedule (weekly cleanup):
```bash
0 0 * * 0  # Every Sunday at midnight
```

#### Monitoring Metrics
Track these metrics:
- Number of orphaned users found per check
- Profile creation failure rate during signup
- Time between user creation and profile creation

## Best Practices

1. **Never skip onboarding**: Onboarding is the critical checkpoint that ensures profile exists
2. **Log profile creation failures**: All failures are logged with full context for debugging
3. **Run cleanup regularly**: Check for orphans monthly, cleanup if needed
4. **Monitor trends**: Increasing orphan rate indicates a systemic issue

## Troubleshooting

### User reports "can't login" after signup
1. Check if user exists: `SELECT * FROM auth.users WHERE email = 'user@example.com'`
2. Check if profile exists: `SELECT * FROM profiles WHERE email = 'user@example.com'`
3. If user exists but no profile:
   - User is orphaned
   - Have them try logging in (will redirect to onboarding)
   - Onboarding will create missing profile

### Profile creation consistently fails
Check:
1. RLS policies on profiles table
2. Database constraints (foreign keys, unique constraints)
3. Supabase connection pool limits
4. Application logs for error patterns

### Cleanup function doesn't delete users
Ensure:
1. Function has SECURITY DEFINER attribute
2. service_role has EXECUTE permission
3. You're running as a role with auth.users access
4. min_age_hours is appropriate (users might be too young)

## Migration Deployment

To apply the cleanup functions to your production database:

```bash
# Link to your Supabase project
npx supabase link --project-ref <your-project-ref>

# Apply migrations
npx supabase db push

# Verify functions were created
npx supabase db functions list
```

Or via Supabase Dashboard:
1. Go to SQL Editor
2. Copy contents of `supabase/migrations/20260129000001_orphan_user_cleanup.sql`
3. Run the script
4. Verify functions in Database → Functions
