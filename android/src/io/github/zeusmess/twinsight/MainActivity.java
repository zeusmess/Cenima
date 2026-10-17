package io.github.zeusmess.twinsight;

import android.app.Activity;
import android.content.Intent;
import android.content.res.AssetManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.DisplayCutout;
import android.view.View;
import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.window.OnBackInvokedDispatcher;

import java.io.IOException;
import java.io.InputStream;
import java.util.Collections;
import java.util.Locale;

/**
 * Twinsight runs as a web page in a full-screen WebView. The page and its fonts ship in the APK's
 * assets and are served from a private https origin, so the game works offline and keeps its saves.
 */
public class MainActivity extends Activity {
    private static final String HOST = "appassets.androidplatform.net";
    private static final String HOME = "https://" + HOST + "/index.html";

    private WebView web;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        Window window = getWindow();
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        if (Build.VERSION.SDK_INT >= 28) Api28.drawIntoCutout(window);

        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.BLACK);
        // Keep the game clear of camera cutouts; the cutout strip stays black.
        root.setOnApplyWindowInsetsListener((v, insets) -> {
            int[] c = Build.VERSION.SDK_INT >= 30 ? Api30.cutout(insets)
                    : Build.VERSION.SDK_INT >= 28 ? Api28.cutout(insets) : new int[4];
            v.setPadding(c[0], c[1], c[2], c[3]);
            return insets;
        });

        web = new WebView(this);
        web.setBackgroundColor(Color.BLACK);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setTextZoom(100);
        web.setWebViewClient(new AssetClient(getAssets()));
        // The only page this WebView ever loads is the game from the APK, so the bridge is not exposed to other sites.
        web.addJavascriptInterface(new ShareBridge(this), "TwinsightAndroid");
        root.addView(web, new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));
        setContentView(root);
        hideSystemBars();

        web.loadUrl(HOME);
        web.requestFocus();
        if (Build.VERSION.SDK_INT >= 33) Api33.registerBack(this);
    }

    /** Lets the game close its own screens first; leaves the app when the game is on its main menu. */
    void handleBack() {
        web.evaluateJavascript("window.__twinsightBack ? window.__twinsightBack() : false", handled -> {
            if (!"true".equals(handled)) finish();
        });
    }

    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        handleBack();
    }

    @Override
    protected void onPause() {
        web.evaluateJavascript("window.__twinsightPause && window.__twinsightPause()", null);
        web.onPause();
        super.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        web.onResume();
        hideSystemBars();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) hideSystemBars();
    }

    @Override
    protected void onDestroy() {
        if (web != null) web.destroy();
        super.onDestroy();
    }

    @SuppressWarnings("deprecation")
    private void hideSystemBars() {
        if (Build.VERSION.SDK_INT >= 30) {
            Api30.hideBars(getWindow());
        } else {
            getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                    | View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                    | View.SYSTEM_UI_FLAG_LAYOUT_STABLE | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                    | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION);
        }
    }

    /** Lets the game open Android's share sheet with a shootout result (WebView has no Web Share API). */
    private static final class ShareBridge {
        private final Activity activity;

        ShareBridge(Activity activity) {
            this.activity = activity;
        }

        @JavascriptInterface
        public void share(String text) {
            if (text == null || text.isEmpty()) return;
            final String body = text.length() > 1000 ? text.substring(0, 1000) : text;
            activity.runOnUiThread(() -> {
                Intent send = new Intent(Intent.ACTION_SEND);
                send.setType("text/plain");
                send.putExtra(Intent.EXTRA_TEXT, body);
                try {
                    activity.startActivity(Intent.createChooser(send, null));
                } catch (RuntimeException e) {
                    // No app can share text: nothing to do.
                }
            });
        }
    }

    /** Serves the game files from the APK assets under https://appassets.androidplatform.net/. */
    private static final class AssetClient extends WebViewClient {
        private final AssetManager assets;

        AssetClient(AssetManager assets) {
            this.assets = assets;
        }

        @Override
        public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
            Uri url = request.getUrl();
            if (!HOST.equals(url.getHost())) return null;
            String path = url.getPath();
            if (path == null || path.isEmpty() || path.equals("/")) path = "/index.html";
            String mime = mimeOf(path);
            try {
                InputStream in = assets.open(path.substring(1));
                return new WebResourceResponse(mime, mime.startsWith("font/") || mime.startsWith("image/") ? null : "utf-8", in);
            } catch (IOException e) {
                return new WebResourceResponse("text/plain", "utf-8", 404, "Not Found", Collections.emptyMap(), null);
            }
        }

        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            return !HOST.equals(request.getUrl().getHost());
        }

        private static String mimeOf(String path) {
            String p = path.toLowerCase(Locale.ROOT);
            if (p.endsWith(".html")) return "text/html";
            if (p.endsWith(".css")) return "text/css";
            if (p.endsWith(".js")) return "application/javascript";
            if (p.endsWith(".woff2")) return "font/woff2";
            if (p.endsWith(".png")) return "image/png";
            if (p.endsWith(".svg")) return "image/svg+xml";
            if (p.endsWith(".json")) return "application/json";
            return "text/plain";
        }
    }

    // Newer platform calls live in their own classes so older Android versions never load them.

    private static final class Api28 {
        static void drawIntoCutout(Window window) {
            WindowManager.LayoutParams lp = window.getAttributes();
            lp.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            window.setAttributes(lp);
        }

        static int[] cutout(WindowInsets insets) {
            DisplayCutout c = insets.getDisplayCutout();
            if (c == null) return new int[4];
            return new int[] {c.getSafeInsetLeft(), c.getSafeInsetTop(), c.getSafeInsetRight(), c.getSafeInsetBottom()};
        }
    }

    private static final class Api30 {
        static void hideBars(Window window) {
            window.setDecorFitsSystemWindows(false);
            WindowInsetsController c = window.getInsetsController();
            if (c == null) return;
            c.hide(WindowInsets.Type.statusBars() | WindowInsets.Type.navigationBars());
            c.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
        }

        static int[] cutout(WindowInsets insets) {
            android.graphics.Insets c = insets.getInsets(WindowInsets.Type.displayCutout());
            return new int[] {c.left, c.top, c.right, c.bottom};
        }
    }

    private static final class Api33 {
        static void registerBack(MainActivity activity) {
            activity.getOnBackInvokedDispatcher().registerOnBackInvokedCallback(
                    OnBackInvokedDispatcher.PRIORITY_DEFAULT, activity::handleBack);
        }
    }
}
