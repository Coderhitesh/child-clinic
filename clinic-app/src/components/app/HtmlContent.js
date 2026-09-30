import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { Loader } from '../ui/States';
import { colors } from '../../lib/theme';

/**
 * CMS content is HTML, so it is rendered in a WebView with the app's own typography
 * injected. The WebView sizes itself by posting its height back, which keeps the
 * article inside the normal scroll view instead of a nested scroller.
 */
const wrap = (html) => `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
    <style>
      :root { color-scheme: light; }
      body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 15.5px;
        line-height: 1.65;
        color: ${colors.inkSoft};
        background: transparent;
        -webkit-text-size-adjust: 100%;
      }
      h1, h2, h3, h4 { color: ${colors.ink}; line-height: 1.3; margin: 22px 0 10px; }
      h1 { font-size: 22px; } h2 { font-size: 19px; } h3 { font-size: 17px; }
      p { margin: 0 0 14px; }
      a { color: ${colors.brand700}; text-decoration: none; }
      ul, ol { padding-left: 20px; margin: 0 0 14px; }
      li { margin-bottom: 6px; }
      img, video, iframe { max-width: 100%; height: auto; border-radius: 12px; }
      blockquote {
        margin: 0 0 14px; padding: 10px 14px;
        border-left: 3px solid ${colors.brand300};
        background: ${colors.brand50}; border-radius: 8px;
      }
      table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
      th, td { border: 1px solid ${colors.border}; padding: 8px; text-align: left; font-size: 14px; }
      code, pre { background: ${colors.bg}; border-radius: 6px; padding: 2px 5px; font-size: 13px; }
    </style>
  </head>
  <body>
    ${html || ''}
    <script>
      const post = () => window.ReactNativeWebView.postMessage(String(document.body.scrollHeight));
      window.addEventListener('load', post);
      new ResizeObserver(post).observe(document.body);
      post();
    </script>
  </body>
</html>`;

export default function HtmlContent({ html, style }) {
  const [height, setHeight] = useState(120);

  return (
    <View style={[{ height }, style]}>
      <WebView
        originWhitelist={['*']}
        source={{ html: wrap(html) }}
        style={styles.web}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        startInLoadingState
        renderLoading={() => <Loader />}
        onMessage={(e) => {
          const h = Number(e.nativeEvent.data);
          if (h && Math.abs(h - height) > 4) setHeight(h + 16);
        }}
        // links open in the system browser rather than replacing the article
        onShouldStartLoadWithRequest={(req) => req.url === 'about:blank' || req.url.startsWith('data:')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  web: { flex: 1, backgroundColor: 'transparent' },
});
