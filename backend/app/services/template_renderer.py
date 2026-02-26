"""Jinja2 template rendering service for Japanese resume documents.

Converts JpResumeData into rendered HTML via Jinja2 templates.
Handles null-field normalization, date parsing, and CSS inlining for preview.
"""

import datetime
import re

from jinja2 import Environment, FileSystemLoader

from app.config import TEMPLATES_DIR
from app.models.resume import JpResumeData

env = Environment(
    loader=FileSystemLoader(str(TEMPLATES_DIR)),
    autoescape=True,
)


def _parse_date_parts(date_str: str | None) -> dict:
    """Parse a Japanese date string into year and month components.

    Handles formats like '令和5年4月', '2023年4月', '令和5年 4月', '平成30年3月',
    'YYYY-MM', 'YYYY/MM' (ISO formats from Dify LLM output).
    Returns dict with 'year' and 'month' keys.
    Year values are returned without trailing '年' (e.g. '令和5' not '令和5年').
    Western years are converted to wareki with month-aware era boundaries.
    """
    if not date_str:
        return {"year": "", "month": ""}

    # Try matching patterns like '令和5年4月' or '令和5年 4月'
    match = re.match(r"(.+年)\s*(\d+)月?", date_str)
    if match:
        year_str = match.group(1).rstrip("年")
        month_str = match.group(2)

        # Convert western year to wareki if purely numeric
        if year_str.isdigit():
            western_year = int(year_str)
            month_int = int(month_str)
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

    # Handle YYYY-MM or YYYY/MM ISO format (from Dify LLM output)
    iso_match = re.match(r"(\d{4})[-/](\d{1,2})", date_str)
    if iso_match:
        western_year = int(iso_match.group(1))
        month_int = int(iso_match.group(2))
        month_str = str(month_int)  # strip leading zeros

        # Month-aware era boundary detection
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

    # If no match, put full string in year, leave month empty
    return {"year": date_str, "month": ""}


def _date_to_sort_key(date_str: str | None) -> tuple[int, int]:
    """Convert date string to (western_year, month) for sorting. Unparseable → (9999, 12)."""
    if not date_str:
        return (9999, 12)
    iso_match = re.match(r"(\d{4})[-/](\d{1,2})", date_str)
    if iso_match:
        return (int(iso_match.group(1)), int(iso_match.group(2)))
    match = re.match(r"(.+年)\s*(\d+)月?", date_str)
    if match:
        year_str = match.group(1).rstrip("年").replace("元", "1")
        month_int = int(match.group(2))
        num_match = re.search(r"\d+", year_str)
        if num_match:
            era_year = int(num_match.group())
            if "令和" in year_str:
                western = 2018 + era_year  # Reiwa 1 = 2019
            elif "平成" in year_str:
                western = 1988 + era_year  # Heisei 1 = 1989
            elif "昭和" in year_str:
                western = 1925 + era_year  # Showa 1 = 1926
            else:
                return (9999, 12)
            return (western, month_int)
    return (9999, 12)


def _current_date_wareki() -> str:
    """Generate current date in wareki format: '令和{year}年　{month}月　{day}日現在'."""
    today = datetime.date.today()
    # Reiwa era started 2019 (Reiwa 1 = 2019)
    reiwa_year = today.year - 2018
    return f"令和{reiwa_year}年\u3000{today.month}月\u3000{today.day}日現在"


def prepare_context(jp_resume: JpResumeData) -> dict:
    """Normalize JpResumeData into a template-ready context dictionary.

    - Converts None sub-objects to empty dicts/lists
    - Processes education/work/certification dates into year/month parts
    - Generates current_date_wareki
    """
    data = jp_resume.model_dump()

    # Normalize None sub-objects
    if data.get("personal_info") is None:
        data["personal_info"] = {}
    if data.get("education") is None:
        data["education"] = []
    if data.get("work_history") is None:
        data["work_history"] = []
    if data.get("skills") is None:
        data["skills"] = []
    if data.get("certifications") is None:
        data["certifications"] = []
    if data.get("personal_projects") is None:
        data["personal_projects"] = []
    if data.get("portfolio_links") is None:
        data["portfolio_links"] = []

    # Format name with full-width space (U+3000) separator
    if data.get("personal_info") and data["personal_info"].get("name"):
        parts = data["personal_info"]["name"].split()
        if len(parts) >= 2:
            data["personal_info"]["name_formatted"] = "\u3000".join(parts[:2])
        else:
            data["personal_info"]["name_formatted"] = data["personal_info"]["name"]

    # Normalize "none"/"null"/empty strings to None for end_date (ongoing position → 現在)
    for entry in data["work_history"]:
        end_val = entry.get("end_date")
        if end_val is not None and isinstance(end_val, str):
            if end_val.strip() == "" or end_val.lower() in ("none", "null"):
                entry["end_date"] = None

    # Normalize "none"/"null"/empty strings to None for project end_dates (embedded in work_history)
    for entry in data["work_history"]:
        if entry.get("projects"):
            for project in entry["projects"]:
                end_val = project.get("end_date")
                if end_val is not None and isinstance(end_val, str):
                    if end_val.strip() == "" or end_val.lower() in ("none", "null"):
                        project["end_date"] = None

    # Normalize "none"/"null"/empty strings to None for personal_projects end_dates
    for project in data["personal_projects"]:
        end_val = project.get("end_date")
        if end_val is not None and isinstance(end_val, str):
            if end_val.strip() == "" or end_val.lower() in ("none", "null"):
                project["end_date"] = None

    # Normalize "none"/"null"/empty strings to None for certification date (取得年月)
    for cert in data["certifications"]:
        date_val = cert.get("date")
        if date_val is not None and isinstance(date_val, str):
            if date_val.strip() == "" or date_val.lower() in ("none", "null"):
                cert["date"] = None

    # Process education entries with year/month extraction (履歴書: chronological 早→晚)
    education_processed = []
    for entry in data["education"]:
        processed = dict(entry)
        start_parts = _parse_date_parts(entry.get("start_date"))
        end_parts = _parse_date_parts(entry.get("end_date"))
        processed["start_year"] = start_parts["year"]
        processed["start_month"] = start_parts["month"]
        processed["end_year"] = end_parts["year"]
        processed["end_month"] = end_parts["month"]
        education_processed.append(processed)
    education_processed.sort(
        key=lambda e: _date_to_sort_key(e.get("start_date") or e.get("end_date"))
    )
    data["education_processed"] = education_processed

    # Process work_history entries with year/month extraction (履歴書: chronological 早→晚)
    work_history_processed = []
    for entry in data["work_history"]:
        processed = dict(entry)
        start_parts = _parse_date_parts(entry.get("start_date"))
        end_parts = _parse_date_parts(entry.get("end_date"))
        processed["start_year"] = start_parts["year"]
        processed["start_month"] = start_parts["month"]
        processed["end_year"] = end_parts["year"]
        processed["end_month"] = end_parts["month"]
        work_history_processed.append(processed)
    work_history_processed.sort(
        key=lambda e: _date_to_sort_key(e.get("start_date") or e.get("end_date"))
    )
    data["work_history_processed"] = work_history_processed

    # 職務経歴書: work_history reverse chronological (晚→早)
    data["work_history"] = sorted(
        data["work_history"],
        key=lambda e: _date_to_sort_key(e.get("start_date") or e.get("end_date")),
        reverse=True,
    )

    # Process certifications with date splitting (year + month)
    certifications_processed = []
    for entry in data["certifications"]:
        processed = dict(entry)
        parts = _parse_date_parts(entry.get("date"))
        processed["date_year"] = parts["year"]
        processed["date_month"] = parts["month"]
        certifications_processed.append(processed)
    data["certifications_processed"] = certifications_processed

    # Generate current date in wareki
    data["current_date_wareki"] = _current_date_wareki()

    return data


def render_document(
    template_name: str,
    jp_resume: JpResumeData,
    photo_base64: str | None = None,
) -> str:
    """Render a Jinja2 template with JpResumeData.

    Args:
        template_name: Template filename (e.g. 'rirekisho.html').
        jp_resume: Japanese resume data model.
        photo_base64: Optional base64-encoded photo string.

    Returns:
        Rendered HTML string.
    """
    context = prepare_context(jp_resume)
    template = env.get_template(template_name)
    return template.render(data=context, photo_base64=photo_base64)


def render_document_for_preview(
    template_name: str,
    jp_resume: JpResumeData,
    photo_base64: str | None = None,
) -> str:
    """Render template with CSS inlined for iframe srcdoc preview.

    Replaces the external base.css link with an inline <style> block
    so the HTML is self-contained for iframe rendering.

    Args:
        template_name: Template filename (e.g. 'rirekisho.html').
        jp_resume: Japanese resume data model.
        photo_base64: Optional base64-encoded photo string.

    Returns:
        Rendered HTML string with inlined CSS.
    """
    html = render_document(template_name, jp_resume, photo_base64)

    # Read base.css content
    base_css_path = TEMPLATES_DIR / "base.css"
    if base_css_path.exists():
        base_css_content = base_css_path.read_text(encoding="utf-8")
        html = html.replace(
            '<link rel="stylesheet" href="base.css">',
            f"<style>{base_css_content}</style>",
        )

    return html
