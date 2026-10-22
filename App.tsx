import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import type { WebViewNavigation } from 'react-native-webview';

const HOME_URL = 'https://www.google.com';
const SEARCH_URL = 'https://www.google.com/search?q=';

const MOBILE_UA = undefined; // default Android WebView user agent
const DESKTOP_UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) ' +
  'Chrome/124.0.0.0 Safari/537.36';

/**
 * Turns whatever was typed into a URL:
 *  - "https://example.com"  -> opened as is
 *  - "example.com/page"     -> https://example.com/page
 *  - "cute cat videos"      -> Google search
 */
function toUrl(input: string): string {
  const text = input.trim();
  if (!text) {
    return HOME_URL;
  }
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(text)) {
    return text;
  }
  const looksLikeHost =
    !/\s/.test(text) &&
    (/^[^\s]+\.[a-z]{2,}(\/.*)?$/i.test(text) ||
      /^localhost(:\d+)?/i.test(text) ||
      /^\d{1,3}(\.\d{1,3}){3}(:\d+)?/.test(text));
  if (looksLikeHost) {
    return 'https://' + text;
  }
  return SEARCH_URL + encodeURIComponent(text);
}

type ButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  active?: boolean;
};

// Big, high-contrast buttons so the D-pad focus is easy to see on a TV.
function Button({ label, onPress, disabled, active }: ButtonProps) {
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      focusable={!disabled}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={[
        styles.button,
        active && styles.buttonActive,
        focused && styles.buttonFocused,
        disabled && styles.buttonDisabled,
      ]}
    >
      <Text style={[styles.buttonText, focused && styles.buttonTextFocused]}>{label}</Text>
    </Pressable>
  );
}

export default function App() {
  const webRef = useRef<React.ComponentRef<typeof WebView>>(null);
  const [url, setUrl] = useState(HOME_URL);
  const [address, setAddress] = useState(HOME_URL);
  const [inputFocused, setInputFocused] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [loading, setLoading] = useState(false);
  const [desktopMode, setDesktopMode] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  const go = useCallback((text: string) => {
    const target = toUrl(text);
    setAddress(target);
    setUrl(target);
  }, []);

  // Remote / phone back button: go back in page history, exit only when there is none left.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack) {
        webRef.current?.goBack();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [canGoBack]);

  const onNavigationStateChange = (nav: WebViewNavigation) => {
    setCanGoBack(nav.canGoBack);
    setCanGoForward(nav.canGoForward);
    setLoading(nav.loading);
    if (!inputFocused && nav.url) {
      setAddress(nav.url);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar hidden />
      <View style={styles.toolbar}>
        <Button label="◀" onPress={() => webRef.current?.goBack()} disabled={!canGoBack} />
        <Button label="▶" onPress={() => webRef.current?.goForward()} disabled={!canGoForward} />
        <Button label="⟳" onPress={() => webRef.current?.reload()} />
        <Button label="⌂" onPress={() => go(HOME_URL)} />
        <TextInput
          style={[styles.input, inputFocused && styles.inputFocused]}
          value={address}
          onChangeText={setAddress}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          onSubmitEditing={() => go(address)}
          placeholder="Search Google or type a web address"
          placeholderTextColor="#8a8f98"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          returnKeyType="go"
          selectTextOnFocus
        />
        <Button label="Go" onPress={() => go(address)} />
        <Button
          label={desktopMode ? 'Desktop' : 'Mobile'}
          active={desktopMode}
          onPress={() => {
            setDesktopMode(d => !d);
            setReloadKey(k => k + 1);
          }}
        />
      </View>
      {loading ? <View style={styles.loadingBar} /> : <View style={styles.loadingBarIdle} />}
      <WebView
        key={reloadKey}
        ref={webRef}
        style={styles.web}
        source={{ uri: url }}
        userAgent={desktopMode ? DESKTOP_UA : MOBILE_UA}
        javaScriptEnabled
        domStorageEnabled
        thirdPartyCookiesEnabled
        sharedCookiesEnabled
        allowsFullscreenVideo
        mediaPlaybackRequiresUserAction={false}
        mixedContentMode="always"
        setSupportMultipleWindows={false}
        onNavigationStateChange={onNavigationStateChange}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0e1116' },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    backgroundColor: '#161b22',
  },
  button: {
    minWidth: 52,
    height: 46,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#262d38',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  buttonActive: { backgroundColor: '#1f4e8c' },
  buttonFocused: { backgroundColor: '#ffffff', borderColor: '#4da3ff' },
  buttonDisabled: { opacity: 0.35 },
  buttonText: { color: '#e6edf3', fontSize: 18, fontWeight: '600' },
  buttonTextFocused: { color: '#0e1116' },
  input: {
    flex: 1,
    height: 46,
    paddingHorizontal: 14,
    borderRadius: 10,
    fontSize: 18,
    color: '#e6edf3',
    backgroundColor: '#0e1116',
    borderWidth: 2,
    borderColor: '#262d38',
  },
  inputFocused: { borderColor: '#4da3ff' },
  loadingBar: { height: 3, backgroundColor: '#4da3ff' },
  loadingBarIdle: { height: 3, backgroundColor: 'transparent' },
  web: { flex: 1, backgroundColor: '#ffffff' },
});
