/**
 * Utility to detect and warn when Developer Tools (DevTools) is opened.
 * Supports console warnings and elements panel warnings with MutationObserver protection.
 */

export type DevToolsProtectionConfig = {
  enabled?: boolean;
  threshold?: number;
  intervalMs?: number;
  showConsoleWarning?: boolean;
  showElementsWarning?: boolean;
  removeElementWhenClosed?: boolean;
};

const DEFAULT_CONFIG: Required<DevToolsProtectionConfig> = {
  enabled: true,
  threshold: 160,
  intervalMs: 500,
  showConsoleWarning: true,
  showElementsWarning: true,
  removeElementWhenClosed: true,
};

const WARNING_ID = 'devtools-elements-warning';

const ASCII_ART = `
██████╗ ██╗   ██╗ ███╗   ██╗  ██████╗   ██╗       █████╗  ██╗   ██╗██╗██╗
██╔══██╗██║   ██║ ████╗  ██║ ██╔════╝   ██║      ██╔══██╗ ██║   ██║██║██║
██║  ██║██║   ██║ ██╔██╗ ██║ ██║  ███╗  ██║      ███████║ ██║   ██║██║██║
██║  ██║██║   ██║ ██║╚██╗██║ ██║   ██║  ██║      ██╔══██║ ██║   ╚═╝╚═╝╚═╝
██████╔╝╚██████╔╝ ██║ ╚████║ ╚██████╔╝  ███████╗ ██║  ██║ ██║   ██╗██╗██╗
╚═════╝  ╚═════╝  ╚═╝  ╚═══╝  ╚═════╝   ╚══════╝ ╚═╝  ╚═╝ ╚═╝   ╚═╝╚═╝╚═╝

─────────────────────────────────────────────────────────────────────────
  Đây là khu vực dành cho nhà phát triển.
  Không sao chép hoặc dán mã lạ vào DevTools.
  Nếu ai đó yêu cầu bạn dán mã vào đây, đó có thể là hành vi lừa đảo
  nhằm chiếm đoạt tài khoản hoặc thông tin cá nhân của bạn.
─────────────────────────────────────────────────────────────────────────

██╗ ██╗ ██╗ ██╗ ██╗ ██████╗    ███╗ ███╗ ███████╗ ██████╗  ██╗  █████╗ 
██║ ██║ ██║ ██║ ██║ ╚═██╔═╝    ████████║ ██╔════╝ ██╔══██╗ ██║ ██╔══██╗
██████║ ██║ ██║ ██║   ██║      ██╔██╔██║ █████╗   ██║  ██║ ██║ ███████║
██╔═██║ ██║ ██║ ██║   ██║      ██║╚═╝██║ ██╔══╝   ██║  ██║ ██║ ██╔══██║
██║ ██║ ╚████╔╝ ██║   ██║      ██║   ██║ ███████╗ ██████╔╝ ██║ ██║  ██║
╚═╝ ╚═╝  ╚═══╝  ╚═╝   ╚═╝      ╚═╝   ╚═╝ ╚══════╝ ╚═════╝  ╚═╝ ╚═╝  ╚═╝
`;

const getWarningComments = (): string[] => {
  return [
    '██████╗ ██╗   ██╗ ███╗   ██╗  ██████╗   ██╗       █████╗  ██╗   ██╗██╗██╗',
    '██╔══██╗██║   ██║ ████╗  ██║ ██╔════╝   ██║      ██╔══██╗ ██║   ██║██║██║',
    '██║  ██║██║   ██║ ██╔██╗ ██║ ██║  ███╗  ██║      ███████║ ██║   ██║██║██║',
    '██║  ██║██║   ██║ ██║╚██╗██║ ██║   ██║  ██║      ██╔══██║ ██║   ╚═╝╚═╝╚═╝',
    '██████╔╝╚██████╔╝ ██║ ╚████║ ╚██████╔╝  ███████╗ ██║  ██║ ██║   ██╗██╗██╗',
    '╚═════╝  ╚═════╝  ╚═╝  ╚═══╝  ╚═════╝   ╚══════╝ ╚═╝  ╚═╝ ╚═╝   ╚═╝╚═╝╚═╝',
    '─────────────────────────────────────────────────────────────────────────',
    '  Đây là khu vực dành cho nhà phát triển.',
    '  Không sao chép hoặc dán mã lạ vào DevTools.',
    '  Nếu ai đó yêu cầu bạn dán mã vào đây, đó có thể là hành vi lừa đảo',
    '  nhằm chiếm đoạt tài khoản hoặc thông tin cá nhân của bạn.',
    '─────────────────────────────────────────────────────────────────────────',
    '██╗ ██╗ ██╗ ██╗ ██╗ ██████╗    ███╗ ███╗ ███████╗ ██████╗  ██╗  █████╗ ',
    '██║ ██║ ██║ ██║ ██║ ╚═██╔═╝    ████████║ ██╔════╝ ██╔══██╗ ██║ ██╔══██╗',
    '██████║ ██║ ██║ ██║   ██║      ██╔██╔██║ █████╗   ██║  ██║ ██║ ███████║',
    '██╔═██║ ██║ ██║ ██║   ██║      ██║╚═╝██║ ██╔══╝   ██║  ██║ ██║ ██╔══██║',
    '██║ ██║ ╚████╔╝ ██║   ██║      ██║   ██║ ███████╗ ██████╔╝ ██║ ██║  ██║',
    '╚═╝ ╚═╝  ╚═══╝  ╚═╝   ╚═╝      ╚═╝   ╚═╝ ╚══════╝ ╚═════╝  ╚═╝ ╚═╝  ╚═╝'
  ];
};

const getWarningCommentText = (): string => {
  const lines = getWarningComments();
  return ` ─────────────────────────────────────────────────────────────────────────\n` +
         lines.join('\n') +
         `\n───────────────────────────────────────────────────────────────────────── `;
};

let observer: MutationObserver | null = null;

/**
 * Displays a warning in the Console tab.
 */
export function showConsoleWarning(): void {
  console.clear();
  console.log(
    `%c${ASCII_ART}`,
    'color: red; font-family: monospace; font-size: 11px; font-weight: bold; line-height: 1.2;'
  );
}

/**
 * Injects a hidden warning node at the beginning of the body tag.
 * This element is intended to be visible to users inspecting the DOM in the Elements tab.
 */
export function showElementsWarning(): void {
  if (typeof document === 'undefined' || !document.body) return;

  // 1. Ensure the div warning is there and has correct content
  let warningNode = document.getElementById(WARNING_ID);
  if (!warningNode) {
    warningNode = document.createElement('div');
    warningNode.id = WARNING_ID;
    warningNode.setAttribute('style', 'display: none;');
  }

  // Ensure the <pre> tag containing ASCII Art exists inside the div
  const expectedHTML = `<pre style="font-family: monospace; white-space: pre; line-height: 1.2;">\n${ASCII_ART}</pre>`;
  if (warningNode.innerHTML !== expectedHTML) {
    warningNode.innerHTML = expectedHTML;
  }

  // 2. Manage the single comment node for immediate visibility in Elements tab
  const commentText = getWarningCommentText();
  const childNodes = Array.from(document.body.childNodes);
  
  // Look for our comment node
  let ourCommentNode: Comment | null = null;
  for (const node of childNodes) {
    if (node.nodeType === Node.COMMENT_NODE && node.nodeValue === commentText) {
      ourCommentNode = node as Comment;
      break;
    }
  }

  // Check if our comment is the very first child of the body, and the warningNode is the second child
  const firstChild = document.body.firstChild;
  const secondChild = firstChild ? firstChild.nextSibling : null;

  const isCommentFirst = firstChild === ourCommentNode;
  const isDivSecond = secondChild === warningNode;

  if (!isCommentFirst || !isDivSecond) {
    // Remove all existing copies of our comment from the body to prevent duplicates
    for (const node of childNodes) {
      if (node.nodeType === Node.COMMENT_NODE && node.nodeValue === commentText) {
        document.body.removeChild(node);
      }
    }
    
    // Also detach warningNode temporarily if it is already in the body
    if (warningNode.parentNode === document.body) {
      document.body.removeChild(warningNode);
    }

    // Now insert them in correct order: warningNode first, then prepend the comment node
    const newCommentNode = document.createComment(commentText);
    document.body.prepend(warningNode);
    document.body.prepend(newCommentNode);
  }
}

/**
 * Removes the warning node and comment nodes from the DOM.
 */
export function hideElementsWarning(): void {
  if (typeof document === 'undefined') return;

  const warningNode = document.getElementById(WARNING_ID);
  if (warningNode && warningNode.parentNode) {
    warningNode.parentNode.removeChild(warningNode);
  }

  if (document.body) {
    const commentText = getWarningCommentText();
    const childNodes = Array.from(document.body.childNodes);
    for (const node of childNodes) {
      if (node.nodeType === Node.COMMENT_NODE && node.nodeValue === commentText) {
        document.body.removeChild(node);
      }
    }
  }
}

/**
 * Starts observing body modifications to ensure the warning element is not deleted or moved.
 */
const startObserving = (checkDevToolsStatus: () => boolean): void => {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !document.body) return;

  if (observer) {
    observer.disconnect();
  }

  const observeOptions = { childList: true, subtree: false };

  observer = new MutationObserver(() => {
    if (checkDevToolsStatus()) {
      const warningNode = document.getElementById(WARNING_ID);
      const commentText = getWarningCommentText();
      const firstChild = document.body.firstChild;
      const secondChild = firstChild ? firstChild.nextSibling : null;

      const isCommentFirst = firstChild && firstChild.nodeType === Node.COMMENT_NODE && firstChild.nodeValue === commentText;
      const isDivSecond = secondChild === warningNode;

      if (!isCommentFirst || !isDivSecond) {
        // Disconnect observer before making DOM changes to prevent infinite recursion
        observer?.disconnect();
        showElementsWarning();
        // Re-observe
        if (observer && document.body) {
          observer.observe(document.body, observeOptions);
        }
      }
    }
  });

  observer.observe(document.body, observeOptions);
};

/**
 * Stops observing body modifications.
 */
const stopObserving = (): void => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
};

/**
 * Initializes DevTools protection with custom options.
 * Returns a cleanup function to stop monitoring and remove DOM modifications.
 */
export function initDevToolsProtection(config?: DevToolsProtectionConfig): () => void {
  // SSR Safety check
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => {};
  }

  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  if (!mergedConfig.enabled) {
    return () => {};
  }

  let wasOpen = false;
  let intervalId: any = null;

  const check = (): boolean => {
    // Detect DevTools based on difference between outer and inner window dimensions
    const widthDiff = window.outerWidth - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;
    const isOpen = widthDiff > mergedConfig.threshold || heightDiff > mergedConfig.threshold;

    if (isOpen) {
      if (!wasOpen) {
        wasOpen = true;

        if (mergedConfig.showConsoleWarning) {
          showConsoleWarning();
        }

        if (mergedConfig.showElementsWarning) {
          showElementsWarning();
        }
      } else {
        // Keep checking and ensuring the element stays prepended if someone tried to bypass it
        if (mergedConfig.showElementsWarning) {
          const warningNode = document.getElementById(WARNING_ID);
          if (!warningNode || document.body.firstChild !== warningNode) {
            showElementsWarning();
          }
        }
      }
    } else {
      if (wasOpen) {
        wasOpen = false;
        if (mergedConfig.showElementsWarning && mergedConfig.removeElementWhenClosed) {
          hideElementsWarning();
        }
      }
    }

    return isOpen;
  };

  if (mergedConfig.showElementsWarning) {
    startObserving(check);
  }

  // Initial check on load
  check();

  // Polling check interval
  intervalId = setInterval(check, mergedConfig.intervalMs);

  // Return the cleanup function
  return () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
    stopObserving();
    if (mergedConfig.showElementsWarning) {
      hideElementsWarning();
    }
  };
}
