"use server";

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Helper function to determine content type and set headers
function getAudioHeaders(filePath: string) {
  const fileExtension = filePath.split('.').pop()?.toLowerCase();
  let contentType = 'audio/mpeg'; // Default to MP3

  if (fileExtension === 'wav') {
    contentType = 'audio/wav';
  } else if (fileExtension === 'ogg') {
    contentType = 'audio/ogg';
  } else if (fileExtension === 'm4a') {
    contentType = 'audio/mp4';
  }

  // Create headers with CORS and other necessary attributes
  return {
    'Content-Type': contentType,
    'Cross-Origin-Resource-Policy': 'cross-origin',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
  };
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const filePath = searchParams.get('path');
    
    if (!filePath) {
      return NextResponse.json({ error: "File path is required" }, { status: 400 });
    }

    // Create a new Supabase client with server-side credentials
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Try to get a public URL first (more reliable and performant)
    const { data: publicUrlData } = await supabase.storage
      .from('songs')
      .getPublicUrl(filePath);
      
    if (publicUrlData && publicUrlData.publicUrl) {
      try {
        // Fetch the file using the public URL to proxy it through our server
        const response = await fetch(publicUrlData.publicUrl);
        if (!response.ok) throw new Error(`Failed to fetch file: ${response.status}`);
        
        const fileData = await response.arrayBuffer();
        const buffer = Buffer.from(fileData);
        
        return new NextResponse(buffer, { 
          status: 200, 
          headers: getAudioHeaders(filePath)
        });
      } catch (fetchError) {
        console.error("Error fetching via public URL:", fetchError);
        // Continue to fallback method
      }
    }

    // Fallback: Get file data from Supabase storage directly
    const { data, error } = await supabase.storage
      .from('songs')
      .download(filePath);

    if (error || !data) {
      console.error("API Error fetching audio file:", error);
      return NextResponse.json({ error: "Failed to fetch audio file" }, { status: 404 });
    }

    // Return the file with proper audio MIME type and CORS headers
    const headers = getAudioHeaders(filePath);

    return new NextResponse(data, { status: 200, headers });
  } catch (error) {
    console.error("API Exception:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
