-- Seed data for development and testing
-- Note: This file should be run after at least one user has signed up
-- Replace the UUIDs below with actual user IDs from your auth.users table

-- Sample workspace (will be created by first admin user)
-- INSERT INTO workspaces (id, name, slug, description, owner_id)
-- VALUES (
--   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
--   'Urpeer Demo',
--   'urpeer-demo',
--   'Demo workspace for Urpeer feedback platform',
--   'YOUR_ADMIN_USER_ID'
-- );

-- Sample feedback items (uncomment and update after workspace is created)
-- INSERT INTO feedback (workspace_id, title, description, status, category, author_id, vote_count)
-- VALUES
--   ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Dark mode support', 'Please add dark mode to make the app easier on the eyes during night time usage.', 'open', 'feature', 'YOUR_USER_ID', 15),
--   ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Export feedback to CSV', 'Allow admins to export all feedback data to CSV format for reporting purposes.', 'planned', 'feature', 'YOUR_USER_ID', 8),
--   ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Fix Safari login issue', 'Login button is not working properly on Safari browser. Users report being stuck on loading.', 'in_progress', 'bug', 'YOUR_USER_ID', 23),
--   ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Mobile app version', 'Would love to have a native mobile app for iOS and Android.', 'open', 'feature', 'YOUR_USER_ID', 42),
--   ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Improve search functionality', 'Search should include fuzzy matching and filters by status/category.', 'under_review', 'improvement', 'YOUR_USER_ID', 11);

-- Sample roadmap items (uncomment after workspace is created)
-- INSERT INTO roadmap_items (workspace_id, title, description, status, display_order, eta)
-- VALUES
--   ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Dark Mode', 'Implement system-wide dark mode support', 'planned', 1, 'Q1 2026'),
--   ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Safari Bug Fix', 'Fix the login issue on Safari browsers', 'in_progress', 1, 'This week'),
--   ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Initial Release', 'Launch v1.0 of the feedback platform', 'completed', 1, NULL);

-- Sample changelog entries (uncomment after workspace is created)
-- INSERT INTO changelog_entries (workspace_id, title, content, category, published, published_at, author_id)
-- VALUES
--   ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Welcome to Urpeer!', '## Initial Release\n\nWe are excited to launch Urpeer, your centralized feedback platform!\n\n### Features\n- Submit and vote on feedback\n- Public roadmap\n- Changelog updates\n- Comment discussions', 'feature', true, NOW(), 'YOUR_ADMIN_USER_ID');
