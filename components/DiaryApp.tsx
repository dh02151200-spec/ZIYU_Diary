"use client";

import { useEffect, useMemo, useState } from "react";
import type { PublicLetter } from "@/lib/types";
import { chunkArray, formatKoreanDate } from "@/lib/utils";

const PAGE_SIZE = 3;
const MAX_CONTENT_LENGTH = 500;

const COPY = {
  eyebrow: "Sky Blue Scrap Diary",
  title: "ZIYU LETTER DIARY",
  intro:
    "작성된 편지는 승인 후 공개되고, 승인 전에는 닉네임만 먼저 보여요.",
  guideTitle: "Guide",
  formTitle: "Write a Letter",
  lettersTitle: "Letters",
  nextLabel: "Next",
  prevLabel: "Prev",
};

export default function DiaryApp() {
  const [letters, setLetters] = useState<PublicLetter[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [turnDirection, setTurnDirection] = useState<"next" | "prev" | null>(null);
  const [isTurning, setIsTurning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [nickname, setNickname] = useState("");
  const [content, setContent] = useState("");
  const [openLetter, setOpenLetter] = useState<PublicLetter | null>(null);
  const [mobilePage, setMobilePage] = useState<"left" | "right">("left");

  useEffect(() => {
    function setDiaryScale() {
      const root = document.documentElement;
      const isNarrow = window.innerWidth <= 900;
      const baseWidth = isNarrow ? 800 : 1600;
      const baseHeight = 1200;
      const safeWidth = window.innerWidth - (isNarrow ? 20 : 48);
      const safeHeight = window.innerHeight - (isNarrow ? 24 : 48);
      const scale = Math.min(safeWidth / baseWidth, safeHeight / baseHeight, 1);
      root.style.setProperty("--stage-scale", String(scale));
    }

    setDiaryScale();
    window.addEventListener("resize", setDiaryScale);
    return () => window.removeEventListener("resize", setDiaryScale);
  }, []);

  const pages = useMemo(() => {
    const chunks = chunkArray(letters, PAGE_SIZE);
    return chunks.length > 0 ? chunks : [[]];
  }, [letters]);

  const currentLetters = pages[pageIndex] ?? [];
  const totalPages = pages.length;

  async function loadLetters() {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/letters", { cache: "no-store" });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "편지를 불러오지 못했습니다.");
      }

      const nextLetters = Array.isArray(result.letters) ? result.letters : [];
      setLetters(nextLetters);
      setPageIndex((prev) => {
        const max = Math.max(0, Math.ceil(nextLetters.length / PAGE_SIZE) - 1);
        return Math.min(prev, max);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "편지를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLetters();
  }, []);

  function turnPage(direction: "next" | "prev") {
    if (isTurning) return;

    if (direction === "next" && pageIndex >= totalPages - 1) return;
    if (direction === "prev" && pageIndex <= 0) return;

    setIsTurning(true);
    setTurnDirection(direction);

    window.setTimeout(() => {
      setPageIndex((prev) => (direction === "next" ? prev + 1 : prev - 1));
    }, 260);

    window.setTimeout(() => {
      setIsTurning(false);
      setTurnDirection(null);
    }, 760);
  }

  function showMobileRightPage() {
    if (isTurning) return;
    setMobilePage("right");
  }

  function handleMobilePrev() {
    if (isTurning) return;

    if (pageIndex > 0) {
      setPageIndex((prev) => Math.max(0, prev - 1));
      return;
    }

    setMobilePage("left");
  }

  function handleMobileNext() {
    if (isTurning) return;

    if (pageIndex < totalPages - 1) {
      setPageIndex((prev) => Math.min(totalPages - 1, prev + 1));
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitMessage("");
    setSubmitError("");

    if (!nickname.trim()) {
      setSubmitError("닉네임을 입력해주세요.");
      return;
    }

    if (!content.trim()) {
      setSubmitError("편지 내용을 입력해주세요.");
      return;
    }

    if (content.length > MAX_CONTENT_LENGTH) {
      setSubmitError(`편지는 최대 ${MAX_CONTENT_LENGTH}자까지 작성할 수 있습니다.`);
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch("/api/letters/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nickname, content }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "편지 제출에 실패했습니다.");
      }

      setSubmitMessage(result.message || "편지가 저장되었습니다.");
      setNickname("");
      setContent("");
      await loadLetters();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "편지 제출에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className={`site-shell mobile-${mobilePage}-page`}>
      <div className="photo-background" />

      <div className="desk-decor" aria-hidden="true">
        <img src="/images/decor/pung_rabbit.png" className="decor decor-rabbit" alt="" />
        <img src="/images/decor/pung_chichi.png" className="decor decor-chichi" alt="" />
        <img src="/images/decor/pung_puppy.png" className="decor decor-puppy" alt="" />
         <img src="/images/decor/pung_cat.png" className="decor decor-cat" alt="" /> 
       
      </div>

      <div className="hub-shell">
        <div className="hub-container">
          <section className="diary-stage">
            <div className="diary-book-shadow" />
            <div className={`diary-book mobile-one-page-book ${isTurning ? "book-is-turning" : ""}`}>
              <div className="binding-spine" aria-hidden="true" />

              <div className="diary-page diary-page-left">
                <div className="page-paper-grain" />

                <img src="/images/stickers/tape-blue.svg" className="page-sticker tape tape-title" alt="" />
                <img src="/images/stickers/draw_fish.png" className="page-sticker sticker-draw_fish" alt="" />
          
                  <img src="/images/stickers/ziyu_fish.gif" className="page-sticker sticker-ziyu_bar" alt="" />

                <img src="/images/stickers/tape-dot.svg" className="page-sticker tape tape-guide" alt="" />

                <div className="left-page-header">
                  <p className="eyebrow">{COPY.eyebrow}</p>
                  <h1>{COPY.title}</h1>
                  <p className="left-page-copy">{COPY.intro}</p>
                </div>

                <div className="scrap-card date-card">
                  <span className="mini-label">Today</span>
                  <strong>
                    {new Intl.DateTimeFormat("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }).format(new Date())}
                  </strong>
                </div>

                <div className="scrap-card guide-card">
                  <span className="mini-label">{COPY.guideTitle}</span>
                  <ul>
                    <li>닉네임은 필수입니다.</li>
                    <li>편지는 최대 500자까지 작성 가능해요.</li>
                    <li>승인 전에는 내용이 블러처리되어 등록됩니다.</li>
                    <li>오른쪽 아래 페이지 끝을 눌러 다음 장으로 넘겨주세요.</li>
                  </ul>
                </div>

                <form className="letter-form" onSubmit={handleSubmit}>
                  <div className="form-header-row">
                    <span className="mini-label">{COPY.formTitle}</span>
                    <span className="count-chip">{content.length}/{MAX_CONTENT_LENGTH}</span>
                  </div>

                  <label className="field-label">
                    <span>Nickname</span>
                    <input
                      value={nickname}
                      onChange={(event) => setNickname(event.target.value)}
                      placeholder="닉네임을 입력해주세요"
                      maxLength={30}
                    />
                  </label>

                  <label className="field-label">
                    <span>Letter</span>
                    <textarea
                      value={content}
                      onChange={(event) => setContent(event.target.value)}
                      placeholder="편지를 작성해주세요..."
                      maxLength={MAX_CONTENT_LENGTH}
                    />
                  </label>

                  {submitMessage ? <p className="form-message success">{submitMessage}</p> : null}
                  {submitError ? <p className="form-message error">{submitError}</p> : null}

                  <button type="submit" className="submit-button" disabled={submitting}>
                    {submitting ? "저장중..." : "편지 남기기"}
                  </button>
                </form>

                <button
                  type="button"
                  className="page-turn-trigger next mobile-left-next"
                  onClick={showMobileRightPage}
                  aria-label="편지 리스트 페이지"
                >
                  <span>{COPY.nextLabel}</span>
                </button>
              </div>

              <div
                className={[
                  "diary-page",
                  "diary-page-right",
                  isTurning ? "is-turning" : "",
                  turnDirection === "next" ? "turn-next" : "",
                  turnDirection === "prev" ? "turn-prev" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <div className="page-paper-grain" />
               
                <img src="/images/stickers/ziyufamily.png" className="page-sticker sticker-ziyufamily" alt="" />
                <div className="right-page-header">
                  <div>
                    <p className="eyebrow">{COPY.lettersTitle}</p>
                    <h2>Diary Page {String(pageIndex + 1).padStart(2, "0")}</h2>
                  </div>
                  <span className="page-counter">{pageIndex + 1} / {totalPages}</span>
                </div>

                {loading ? <p className="state-text">편지를 불러오는 중...</p> : null}
                {error ? <p className="state-text error-text">{error}</p> : null}

                {!loading && !error ? (
                  <div className="letter-slots">
                    {[0, 1, 2].map((slotIndex) => {
                      const letter = currentLetters[slotIndex];

                      if (!letter) {
                        return (
                          <article key={slotIndex} className="letter-entry empty">
                            <span className="slot-label">Entry {slotIndex + 1}</span>
                            <div className="empty-note">아직 이 칸에 공개된 편지가 없어요.</div>
                          </article>
                        );
                      }

                      const isPending = letter.status === "pending";
                      const contentText = letter.content || "";
                      const previewText = contentText.length > 58 ? `${contentText.slice(0, 58)}...` : contentText;

                      return (
                        <article key={letter.id} className={`letter-entry ${isPending ? "pending" : "approved"}`}>
                          <div className="entry-top-row">
                            <span className="slot-label">Entry {slotIndex + 1}</span>
                            {isPending ? (
                              <span className="status-badge pending">대기중</span>
                            ) : (
                              <button type="button" className="open-letter-button" onClick={() => setOpenLetter(letter)}>
                                open
                              </button>
                            )}
                          </div>
                          <h3>Dear. {letter.nickname}</h3>
                          <p className={isPending ? "entry-content is-blurred" : "entry-content"}>
                            {isPending ? letter.public_preview || "승인 대기중인 편지입니다." : previewText}
                          </p>
                          <div className="entry-meta">{formatKoreanDate(letter.created_at)}</div>
                        </article>
                      );
                    })}
                  </div>
                ) : null}

                <button
                  type="button"
                  className="page-turn-trigger prev"
                  onClick={() => (mobilePage === "right" ? handleMobilePrev() : turnPage("prev"))}
                  aria-label="이전 페이지"
                  disabled={mobilePage === "right" ? isTurning : pageIndex === 0 || isTurning}
                >
                  <span>{COPY.prevLabel}</span>
                </button>

                <button
                  type="button"
                  className="page-turn-trigger next"
                  onClick={() => (mobilePage === "right" ? handleMobileNext() : turnPage("next"))}
                  aria-label="다음 페이지"
                  disabled={pageIndex >= totalPages - 1 || isTurning}
                >
                  <span>{COPY.nextLabel}</span>
                </button>
              </div>

              {isTurning ? (
                <div
                  className={[
                    "page-flip-sheet",
                    turnDirection === "next" ? "flip-next" : "",
                    turnDirection === "prev" ? "flip-prev" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-hidden="true"
                >
                  <div className="page-flip-front" />
                  <div className="page-flip-back" />
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </div>

      {openLetter ? (
        <div className="letter-modal-backdrop" role="dialog" aria-modal="true">
          <article className="letter-modal-card">
            <button type="button" className="letter-modal-close" onClick={() => setOpenLetter(null)} aria-label="닫기">
              ×
            </button>
            <p className="eyebrow">Open Letter</p>
            <h2>Dear. {openLetter.nickname}</h2>
            <p className="letter-modal-content">{openLetter.content}</p>
            <div className="entry-meta">{formatKoreanDate(openLetter.created_at)}</div>
          </article>
        </div>
      ) : null}
    </main>
  );
}
