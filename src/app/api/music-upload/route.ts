"use server";

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    const { title, file_path, created_by } = body;
    
    // Validate required fields
    if (!title || !file_path) {
      return NextResponse.json(
        { error: "Title and file_path are required" }, 
        { status: 400 }
      );
    }
    
    // Create a server-side Supabase client with admin privileges
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    
    // Insert the music metadata into the database
    const metaData: any = { 
      title, 
      file_path 
    };
    
    // Add created_by if provided
    if (created_by) {
      metaData.created_by = created_by;
    }
    
    const { data, error } = await supabase
      .from("music_meta")
      .insert([metaData])
      .select();
      
    if (error) {
      console.error("API: Error inserting music metadata:", error);
      return NextResponse.json(
        { error: `Failed to insert music metadata: ${error.message}` }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { success: true, data }, 
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error("API: Exception in music upload handler:", error);
    return NextResponse.json(
      { error: `Server error: ${error.message}` }, 
      { status: 500 }
    );
  }
}
