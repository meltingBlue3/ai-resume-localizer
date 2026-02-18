const DEGREE_MAP: Record<string, string> = {
  '本科': '大学卒業（学士）',
  '学士': '大学卒業（学士）',
  '专科': '短期大学卒業',
  '大专': '短期大学卒業',
  '硕士': '大学院修了（修士）',
  '研究生': '大学院修了（修士）',
  '博士': '大学院修了（博士）',
  '高中': '高等学校卒業',
  '高职': '専門学校卒業',
  '中专': '専門学校卒業',
};

/**
 * Maps Chinese education credential strings to standard Japanese equivalents.
 * Returns the original value unchanged if no mapping exists.
 */
export function mapDegreeToJapanese(degree: string | null | undefined): string {
  if (!degree) return '';
  return DEGREE_MAP[degree.trim()] ?? degree;
}
