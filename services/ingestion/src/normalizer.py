"""
Content Normalizer
==================
Cleans, normalizes, and enriches raw ingested content.
Handles HTML stripping, encoding fixes, language detection,
and metadata extraction.
"""

from __future__ import annotations

import re
from typing import Any

from bs4 import BeautifulSoup
from deep_translator import GoogleTranslator
from langdetect import DetectorFactory, LangDetectException, detect

from .config import settings
from .logger import logger
from .models import IngestedItem

DetectorFactory.seed = 0


class ContentNormalizer:
    """Cleans and normalizes raw content for downstream processing."""

    # Common boilerplate patterns to remove
    BOILERPLATE_PATTERNS = [
        r"Subscribe to our newsletter.*",
        r"Sign up for.*",
        r"Follow us on.*",
        r"Share this article.*",
        r"Related articles?:?\s*$",
        r"More from.*",
        r"Advertisement\s*",
        r"Sponsored content\s*",
        r"Cookie\s*(policy|consent|notice).*",
        r"Copyright\s*©?\s*\d{4}.*",
        r"All rights reserved.*",
        r"Terms (of|and) (use|service|conditions).*",
        r"Privacy policy.*",
    ]

    # Financial/regulatory specific patterns to preserve
    PRESERVE_PATTERNS = [
        r"\b(SEC|CFTC|FINRA|OCC|FDIC|FinCEN|OFAC)\b",
        r"\b(tokeniz|securit|blockchain|DeFi|stablecoin|CBDC)\w*\b",
        r"\bRWA\b",
        r"\b\d+\.?\d*\s*(billion|million|trillion|bps|basis\s+points)\b",
        r"\$\d+[\d,.]*",
    ]

    def normalize(self, item: IngestedItem) -> IngestedItem:
        """
        Normalize an ingested item's content.

        Steps:
        1. Strip HTML tags (preserve structure)
        2. Fix encoding issues
        3. Remove boilerplate
        4. Normalize whitespace
        5. Extract structured data
        6. Update word count
        """
        raw = item.raw_content

        # Step 1: Strip HTML while preserving structure
        clean = self._strip_html(raw)

        # Step 2: Fix encoding
        clean = self._fix_encoding(clean)

        # Step 3: Remove boilerplate
        clean = self._remove_boilerplate(clean)

        # Step 4: Normalize whitespace
        clean = self._normalize_whitespace(clean)

        # Step 5: Truncate if needed
        if len(clean) > settings.max_content_length:
            clean = clean[:settings.max_content_length]
            logger.debug("content_truncated", title=item.title[:50])

        # Step 6: detect language and translate when configured
        detected_language = self._detect_language(item.title, clean)
        item.language = detected_language

        if settings.translate_to_english and detected_language != "en":
            translated = self._translate_to_english(clean)
            if translated:
                clean = translated

        # Update item
        item.clean_content = clean
        item.word_count = len(clean.split())

        return item

    def _strip_html(self, html: str) -> str:
        """Strip HTML tags while preserving meaningful structure."""
        if not html or "<" not in html:
            return html

        soup = BeautifulSoup(html, "lxml")

        # Remove script and style elements
        for element in soup(["script", "style", "nav", "footer", "aside", "iframe"]):
            element.decompose()

        # Remove hidden elements
        for element in soup.find_all(attrs={"style": re.compile(r"display:\s*none")}):
            element.decompose()
        for element in soup.find_all(attrs={"hidden": True}):
            element.decompose()

        # Get text with paragraph breaks
        lines = []
        for element in soup.find_all(["p", "h1", "h2", "h3", "h4", "li", "blockquote", "td"]):
            text = element.get_text(strip=True)
            if text:
                lines.append(text)

        if lines:
            return "\n\n".join(lines)

        # Fallback: just get all text
        return soup.get_text(separator="\n", strip=True)

    def _fix_encoding(self, text: str) -> str:
        """Fix common encoding issues."""
        replacements = {
            "\u2018": "'", "\u2019": "'",  # Smart quotes
            "\u201c": '"', "\u201d": '"',
            "\u2013": "-", "\u2014": "—",  # Dashes
            "\u2026": "...",  # Ellipsis
            "\u00a0": " ",  # Non-breaking space
            "\ufeff": "",  # BOM
            "\r\n": "\n",
            "\r": "\n",
        }
        for old, new in replacements.items():
            text = text.replace(old, new)
        return text

    def _remove_boilerplate(self, text: str) -> str:
        """Remove common boilerplate patterns."""
        for pattern in self.BOILERPLATE_PATTERNS:
            text = re.sub(pattern, "", text, flags=re.IGNORECASE | re.MULTILINE)
        return text

    def _normalize_whitespace(self, text: str) -> str:
        """Normalize whitespace while preserving paragraph breaks."""
        # Collapse multiple spaces
        text = re.sub(r"[^\S\n]+", " ", text)
        # Collapse multiple newlines (keep max 2)
        text = re.sub(r"\n{3,}", "\n\n", text)
        # Strip leading/trailing whitespace from lines
        lines = [line.strip() for line in text.splitlines()]
        text = "\n".join(lines)
        return text.strip()

    def _detect_language(self, title: str, text: str) -> str:
        sample = f"{title}\n{text[:1200]}".strip()
        if not sample:
            return "en"

        try:
            lang = detect(sample)
            if not lang:
                return "en"
            return lang.lower()
        except LangDetectException:
            return "en"
        except Exception:
            return "en"

    def _translate_to_english(self, text: str) -> str | None:
        source = text[: settings.translation_max_chars].strip()
        if not source:
            return None

        chunks = [
            source[i : i + settings.translation_chunk_size]
            for i in range(0, len(source), settings.translation_chunk_size)
        ]

        translated_chunks: list[str] = []
        translator = GoogleTranslator(source="auto", target="en")

        for chunk in chunks:
            try:
                translated_chunks.append(translator.translate(chunk))
            except Exception as exc:
                logger.warning("translation_chunk_failed", error=str(exc))
                return None

        return "\n\n".join(translated_chunks).strip() or None

    def batch_normalize(self, items: list[IngestedItem]) -> list[IngestedItem]:
        """Normalize a batch of items."""
        normalized = []
        for item in items:
            try:
                normalized.append(self.normalize(item))
            except Exception as e:
                logger.error(
                    "normalization_failed",
                    title=item.title[:50],
                    error=str(e),
                )
        logger.info("batch_normalized", count=len(normalized))
        return normalized


normalizer = ContentNormalizer()
