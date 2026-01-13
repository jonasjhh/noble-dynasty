#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables');
  console.error('Please create a .env file with these variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigrations() {
  console.log('🚀 Starting database migrations...\n');

  const migrationsDir = join(__dirname, '..', 'supabase', 'migrations');

  try {
    const files = readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    if (files.length === 0) {
      console.log('⚠️  No migration files found.');
      return;
    }

    console.log(`Found ${files.length} migration file(s):\n`);

    for (const file of files) {
      console.log(`📄 Running migration: ${file}`);
      const migrationPath = join(migrationsDir, file);
      const sql = readFileSync(migrationPath, 'utf8');

      // Execute the SQL
      const { error } = await supabase.rpc('exec_sql', { sql_string: sql }).catch(() => {
        // If exec_sql function doesn't exist, we need to run it directly
        // This is a workaround since Supabase client doesn't expose raw SQL execution
        return { error: new Error('Cannot execute SQL directly via client. Please run migrations via Supabase Dashboard or CLI.') };
      });

      if (error) {
        console.error(`❌ Error running ${file}:`, error.message);
        console.error('\n⚠️  Note: For full migration support, please use one of these methods:');
        console.error('   1. Run migrations via Supabase Dashboard (SQL Editor)');
        console.error('   2. Install Supabase CLI: npm install -g supabase');
        console.error('   3. Use Supabase CLI: supabase db push\n');
        console.error('📋 Migration SQL is available in: supabase/migrations/\n');
        process.exit(1);
      }

      console.log(`✅ Successfully ran ${file}\n`);
    }

    console.log('🎉 All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigrations();
