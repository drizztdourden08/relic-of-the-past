/* @layer renderer-components @kind component */
import { Highlight } from 'prism-react-renderer';
import { Box } from '../../primitives/Box';
import { CODE_THEME } from './code-theme';
import './CodeBlock.css';
import type { CodeBlockProps } from './CodeBlock.type';

/** Highlighted, monospaced, horizontally-scrollable code panel. */
const CodeBlock = (props: CodeBlockProps) => {
  const { code, language, className = '' } = props;
  return (
    <Box className={`code-block${className ? ` ${className}` : ''}`}>
      <Highlight code={code.trimEnd()} language={language} theme={CODE_THEME}>
        {({ tokens, getLineProps, getTokenProps }) => (
          <Box as="pre" className="code-block__pre">
            <Box as="code" className="code-block__code">
              {tokens.map((line, lineIndex) => {
                const { className: lineClassName, style: lineStyle } = getLineProps({ line });
                return (
                  <Box
                    key={lineIndex}
                    as="div"
                    className={`code-block__line${lineClassName ? ` ${lineClassName}` : ''}`}
                    style={lineStyle}
                  >
                    {line.map((token, tokenIndex) => {
                      const { className: tokenClassName, style: tokenStyle, children } = getTokenProps({ token });
                      return (
                        <Box key={tokenIndex} as="span" className={tokenClassName} style={tokenStyle}>
                          {children}
                        </Box>
                      );
                    })}
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}
      </Highlight>
    </Box>
  );
};

export { CodeBlock };
