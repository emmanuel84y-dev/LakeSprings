import React from 'react';

type InlineNode = string | React.ReactElement;

function renderInline(text: string, keyPrefix: string): InlineNode[] {
  const nodes: InlineNode[] = [];
  let remaining = text;
  let index = 0;

  const patterns = [
    { regex: /^\*\*(.+?)\*\*/, render: (value: string, key: string) => <strong key={key}>{renderInline(value, `${key}-b`)}</strong> },
    { regex: /^__(.+?)__/, render: (value: string, key: string) => <strong key={key}>{renderInline(value, `${key}-b`)}</strong> },
    { regex: /^\*(.+?)\*/, render: (value: string, key: string) => <em key={key}>{renderInline(value, `${key}-i`)}</em> },
    { regex: /^_(.+?)_/, render: (value: string, key: string) => <em key={key}>{renderInline(value, `${key}-i`)}</em> },
    { regex: /^`([^`]+)`/, render: (value: string, key: string) => <code key={key} className="rounded bg-mist px-1.5 py-0.5 text-[0.9em]">{value}</code> },
    { regex: /^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/, render: (value: string, key: string, href?: string) => <a key={key} href={href} target="_blank" rel="noreferrer" className="text-reservoir underline underline-offset-2">{value}</a> },
  ];

  while (remaining.length > 0) {
    let matched = false;

    for (const pattern of patterns) {
      const match = remaining.match(pattern.regex);
      if (!match) continue;
      const key = `${keyPrefix}-${index++}`;
      nodes.push(pattern.render(match[1], key, match[2]));
      remaining = remaining.slice(match[0].length);
      matched = true;
      break;
    }

    if (matched) continue;

    const nextSpecial = remaining.search(/(\*\*|__|\*|_|`|\[)/);
    if (nextSpecial === -1) {
      nodes.push(remaining);
      break;
    }
    if (nextSpecial > 0) {
      nodes.push(remaining.slice(0, nextSpecial));
      remaining = remaining.slice(nextSpecial);
    } else {
      nodes.push(remaining[0]);
      remaining = remaining.slice(1);
    }
    index++;
  }

  return nodes;
}

export function MarkdownContent({ content }: { content: string }) {
  const lines = content.replace(/\r\n?/g, '\n').split('\n');
  const blocks: React.ReactElement[] = [];
  let paragraph: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push(<p key={`p-${blocks.length}`} className="mb-4">{renderInline(paragraph.join(' '), `p-${blocks.length}`)}</p>);
    paragraph = [];
  };

  const flushList = () => {
    if (!list) return;
    const ListTag = list.ordered ? 'ol' : 'ul';
    blocks.push(
      <ListTag key={`list-${blocks.length}`} className="mb-4 ml-6 list-outside space-y-1">
        {list.items.map((item, i) => <li key={i}>{renderInline(item, `list-${blocks.length}-${i}`)}</li>)}
      </ListTag>
    );
    list = null;
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    const heading = trimmed.match(/^(#{1,3})\s+(.+)$/);
    const unordered = trimmed.match(/^[-*+]\s+(.+)$/);
    const ordered = trimmed.match(/^\d+\.\s+(.+)$/);
    const quote = trimmed.match(/^>\s?(.*)$/);

    if (!trimmed) {
      flushParagraph();
      flushList();
      return;
    }

    if (heading) {
      flushParagraph();
      flushList();
      const Tag = heading[1].length === 1 ? 'h2' : heading[1].length === 2 ? 'h3' : 'h4';
      blocks.push(<Tag key={`h-${index}`} className="mb-3 mt-7 font-display text-2xl text-ink first:mt-0">{renderInline(heading[2], `h-${index}`)}</Tag>);
      return;
    }

    if (quote) {
      flushParagraph();
      flushList();
      blocks.push(<blockquote key={`q-${index}`} className="mb-4 border-l-2 border-brass pl-4 italic text-ink/70">{renderInline(quote[1], `q-${index}`)}</blockquote>);
      return;
    }

    if (unordered || ordered) {
      flushParagraph();
      const isOrdered = Boolean(ordered);
      if (!list || list.ordered !== isOrdered) {
        flushList();
        list = { ordered: isOrdered, items: [] };
      }
      list.items.push((unordered ?? ordered)![1]);
      return;
    }

    flushList();
    paragraph.push(trimmed);
  });

  flushParagraph();
  flushList();

  return <div className="prose prose-neutral mt-8 max-w-none leading-relaxed text-ink/80">{blocks}</div>;
}
