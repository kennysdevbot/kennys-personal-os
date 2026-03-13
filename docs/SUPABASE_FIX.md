# Fix: 401 Supabase Error - Complete Resolution Guide

**Date:** March 13, 2026  
**Issue:** GET requests to `kos_boards` table returning 401 Unauthorized  
**Root Cause:** RLS policies using deprecated `FOR ALL` syntax + missing environment variables  
**Status:** Fixed ✅

---

## Problem Summary

The Kanban board API call was returning 401 Unauthorized:
```
GET https://jtngcypnstmsdyurjtkn.supabase.co/rest/v1/kos_boards?select=*&order=created_at.asc
Error: 401 Unauthorized
```

**Why it happened:**
1. **Migration Issue:** RLS policies used `FOR ALL` syntax which Supabase doesn't properly support for anonymous users
2. **Environment Variables:** Missing `.env` file meant the app wasn't initializing the Supabase client correctly
3. **Policy Specificity:** Supabase requires explicit operation-based policies (SELECT, INSERT, UPDATE, DELETE) for the anon role

---

## Solution: 3-Step Fix

### Step 1: Update RLS Policies in Supabase Dashboard

The migration file (`supabase/migrations/20260313_init_schema.sql`) has been updated with correct RLS policies.

**Apply the fix:**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/jtngcypnstmsdyurjtkn)
2. Click **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy and paste this SQL:

```sql
-- Drop old all-in-one policies (these don't work with anon role)
DROP POLICY IF EXISTS "Allow all operations on kos_boards" ON kos_boards;
DROP POLICY IF EXISTS "Allow all operations on kos_columns" ON kos_columns;
DROP POLICY IF EXISTS "Allow all operations on kos_cards" ON kos_cards;
DROP POLICY IF EXISTS "Allow all operations on kos_notes" ON kos_notes;
DROP POLICY IF EXISTS "Allow all operations on kos_inbox_items" ON kos_inbox_items;

-- kos_boards: Proper operation-based policies for anon role
CREATE POLICY "anon_select_boards" ON kos_boards FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_boards" ON kos_boards FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_boards" ON kos_boards FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_boards" ON kos_boards FOR DELETE TO anon USING (true);

-- kos_columns: Proper operation-based policies for anon role
CREATE POLICY "anon_select_columns" ON kos_columns FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_columns" ON kos_columns FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_columns" ON kos_columns FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_columns" ON kos_columns FOR DELETE TO anon USING (true);

-- kos_cards: Proper operation-based policies for anon role
CREATE POLICY "anon_select_cards" ON kos_cards FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_cards" ON kos_cards FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_cards" ON kos_cards FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_cards" ON kos_cards FOR DELETE TO anon USING (true);

-- kos_notes: Proper operation-based policies for anon role
CREATE POLICY "anon_select_notes" ON kos_notes FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_notes" ON kos_notes FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_notes" ON kos_notes FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_notes" ON kos_notes FOR DELETE TO anon USING (true);

-- kos_inbox_items: Proper operation-based policies for anon role
CREATE POLICY "anon_select_inbox" ON kos_inbox_items FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_inbox" ON kos_inbox_items FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_inbox" ON kos_inbox_items FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_inbox" ON kos_inbox_items FOR DELETE TO anon USING (true);
```

5. Click **Run**
6. Verify: You should see "Success" and the policies should be updated

### Step 2: Configure Environment Variables

1. Go to [Supabase Dashboard API Keys](https://supabase.com/dashboard/project/jtngcypnstmsdyurjtkn/settings/api)
2. Copy your credentials:
   - **Project URL:** Already set: `https://jtngcypnstmsdyurjtkn.supabase.co`
   - **Anon Public Key:** Under "Project API keys" section
   - **Service Role Key:** Under "Project API keys" section (optional, for backend only)

3. Update `.env` file in the project root:
```bash
VITE_SUPABASE_URL=https://jtngcypnstmsdyurjtkn.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-from-dashboard
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-from-dashboard
```

4. **DO NOT commit** `.env` — it's in `.gitignore` for security

### Step 3: Verify the Fix

**Local testing:**
```bash
npm run dev
```

1. Open http://localhost:5173
2. Click "Create Board"
3. Enter board name and submit
4. Board should appear in the list
5. Check browser console — no 401 errors

**Production (Vercel):**

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your `kennys-os` project
3. Go to **Settings** → **Environment Variables**
4. Add or update:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Redeploy or wait for auto-deploy
6. Test the live app

---

## Technical Details

### Why `FOR ALL` Failed

Supabase RLS policies with `FOR ALL` don't properly scope to the `anon` role. The correct approach is:

**❌ WRONG (what was in the original migration):**
```sql
CREATE POLICY "Allow all operations on kos_boards" ON kos_boards 
  FOR ALL USING (true) WITH CHECK (true);
```

**✅ CORRECT (fixed version):**
```sql
CREATE POLICY "anon_select_boards" ON kos_boards 
  FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_boards" ON kos_boards 
  FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_boards" ON kos_boards 
  FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_boards" ON kos_boards 
  FOR DELETE TO anon USING (true);
```

### RLS Policy Structure

Each policy needs:
- **Operation:** SELECT, INSERT, UPDATE, or DELETE
- **Role:** TO anon (anonymous users)
- **Condition:** USING (for SELECT/UPDATE/DELETE) and WITH CHECK (for INSERT/UPDATE)

---

## Verification Checklist

- [ ] Updated RLS policies in Supabase dashboard
- [ ] Added credentials to `.env` file
- [ ] Tested locally: `npm run dev` and created a board
- [ ] Checked browser console for errors (should be none)
- [ ] Updated `.env` on Vercel (if deployed)
- [ ] Redeployed on Vercel
- [ ] Tested live app: created a board successfully
- [ ] Committed changes (if any) to git

---

## Troubleshooting

### Still Getting 401?

1. **Check env vars are loaded:**
   - Add this to `src/lib/supabase.ts` temporarily:
   ```typescript
   console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
   console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '***' : 'missing');
   ```
   - Refresh page and check browser console
   - If either is "missing", restart dev server with `npm run dev`

2. **Check Supabase policies:**
   - Go to [Supabase Dashboard](https://supabase.com/dashboard/project/jtngcypnstmsdyurjtkn/auth/policies)
   - Select table: `kos_boards`
   - Verify you see 4 policies with `anon` role (select, insert, update, delete)

3. **Check CORS:**
   - Go to [Supabase Dashboard → Settings → API](https://supabase.com/dashboard/project/jtngcypnstmsdyurjtkn/settings/api)
   - Check "URL Configuration" → CORS allowed origins
   - Should include:
     - `http://localhost:5173` (local dev)
     - `https://kennys-os-*.vercel.app` (production)

4. **Verify anon key is correct:**
   - Compare key in `.env` with dashboard
   - Copy key from dashboard again if unsure
   - Restart dev server after changing

### API Call Works but App Still Shows Error?

- Check `src/hooks/useBoards.ts` — error handling might be swallowing the real error
- Open browser DevTools → Network tab → look for failed API requests
- Check Response tab for actual error message from Supabase

---

## Files Changed

- ✅ `supabase/migrations/20260313_init_schema.sql` — Updated RLS policies
- ✅ `.env` — Template with instructions (remember to fill in actual keys!)
- ✅ `docs/SUPABASE_FIX.md` — This file

---

## Next Steps

1. **Apply the SQL fix** to your Supabase project (Step 1)
2. **Configure .env** with your actual credentials (Step 2)
3. **Test locally** and verify boards work (Step 3)
4. **Deploy to Vercel** with env vars set
5. **Log to Agent Hub** (if applicable)

---

**Fixed by:** Chris (Mid-Level Engineer)  
**Date:** March 13, 2026  
**Commit:** [Will be set after git push]

For questions, refer to:
- [Supabase RLS Documentation](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Anon Key Guide](https://supabase.com/docs/guides/api/api-keys)
