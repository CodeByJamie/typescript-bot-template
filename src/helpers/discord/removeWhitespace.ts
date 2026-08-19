export default function removeWhitespace(string: string): string {
    return string.replace(/^[ \t]+/gm, "").trim();
};