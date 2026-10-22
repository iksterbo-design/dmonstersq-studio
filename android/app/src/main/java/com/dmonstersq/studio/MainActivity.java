package com.dmonstersq.studio;

import android.Manifest;
import android.annotation.SuppressLint;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.webkit.WebViewAssetLoader;
import androidx.webkit.WebViewClientCompat;

/**
 * D MONSTERS Q STUDIO — Android shell.
 *
 * The entire studio is a single-page web app (index.html + worklets.js) shipped in
 * assets/www. It is served through WebViewAssetLoader over
 * https://appassets.androidplatform.net/ so the page runs in a *secure context*:
 * that is what makes AudioWorklet, getUserMedia (mic recording) and the service
 * worker all behave the same as on the web.
 *
 * There is no INTERNET permission — nothing ever leaves the device.
 */
public class MainActivity extends AppCompatActivity {

    private static final String START_URL =
            "https://appassets.androidplatform.net/assets/www/index.html";
    private static final int MIC_REQ = 4711;

    private WebView web;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        final WebViewAssetLoader loader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        web = new WebView(this);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        // Web Audio must be allowed to start without a user gesture on some devices
        s.setMediaPlaybackRequiresUserGesture(false);
        // we serve everything from the asset loader; no file:// or content:// access needed
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        s.setSupportZoom(false);

        web.setWebViewClient(new WebViewClientCompat() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                return loader.shouldInterceptRequest(request.getUrl());
            }
        });

        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        boolean wantsMic = false;
                        for (String res : request.getResources()) {
                            if (PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(res)) wantsMic = true;
                        }
                        if (!wantsMic) {
                            request.deny();
                            return;
                        }
                        if (ContextCompat.checkSelfPermission(MainActivity.this,
                                Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) {
                            request.grant(new String[]{ PermissionRequest.RESOURCE_AUDIO_CAPTURE });
                        } else {
                            ActivityCompat.requestPermissions(MainActivity.this,
                                    new String[]{ Manifest.permission.RECORD_AUDIO }, MIC_REQ);
                            request.deny();   // page re-requests after the grant + reload below
                        }
                    }
                });
            }
        });

        setContentView(web);
        web.loadUrl(START_URL);
    }

    @Override
    public void onRequestPermissionsResult(int code, @NonNull String[] perms, @NonNull int[] results) {
        super.onRequestPermissionsResult(code, perms, results);
        if (code == MIC_REQ && web != null) {
            // Reload so the recorder can request a fresh PermissionRequest now that we're granted.
            web.reload();
        }
    }

    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        if (web != null && web.canGoBack()) {
            web.goBack();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (web != null) web.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (web != null) web.onResume();
    }

    @Override
    protected void onDestroy() {
        if (web != null) {
            web.loadUrl("about:blank");
            web.destroy();
            web = null;
        }
        super.onDestroy();
    }
}
