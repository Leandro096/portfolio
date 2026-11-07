/**
 * Thousands separator for metrics. Deliberately `en-US` in both languages: in the Dominican
 * Republic the thousands separator is the comma, as in English ("5,000"), so the Spanish page
 * must not switch to `es` ("5.000" / "5000").
 */
export const formatNumber = (n: number): string => n.toLocaleString('en-US');
