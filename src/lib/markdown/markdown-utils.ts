export class MarkdownUtils {

  private static readonly LIST_PATTERNS = {
    unordered: /^(\s*)([-*+])\s+(.*)$/,
    ordered: /^(\s*)(\d+)\.\s+(.*)$/,
    checkbox: /^(\s*)([-*+])\s+\[([ xX])\]\s+(.*)$/,
  };


  static detectListItem(line: string): {
    type: 'unordered' | 'ordered' | 'checkbox' | null;
    indent: string;
    marker: string;
    content: string;
    isEmpty: boolean;
  } | null {
    // Checkbox list
    const checkboxMatch = line.match(this.LIST_PATTERNS.checkbox);
    if (checkboxMatch) {
      return {
        type: 'checkbox',
        indent: checkboxMatch[1],
        marker: checkboxMatch[2],
        content: checkboxMatch[4],
        isEmpty: checkboxMatch[4].trim() === '',
      };
    }

    // Ordered list
    const orderedMatch = line.match(this.LIST_PATTERNS.ordered);
    if (orderedMatch) {
      return {
        type: 'ordered',
        indent: orderedMatch[1],
        marker: orderedMatch[2],
        content: orderedMatch[3],
        isEmpty: orderedMatch[3].trim() === '',
      };
    }

    // Unordered list
    const unorderedMatch = line.match(this.LIST_PATTERNS.unordered);
    if (unorderedMatch) {
      return {
        type: 'unordered',
        indent: unorderedMatch[1],
        marker: unorderedMatch[2],
        content: unorderedMatch[3],
        isEmpty: unorderedMatch[3].trim() === '',
      };
    }

    return null;
  }

  static getNextListItem(listInfo: NonNullable<ReturnType<typeof MarkdownUtils.detectListItem>>): string {
    const { type, indent, marker } = listInfo;

    switch (type) {
      case 'unordered':
        return `${indent}${marker} `;
      
      case 'ordered':
        const nextNumber = parseInt(marker, 10) + 1;
        return `${indent}${nextNumber}. `;
      
      case 'checkbox':
        return `${indent}${marker} [ ] `;
      
      default:
        return '';
    }
  }


  static handleListEnter(
    text: string,
    cursorPosition: number
  ): { newText: string; newCursorPosition: number } | null {
    const beforeCursor = text.substring(0, cursorPosition);
    const afterCursor = text.substring(cursorPosition);
    const lines = beforeCursor.split('\n');
    const currentLine = lines[lines.length - 1];

    const listInfo = this.detectListItem(currentLine);
    if (!listInfo) return null;

    if (listInfo.isEmpty) {
      const beforeCurrentLine = lines.slice(0, -1).join('\n');
      const newText = beforeCurrentLine + (beforeCurrentLine ? '\n' : '') + afterCursor;
      const newCursorPosition = beforeCurrentLine.length + (beforeCurrentLine ? 1 : 0);
      
      return { newText, newCursorPosition };
    }

    const nextItem = this.getNextListItem(listInfo);
    const newText = beforeCursor + '\n' + nextItem + afterCursor;
    const newCursorPosition = cursorPosition + 1 + nextItem.length;

    return { newText, newCursorPosition };
  }
}
