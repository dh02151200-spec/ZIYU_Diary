import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase";

function isAuthorized(request: NextRequest) {
  const secret = request.headers.get("x-admin-secret");
  return secret && secret === process.env.ADMIN_SECRET;
}

export async function POST(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: "관리자 인증에 실패했습니다." }, { status: 401 });
    }

    const body = await request.json();
    const letterId = String(body.letterId || "");
    const status = String(body.status || "");

    if (!letterId) {
      return NextResponse.json({ error: "letterId가 필요합니다." }, { status: 400 });
    }

    if (!["approved", "pending", "rejected"].includes(status)) {
      return NextResponse.json({ error: "유효하지 않은 status입니다." }, { status: 400 });
    }

    const supabase = getSupabaseServiceClient();
    const { error } = await supabase
      .from("letters")
      .update({ status })
      .eq("id", letterId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "승인 상태 변경 중 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
