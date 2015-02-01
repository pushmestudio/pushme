/**
 * Copyright (c)PushMe Studio 2015
 */

package jp.pushme;

import android.os.Bundle;
import org.apache.cordova.*;

import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.content.Intent;
import android.net.Uri;
import android.util.*;

public class PushMe extends CordovaActivity
{
    @Override
    public void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);
        WebView webView = new WebView(this);
        setContentView(webView);
        webView.getSettings().setJavaScriptEnabled(true);
        webView.addJavascriptInterface(new JSHandler(), "Bridge"); // set JSHandler to Javascript as "Bridge"

        webView.loadUrl("file:///android_asset/www/index.html");
    }

    public class JSHandler {
        @JavascriptInterface
        public void shareText(String txt) {
            Intent intent = new Intent(Intent.ACTION_SEND);
            intent.setType("text/plain");
            intent.putExtra(Intent.EXTRA_TEXT, txt);
            startActivity(intent);
        }
    }

}
