import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase";

function isAuthorized(request: NextRequest) {
  const secret = request.headers.get("x-admin-secret");
  return secret && secret === process.env.ADMIN_SECRET;
}

export async function GET(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: "관리자 인증에 실패했습니다." }, { status: 401 });
    }

    const supabase = getSupabaseServiceClient();
    const { data, error } = await supabase
      .from("letters")
      .select("id, nickname, content, status, public_preview, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ letters: data ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "관리자 편지 조회 중 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
