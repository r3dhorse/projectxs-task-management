// This script adds the followedIds field to the tasks collection
// Run with: npx tsx scripts/add-followed-ids-field.ts

import { Client, Databases } from 'node-appwrite';

async function addFollowedIdsField() {
  // Initialize client after environment variables are loaded
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
    .setKey(process.env.NEXT_APPWRITE_KEY!);

  const databases = new Databases(client);

  try {
    const attribute = await databases.createStringAttribute(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_TASKS_ID!,
      'followedIds',
      1000, // Max length for JSON string (should be enough for follower IDs)
      false, // required
      '[]', // default value - empty array
      false // array
    );
    
    console.log('✅ Successfully added followedIds field:', attribute);
  } catch (error) {
    console.error('❌ Error adding field:', error);
    
    // If the error is because the attribute already exists, that's fine
    if (error instanceof Error && error.message?.includes('Attribute already exists')) {
      console.log('ℹ️  Field already exists, skipping...');
    }
  }
}

// Load environment variables from .env.local
import { readFileSync } from 'fs';
import { resolve } from 'path';

try {
  const envPath = resolve(process.cwd(), '.env.local');
  const envFile = readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const equalIndex = line.indexOf('=');
      if (equalIndex > 0) {
        const key = line.substring(0, equalIndex).trim();
        const value = line.substring(equalIndex + 1).trim().replace(/^["']|["']$/g, '');
        process.env[key] = value;
      }
    }
  });
  
  // Debug loaded environment variables
  console.log('Environment variables loaded:');
  console.log('NEXT_PUBLIC_APPWRITE_ENDPOINT:', process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT);
  console.log('NEXT_PUBLIC_APPWRITE_PROJECT:', process.env.NEXT_PUBLIC_APPWRITE_PROJECT);
  console.log('NEXT_PUBLIC_APPWRITE_DATABASE_ID:', process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID);
  console.log('NEXT_PUBLIC_APPWRITE_TASKS_ID:', process.env.NEXT_PUBLIC_APPWRITE_TASKS_ID);
  console.log('NEXT_APPWRITE_KEY present:', !!process.env.NEXT_APPWRITE_KEY);
  
} catch (error) {
  console.error('Could not load .env.local file:', error);
}

// Run the script
addFollowedIdsField();