/**
 * Content Sanitizer
 * ==================
 * Sanitizes HTML content for safe publication,
 * removing potentially dangerous elements while
 * preserving semantic formatting.
 */

import sanitizeHtml from 'sanitize-html';

export class ContentSanitizer {
  private readonly options: sanitizeHtml.IOptions;

  constructor() {
    this.options = {
      allowedTags: [
        // Headings
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        // Block
        'p', 'blockquote', 'pre', 'code', 'div', 'section', 'article',
        // Lists
        'ul', 'ol', 'li',
        // Inline
        'strong', 'em', 'b', 'i', 'u', 'mark', 'small', 'sub', 'sup',
        'span', 'br', 'hr',
        // Links & Media
        'a', 'img', 'figure', 'figcaption',
        // Tables
        'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
        // Definition lists
        'dl', 'dt', 'dd',
      ],
      allowedAttributes: {
        a: ['href', 'title', 'target', 'rel'],
        img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
        td: ['colspan', 'rowspan'],
        th: ['colspan', 'rowspan', 'scope'],
        code: ['class'], // For syntax highlighting class names
        span: ['class'],
        div: ['class'],
        pre: ['class'],
      },
      // Force rel="noopener noreferrer" on external links
      transformTags: {
        a: (tagName, attribs) => {
          const href = attribs.href || '';
          const isExternal =
            href.startsWith('http') && !href.includes('xxxiii.io');

          return {
            tagName,
            attribs: {
              ...attribs,
              ...(isExternal
                ? {
                    target: '_blank',
                    rel: 'noopener noreferrer nofollow',
                  }
                : {}),
            },
          };
        },
        img: (tagName, attribs) => ({
          tagName,
          attribs: {
            ...attribs,
            loading: 'lazy',
          },
        }),
      },
      // Remove empty tags
      exclusiveFilter: (frame) => {
        const isEmptyInline = ['span', 'em', 'strong', 'b', 'i'].includes(frame.tag);
        return isEmptyInline && !frame.text.trim();
      },
      allowedSchemes: ['http', 'https', 'mailto'],
      allowProtocolRelative: false,
    };
  }

  /**
   * Sanitize HTML content for publication.
   */
  sanitize(html: string): string {
    return sanitizeHtml(html, this.options);
  }

  /**
   * Strip all HTML tags, returning plain text.
   */
  stripHtml(html: string): string {
    return sanitizeHtml(html, {
      allowedTags: [],
      allowedAttributes: {},
    }).trim();
  }

  /**
   * Extract a plain text excerpt from HTML.
   */
  excerpt(html: string, maxLength = 300): string {
    const text = this.stripHtml(html);
    if (text.length <= maxLength) return text;

    // Cut at word boundary
    const truncated = text.slice(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    return (lastSpace > maxLength * 0.7 ? truncated.slice(0, lastSpace) : truncated) + '…';
  }
}
