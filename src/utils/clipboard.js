export async function copyText(value) {
  const text = String(value ?? '');
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.left = '-9999px';
  document.body.appendChild(area);
  area.select();
  document.execCommand('copy');
  document.body.removeChild(area);
}

export async function copyAndExpire(value, clearMs = 0) {
  const text = String(value ?? '');
  await copyText(text);
  if (!clearMs) return;

  window.setTimeout(async () => {
    try {
      if (navigator.clipboard?.readText) {
        const current = await navigator.clipboard.readText();
        if (current === text) {
          await navigator.clipboard.writeText('');
        }
        return;
      }
    } catch {
      /* Clipboard read is often denied; ignore. */
    }
  }, clearMs);
}
