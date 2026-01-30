# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Who's on Meet?** - Google Meet 참석 체크를 위한 Chrome 확장 프로그램. 등록된 사용자 이름과 현재 참가자 목록을 비교하여 출석 여부를 표시합니다.

## Development Commands

모든 명령은 `extension/` 디렉토리에서 실행:

```bash
cd extension
pnpm install     # 의존성 설치
pnpm dev         # 개발 서버 시작 (Chrome)
pnpm dev:firefox # 개발 서버 시작 (Firefox)
pnpm build       # 프로덕션 빌드 (.output/chrome-mv3에 출력)
pnpm build:firefox
pnpm zip         # 배포용 zip 파일 생성
pnpm compile     # TypeScript 타입 체크만 실행
```

**환경 요구사항:**
- Node.js v22.14.0 (.nvmrc)
- pnpm@10.20.0

## Architecture

WXT(Web Extension Toolkit) + React 19 + TypeScript 기반 Manifest V3 확장 프로그램.

```
extension/
├── entrypoints/
│   ├── background.ts    # Service worker (최소 로깅만)
│   ├── content.ts       # 콘텐츠 스크립트 - 페이지 DOM에서 참가자 목록 추출
│   └── popup/           # 팝업 UI
│       ├── App.tsx      # 메인 React 컴포넌트 (상태 관리, 비즈니스 로직)
│       ├── main.tsx     # React 마운트
│       └── App.css      # 스타일 (다크모드 지원)
├── public/icon/         # 확장 프로그램 아이콘
└── wxt.config.ts        # WXT 설정 (권한, 매니페스트)
```

**컴포넌트 간 통신:**
- Popup → Content Script: `chrome.tabs.sendMessage({ type: "checkParticipants" })`
- Content Script → Popup: `sendResponse({ participants: [...] })`
- 데이터 저장: `browser.storage.local` API 사용 (키: `"userList"`)

**이름 매칭 로직** (`normalizeName` 함수):
- 소문자 변환, 공백/마침표/괄호 내용 제거
- "John Doe", "john.doe", "John (Manager)" 모두 동일하게 매칭

## Cross-Browser Support

Chrome과 Firefox API 모두 지원:
```typescript
const browserAPI = typeof browser !== "undefined" ? browser : chrome;
```

## Code Style

- 한국어 JSDoc 주석 사용
- 콘텐츠 스크립트에서 한국어 상태 텍스트 필터링: "병합된 오디오", "참석함", "응답 없음", "거절함"

## Available Claude Agents

`.claude/agents/` 디렉토리에 정의된 에이전트:
- **code-reviewer**: 코드 품질, 보안, 성능 리뷰 (코드 수정 없이 리뷰만 제공)
- **korean-commenter**: 한국어 코드 주석 작성
