# ZIYU LETTER DIARY

실제 종이 다이어리 느낌의 편지 모으기 웹사이트입니다.

## 실행

```bash
npm install
npm run dev
```

## 환경변수

`.env.example`을 `.env.local`로 복사한 뒤 직접 입력하세요.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_SECRET=0706
SITE_TITLE=ZIYU LETTER DIARY
```

## 이미지 교체 위치

모든 이미지는 `public/images` 안에 있습니다. 파일명만 유지하고 이미지를 교체하면 코드 수정 없이 반영됩니다.

```txt
public/images/background/star-sky.png       # 전체 배경
public/images/paper/page-texture.png        # 실제 다이어리 종이 질감
public/images/paper/letter-paper.png        # 편지/입력 카드 종이 질감
public/images/decor/*                       # 다이어리 주변 장식
public/images/stickers/*                    # 다이어리 내부 스티커/테이프
```

## 폰트 변경 위치

`app/globals.css` 상단에서 수정하세요.

```css
--font-body: ...;
--font-title: ...;
--font-hand: ...;
```

## 이번 버전 반영 내용

- CSS 벡터 느낌을 줄이고 실제 종이 텍스처 이미지 기반으로 변경
- PC에서 다이어리 영역을 더 크게 보이도록 고정 캔버스 확대
- 모바일도 PC처럼 양쪽 페이지가 모두 보이는 펼친 다이어리 레이아웃 유지
- 화면 크기에 맞춰 다이어리 전체가 비율 유지 상태로 중앙 축소됨
- 페이지 넘김 효과를 오른쪽 페이지가 오른쪽에서 왼쪽으로 넘어가는 방향의 3D 플립 구조로 변경
- 기존 Supabase 제출/조회/금칙어/관리자 승인 구조 유지

## Supabase

기존 테이블을 그대로 사용합니다.

- `letters`
- `banned_words`

DB를 새로 만들 경우 `supabase/schema.sql`을 Supabase SQL Editor에서 실행하세요.
