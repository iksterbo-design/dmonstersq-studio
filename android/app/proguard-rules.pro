# Keep the WebView bridge surface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keep class androidx.webkit.** { *; }
