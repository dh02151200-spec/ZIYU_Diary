"use client";

import { useEffect, useMemo, useState } from "react";
import type { Letter } from "@/lib/types";
import { formatKoreanDate } from "@/lib/utils";

export default function AdminPanel() {
  const [secret, setSecret] = useState("");
  const [letters, setLetters] = useState<Letter[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [workingId, setWorkingId] = useState("");

  const pendingCount = useMemo(() => letters.filter((item) => item.status === "pending").length, [letters]);

  async function loadLetters(adminSecret: string) {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/admin/letters", {
        headers: {
          "x-admin-secret": adminSecret,
        },
        cache: "no-store",
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "관리자 데이터를 불러오지 못했습니다.");
      }

      setLetters(result.letters ?? []);
      setAuthenticated(true);
    } catch (err) {
      setAuthenticated(false);
      setLetters([]);
      setError(err instanceof Error ? err.message : "관리자 데이터를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(letterId: string, status: "approved" | "pending" | "rejected") {
    try {
      setWorkingId(letterId);
      setError("");
      const response = await fetch("/api/admin/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": secret,
        },
        body: JSON.stringify({ letterId, status }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "상태를 변경하지 못했습니다.");
      }

      await loadLetters(secret);
    } catch (err) {
      setError(err instanceof Error ? err.message : "상태를 변경하지 못했습니다.");
    } finally {
      setWorkingId("");
    }
  }

  useEffect(() => {
    const saved = window.localStorage.getItem("ziyu_admin_secret") || "";
    if (saved) {
      setSecret(saved);
      loadLetters(saved);
    }
  }, []);

  return (
    <main className="admin-shell">
      <div className="admin-card">
        <div className="admin-top">
          <div>
            <p className="eyebrow">Admin</p>
            <h1>Letter Approval Panel</h1>
            <p className="admin-description">승인, 보류, 반려 상태를 여기서 관리할 수 있어요.</p>
          </div>
          <div className="admin-stat">대기중 {pendingCount}</div>
        </div>

        <div className="admin-login-row">
          <input
            type="password"
            placeholder="ADMIN_SECRET 입력"
            value={secret}
            onChange={(event) => setSecret(event.target.value)}
          />
          <button
            type="button"
            onClick={() => {
              window.localStorage.setItem("ziyu_admin_secret", secret);
              loadLetters(secret);
            }}
          >
            불러오기
          </button>
        </div>

        {error ? <p className="admin-error">{error}</p> : null}

        {!authenticated && !loading ? (
          <div className="admin-empty">관리자 비밀번호를 입력하면 편지 목록이 표시됩니다.</div>
        ) : null}

        {loading ? <div className="admin-empty">불러오는 중...</div> : null}

        {authenticated ? (
          <div className="admin-list">
            {letters.map((letter) => (
              <article key={letter.id} className="admin-item">
                <div className="admin-item-head">
                  <div>
                    <strong>{letter.nickname}</strong>
                    <span>{formatKoreanDate(letter.created_at)}</span>
                  </div>
                  <span className={`status-badge ${letter.status}`}>{letter.status}</span>
                </div>

                <p className="admin-content">{letter.content}</p>

                <div className="admin-actions">
                  <button disabled={workingId === letter.id} onClick={() => updateStatus(letter.id, "approved")}>승인</button>
                  <button disabled={workingId === letter.id} onClick={() => updateStatus(letter.id, "pending")}>보류</button>
                  <button disabled={workingId === letter.id} onClick={() => updateStatus(letter.id, "rejected")}>반려</button>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </main>
  );
}
