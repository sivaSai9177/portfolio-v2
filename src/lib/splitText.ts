export function splitText(el: HTMLElement, by: 'char' | 'word' = 'char'): NodeListOf<Element> {
  const text = el.textContent?.trim() || '';
  el.innerHTML = '';
  el.setAttribute('aria-label', text);

  if (by === 'char') {
    text.split(/(\s+)/).forEach(segment => {
      if (/^\s+$/.test(segment)) {
        const space = document.createElement('span');
        space.className = 'char';
        space.textContent = '\u00A0';
        space.setAttribute('aria-hidden', 'true');
        el.appendChild(space);
        return;
      }
      const wordWrap = document.createElement('span');
      wordWrap.style.whiteSpace = 'nowrap';
      wordWrap.style.display = 'inline';
      segment.split('').forEach(char => {
        const span = document.createElement('span');
        span.className = 'char';
        span.textContent = char;
        span.setAttribute('aria-hidden', 'true');
        wordWrap.appendChild(span);
      });
      el.appendChild(wordWrap);
    });
  } else {
    text.split(/\s+/).forEach((word, i, arr) => {
      const span = document.createElement('span');
      span.className = 'word';
      span.textContent = word;
      span.setAttribute('aria-hidden', 'true');
      el.appendChild(span);
      if (i < arr.length - 1) {
        const space = document.createElement('span');
        space.className = 'word';
        space.innerHTML = '&nbsp;';
        space.setAttribute('aria-hidden', 'true');
        el.appendChild(space);
      }
    });
  }

  return el.querySelectorAll(by === 'char' ? '.char' : '.word');
}
