export function renderTemplate(content: string, variables: Record<string, string | number | boolean | null | undefined>) {
  return content.replace(/{{\s*([a-zA-Z0-9_.-]+)\s*}}/g, (_match, key) => {
    const value = variables[key];
    if (value === undefined || value === null) {
      return '';
    }
    return String(value);
  });
}

export function parseTemplateData(raw: string | undefined) {
  if (!raw || raw.trim().length === 0) {
    return {};
  }

  try {
    return JSON.parse(raw) as Record<string, string | number | boolean>;
  } catch {
    return {};
  }
}
