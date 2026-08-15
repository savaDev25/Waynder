package com.savadev25.waynder.utils;

import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.springframework.stereotype.Component;

// Strips ALL HTML/script markup from free-text fields before they're stored.
// React already escapes text on render, so this isn't the only thing standing
// between a scraped payload and an XSS attempt -- but relying on a single
// layer (the frontend never using dangerouslySetInnerHTML, forever) is
// fragile. This makes the stored data itself inert, regardless of how it's
// consumed later (this API, an admin dashboard, an export, etc).
@Component
public class InputSanitizer {

    /** Removes every tag, leaving plain text only -- correct for name/description/address. */
    public String stripHtml(String input) {
        if (input == null) {
            return null;
        }
        return Jsoup.clean(input, Safelist.none()).trim();
    }

    /**
     * Only allows http/https URLs. Rejects javascript:, data:, and other
     * schemes that are classic XSS vectors when later used as an <img src>
     * or <a href> on the frontend.
     */
    public boolean isSafeUrl(String url) {
        if (url == null || url.isBlank()) {
            return true; // absent is fine, callers decide if it's required
        }
        String lower = url.trim().toLowerCase();
        return lower.startsWith("http://") || lower.startsWith("https://");
    }
}