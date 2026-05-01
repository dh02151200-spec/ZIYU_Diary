import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase";

const MAX_CONTENT_LENGTH = 500;
const DEFAULT_PENDING_PREVIEW = "승인 대기중인 편지입니다.";

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const nickname = normalizeText(String(body.nickname || ""));
    const content = String(body.content || "").trim();

    if (!nickname) {
      return NextResponse.json({ error: "닉네임을 입력해주세요." }, { status: 400 });
    }

    if (!content) {
      return NextResponse.json({ error: "편지 내용을 입력해주세요." }, { status: 400 });
    }

    if (content.length > MAX_CONTENT_LENGTH) {
      return NextResponse.json({ error: `편지는 최대 ${MAX_CONTENT_LENGTH}자까지 작성할 수 있습니다.` }, { status: 400 });
    }

    const supabase = getSupabaseServiceClient();

    const { data: bannedWords, error: bannedError } = await supabase
      .from("banned_words")
      .select("word")
      .order("id", { ascending: true });

    if (bannedError) {
      return NextResponse.json({ error: "금칙어 목록을 불러오지 못했습니다." }, { status: 500 });
    }

    const foundWord = (bannedWords ?? []).find((item) => item.word && content.includes(item.word));
    if (foundWord?.word) {
      return NextResponse.json(
        { error: `사용할 수 없는 단어가 포함되어 있습니다: ${foundWord.word}` },
        { status: 400 }
      );
    }

    const { error: insertError } = await supabase.from("letters").insert({
      nickname,
      content,
      status: "pending",
      public_preview: DEFAULT_PENDING_PREVIEW,
    });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: "편지가 저장되었습니다. 승인 후 공개됩니다." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "편지 제출 중 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
