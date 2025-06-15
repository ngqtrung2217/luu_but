import { sendThankYouEmail } from "@/utils/mailer";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Validate required fields
    if (!data.email || !data.name) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Send thank you email
    const emailSent = await sendThankYouEmail(data.email, data.name);

    if (!emailSent) {
      return NextResponse.json(
        { success: false, error: "Failed to send thank you email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Thank you email sending error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send thank you email" },
      { status: 500 }
    );
  }
}
