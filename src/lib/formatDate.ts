/**
 * 格式化日期时间字符串
 * @param text 日期时间字符串
 * @returns 格式化后的日期时间字符串
 */
export const formatDate = (text: string) => {
  if (!text) return "-";
  const date = new Date(text);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};
