# LLM 提示词工程文档

本文档记录 AI Resume Localizer 项目中使用的 LLM 提示词策略，包括 JSON 输出强制、日本商务礼仪适配、和暦转换等关键技术。

## 概述

项目使用 Dify Cloud 工作流编排 LLM 调用，通过 OpenRouter 接入 Google Gemini 3 Flash 模型。提示词设计遵循以下原则：

1. **忠实性**：不捏造原文中不存在的信息
2. **一致性**：统一的 JSON 输出格式
3. **本地化**：符合日本商务文书规范

## JSON 输出强制策略

### 问题背景

LLM 可能输出以下干扰内容，导致 JSON 解析失败：

- Markdown 代码块标记（` ```json ... ``` `）
- 思维链标签（`皮肤病...腰椎`）
- 解释性文字

### 解决方案：三层防御

#### 第一层：系统提示词明确禁止

**位置**: `workflow/resume_extraction.yml` - LLM 节点系统提示

```yaml
<rule_3_strict_json>
  不要输出任何 markdown 标记（如 ```json）、不要输出 皮肤病 等思考过程，
  不要包含任何解释性文字。必须严格按照下面的 JSON 结构输出。
</rule_3_strict_json>
```

**位置**: `workflow/resume_translation.yml` - LLM 节点系统提示

```yaml
<rule>厳格なJSON出力：マークダウン記法（```jsonなど）や、皮肤病タグ、
思考過程、説明文は一切出力せず、純粋なJSON文字列のみを出力してください。</rule>
```

#### 第二层：Dify 工作流 Code 节点清理

**CoT 标签清理节点**:

```python
# workflow/resume_extraction.yml - CoT ストリップ节点
import re

def main(llm_text: str) -> dict:
    # Strip 皮肤病...腰椎 blocks (including multiline)
    text = re.sub(r'皮肤病[\s\S]*?腰椎', '', llm_text, flags=re.DOTALL)
    return {"result": text.strip()}
```

**JSON 清理和验证节点**:

```python
# workflow/resume_extraction.yml - 清洗 JSON 输出节点
import json
import re

def main(llm_text: str) -> dict:
    text = llm_text.strip()

    # 1. 去掉 markdown 代码块（如果存在）
    text = re.sub(r'^```(?:json)?\s*\n?', '', text)
    text = re.sub(r'\n?```\s*$', '', text)
    text = text.strip()

    # 2. 找到第一个 '{'
    start = text.find('{')
    if start == -1:
        raise ValueError("No JSON object found in LLM output")

    text = text[start:]

    # 3. 使用 JSONDecoder 解析首个合法 JSON
    decoder = json.JSONDecoder()

    try:
        parsed, _ = decoder.raw_decode(text)
    except json.JSONDecodeError as e:
        raise ValueError(
            f"LLM returned invalid JSON: {e}\n"
            f"Content preview: {text[:500]}"
        )

    return {"result": json.dumps(parsed, ensure_ascii=False)}
```

**关键技术点**:
- 使用 `JSONDecoder.raw_decode()` 从任意位置解析首个合法 JSON
- 保留完整错误信息便于调试

#### 第三层：后端安全网

**位置**: `backend/app/services/dify_client.py`

```python
def _strip_cot_tags(self, text: str) -> str:
    """Strip 皮肤病...腰椎 chain-of-thought tags from text.

    Defence-in-depth: reasoning models may emit CoT blocks even when
    instructed not to. Stripping them here prevents JSON parse failures.
    """
    result = re.sub(r"皮肤病[\s\S]*?腰椎", "", text, flags=re.DOTALL)
    if result != text:
        logger.warning(
            "CoT safety net activated: stripped 皮肤病 tags from Dify response"
        )
    return result.strip()
```

**调用时机**:

```python
async def extract_resume(self, resume_text: str, user: str = "default") -> dict:
    # ... API 调用 ...
    
    if isinstance(structured, str):
        structured = self._strip_cot_tags(structured)  # 安全网
        try:
            structured = json.loads(structured)
        except json.JSONDecodeError as exc:
            raise DifyWorkflowError(
                f"Failed to parse structured_resume JSON: {exc}"
            ) from exc
```

### 防御策略总结

| 层级 | 位置 | 处理内容 |
|------|------|----------|
| 1 | Dify LLM 系统提示 | 禁止输出 markdown/CoT/解释 |
| 2 | Dify Code 节点 | 清理 CoT 标签 + JSON 验证 |
| 3 | 后端 DifyClient | CoT 安全网 + JSON 解析 |

## 日本商务礼仪适配

### 语调规则

**位置**: `workflow/resume_translation.yml` - LLM 系统提示

```yaml
<tone_and_style>
  - 客観的事実（work_historyのresponsibilities, projectsのdescriptionなど）：
    簡潔な「体言止め」または「〜を担当」「〜に従事」などの表現を使用してください
    （例：「APIの設計と開発を担当。」）。
    
  - 主観的記述（motivation志望動機, strengths自己PRなど）：
    「です・ます調」を使用し、適切な敬語（謙譲語・丁寧語）を用いてください。
</tone_and_style>
```

**应用示例**:

| 中文原文 | 日文翻译 | 语调类型 |
|----------|----------|----------|
| 负责后端 API 开发 | APIの設計と開発を担当 | 体言止め（客观） |
| 我对贵公司很感兴趣 | 貴社の事業に深く共感し、応募いたしました | です・ます調（主观） |

### 姓名片假名转换

**规则**:

```yaml
<name_katakana_conversion>
  - 中国語の人名（漢字）は、ピンイン読みに基づいて自然なカタカナに変換してください。
  - 姓と名の間に全角スペースを入れてください
    （例：张思源 → チョウ スーユエン、李明 → リ ミン）。
</name_katakana_conversion>
```

**后端处理**:

```python
# backend/app/services/template_renderer.py
# 使用 U+3000（全角空格）格式化姓名
if data.get("personal_info") and data["personal_info"].get("name"):
    parts = data["personal_info"]["name"].split()
    if len(parts) >= 2:
        data["personal_info"]["name_formatted"] = "\u3000".join(parts[:2])
```

### 学历映射

**规则**:

```yaml
<education_mapping>
  - 专科 / 大专 → 短期大学卒業 または 専門学校卒業（文脈による）
  - 本科 → 学士
  - 硕士 → 修士
  - 博士 → 博士
</education_mapping>
```

### 技能等级映射

**规则**:

```yaml
<skill_level_mapping>
  - 中国語のスキル熟練度（精通、熟練、熟悉、了解など）は、
    日本のIT業界で客観的・標準的な表現に変換して結合してください。
    
  - 「精通」「深い理解」 → 「専門レベル（独力で設計・構築可能）」
  - 「熟練」「掌握」「経験豊富」 → 「実務経験あり（独力で対応可能）」
  - 「熟悉」「良好」「日常使用」 → 「基礎知識あり（実務適用可能）」
  - 「了解」「初歩」「基礎」 → 「学習中（基礎概念の理解）」
  
  - ※原文に熟練度の記載がない場合は、スキル名のみを出力してください（例：Java）。
</skill_level_mapping>
```

**输出示例**:

```
Java(実務経験あり), Python(専門レベル), React(基礎知識あり)
```

### 希望条件处理

**规则**:

```yaml
<desired_conditions_handling>
  - 日本の履歴書特有の「本人希望記入欄（desired_conditions）」を生成してください。
  
  - 入力データの「career_objective（求職意向）」や「expected_salary（希望給与）」
    などに具体的な希望が記載されている場合は、それを簡潔で丁寧な日本語に翻訳してください。
    
  - 最後に必ず「その他については、貴社規定に従います。」と付け加えてください。
  
  - もし入力データに特別な希望が一切記載されていない場合、あるいは null の場合は、
    推測せず、絶対に「貴社規定に従います。」という一文のみを出力してください。
</desired_conditions_handling>
```

## 和暦（年号）转换

### 为什么在后端处理而非 LLM？

1. **精确性**：年号边界涉及具体月份，LLM 容易出错
2. **一致性**：后端统一处理确保所有日期格式一致
3. **可维护性**：年号规则变更只需修改后端代码

### 月份感知的 Era 边界

**位置**: `backend/app/services/template_renderer.py`

```python
def _parse_date_parts(date_str: str | None) -> dict:
    """解析日期字符串为和暦年月
    
    月份感知的 Era 边界：
    - 令和：2019年5月及以后
    - 平成：1989年1月 - 2019年4月
    - 昭和：1926年12月 - 1988年12月
    """
    if not date_str:
        return {"year": "", "month": ""}
    
    # 处理 YYYY-MM 或 YYYY/MM ISO 格式
    iso_match = re.match(r"(\d{4})[-/](\d{1,2})", date_str)
    if iso_match:
        western_year = int(iso_match.group(1))
        month_int = int(iso_match.group(2))
        month_str = str(month_int)  # 去除前导零
        
        # 月份感知的 Era 边界检测
        if western_year > 2019 or (western_year == 2019 and month_int >= 5):
            era_year = western_year - 2018
            year_str = "令和元" if era_year == 1 else f"令和{era_year}"
        elif western_year >= 1989:
            era_year = western_year - 1988
            year_str = "平成元" if era_year == 1 else f"平成{era_year}"
        else:
            era_year = western_year - 1925
            year_str = "昭和元" if era_year == 1 else f"昭和{era_year}"
        
        return {"year": year_str, "month": month_str}
```

### 支持的输入格式

| 格式 | 示例 | 转换结果 |
|------|------|----------|
| ISO (YYYY-MM) | 2023-04 | 令和5年4月 |
| ISO (YYYY/MM) | 2019/05 | 令和元年5月 |
| 日本格式 | 令和5年4月 | 令和5年4月 |
| 西历格式 | 2023年4月 | 令和5年4月 |

### 当前日期生成

```python
def _current_date_wareki() -> str:
    """生成当前日期和暦格式：'令和{year}年　{month}月　{day}日現在'"""
    today = datetime.date.today()
    reiwa_year = today.year - 2018
    return f"令和{reiwa_year}年\u3000{today.month}月\u3000{today.day}日現在"
```

## 项目路由逻辑

### 问题背景

中文简历中的项目经历需要根据 `associated_company` 字段进行分类：

- **公司内部项目**：嵌入到对应工作经历的 `projects` 数组
- **个人项目**：放在根级别的 `personal_projects` 数组

### 路由规则

**位置**: `workflow/resume_translation.yml` - LLM 系统提示

```yaml
<project_routing>
  - 入力の `project_experience` は、`associated_company` フィールドをチェックしてください。
  
  - 企業プロジェクト：
    `associated_company` が `work_experience` の会社名と一致する場合、
    該当する `work_history` 内の `projects` 配列にネストして格納してください。
    
  - 個人/その他プロジェクト：
    `associated_company` が null、または一致する会社がない場合は、
    ルートレベルの `personal_projects` 配列に格納してください。
</project_routing>
```

### 输出结构

```json
{
  "work_history": [
    {
      "company": "ABC公司",
      "projects": [
        {
          "name": "内部项目A",
          "role": "开发人员",
          "description": "..."
        }
      ]
    }
  ],
  "personal_projects": [
    {
      "name": "个人开源项目",
      "role": "作者",
      "description": "..."
    }
  ]
}
```

## 表达优化规则

### 简历提取时的润色

**位置**: `workflow/resume_extraction.yml` - LLM 系统提示

```yaml
<rule_2_expression_optimization>
  在提取工作经验和项目经验时，请对候选人的原始表述进行专业化润色：
  
  - 将口语化、流水账式的描述，提炼为专业的、结构化的要点
    （推荐使用"核心职责"与"取得成果"的维度）。
    
  - 纠正明显的语病和错别字。
  
  - **红线警告**：绝对禁止捏造原文中不存在的技术栈、虚构数据指标或捏造工作经历。
    只能"提炼和润色"，不能"无中生有"，不能"夸大"。
</rule_2_expression_optimization>
```

## 缺失数据处理

### 自动生成职務要約

**规则**:

```yaml
<missing_data_handling>
  - 【重要】もし入力に `self_introduction` がない場合、
    `work_experience` と `project_experience` の内容を分析し、
    日本の職務経歴書に必須の「職務要約（200〜250文字程度）」を
    自動生成して `summary` に格納してください。
</missing_data_handling>
```

### 空值处理

```yaml
<missing_data_handling>
  - 入力JSONで null または空配列 [] のフィールドは、
    出力でも厳密に null または [] を維持してください。
</missing_data_handling>
```

## 相关文档

- [系统架构](./architecture.md) - 整体架构概述
- [模块说明](./modules.md) - 各模块职责
- [技术挑战与解决方案](./technical-challenges.md) - 关键技术问题
