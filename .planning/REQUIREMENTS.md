# Requirements: AI Resume Localizer

**Defined:** 2026-02-22
**Core Value:** 用户上传一份中文简历，经过結構化提取、日文翻译、人工審核修正后，得到两份符合日本企業招聘标准的PDF简历（履歴書 + 職務経歴書）

## v1.2 Requirements

Requirements for v1.2 PDF Quality & Workflow Fixes. Each maps to roadmap phases.

### 履歴書テンプレート

- [ ] **RKTPL-01**: 履歴書の姓名に全角スペースを挿入して表示する
- [ ] **RKTPL-02**: 履歴書の住所に郵便番号を表示する
- [ ] **RKTPL-03**: 履歴書の職歴に役職名を表示する
- [ ] **RKTPL-04**: 履歴書の職歴からプロジェクト経歴を分離する（職歴は会社・役職のみ）
- [ ] **RKTPL-05**: 通勤時間・扶養家族・配偶者フィールドをテンプレートから削除する
- [ ] **RKTPL-06**: 本人希望記入欄を改善する（給料・職種等の希望を記入、なければ「貴社の規定に従います」）

### 職務経歴書テンプレート

- [ ] **SKTPL-01**: 職務経歴書の職務経歴にプロジェクト経歴を含める（会社内プロジェクト→該当経歴内、個人プロジェクト→別セクション）
- [ ] **SKTPL-02**: 終了日がない場合「現在」を表示する（"none"ではなく）

### 提取工作流

- [x] **EXTR-01**: `other`フィールドを新規追加して抽出する
- [x] **EXTR-02**: 言語資格を証書フィールドに統合して抽出する
- [ ] **EXTR-03**: PDF出力の問題修正に対応するフィールドマッピングを更新する

### 翻訳工作流

- [x] **TRAN-01**: 未使用フィールド（linkedin, website, gpa, notes）を削除する
- [ ] **TRAN-02**: PDF出力の問題修正に対応するフィールド変換ロジックを修正する

## Future Requirements

None deferred — all identified issues are in v1.2 scope.

## Out of Scope

| Feature | Reason |
|---------|--------|
| 新しい簡歴テンプレートデザイン | JIS標準フォーマットに準拠、カスタムデザインなし |
| 批量简历转換 | v2機能 |
| 新しいAI機能の追加 | v1.2はプロンプト修正のみ、新機能なし |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| RKTPL-01 | Phase 11 | Pending |
| RKTPL-02 | Phase 11 | Pending |
| RKTPL-03 | Phase 11 | Pending |
| RKTPL-04 | Phase 10 | Pending |
| RKTPL-05 | Phase 11 | Pending |
| RKTPL-06 | Phase 11 | Pending |
| SKTPL-01 | Phase 10 | Pending |
| SKTPL-02 | Phase 11 | Pending |
| EXTR-01 | Phase 9 | Complete |
| EXTR-02 | Phase 9 | Complete |
| EXTR-03 | Phase 10 | Pending |
| TRAN-01 | Phase 9 | Complete |
| TRAN-02 | Phase 10 | Pending |

**Coverage:**
- v1.2 requirements: 13 total
- Mapped to phases: 13
- Unmapped: 0

---
*Requirements defined: 2026-02-22*
*Last updated: 2026-02-22 after roadmap creation*
