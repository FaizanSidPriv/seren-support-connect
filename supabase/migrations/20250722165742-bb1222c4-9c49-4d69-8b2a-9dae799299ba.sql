-- Delete all existing user accounts and their associated data
-- This will cascade to profiles and other related tables due to foreign keys
DELETE FROM auth.users;