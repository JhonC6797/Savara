export const stripHtml = (htmlString) => {
  if (typeof htmlString !== "string") return htmlString || "";
  return htmlString
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
};