package com.example.demo.config;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

import java.io.IOException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

public class FlexibleLocalDateTimeDeserializer extends JsonDeserializer<LocalDateTime> {

    private static final DateTimeFormatter[] FORMATTERS = new DateTimeFormatter[] {
            DateTimeFormatter.ISO_DATE_TIME,
            DateTimeFormatter.ISO_LOCAL_DATE_TIME,
            DateTimeFormatter.ofPattern(yyyy-MM-dd'T'HH:mm:ss.SSSX),
            DateTimeFormatter.ofPattern(yyyy-MM-dd'T'HH:mm:ssX),
            DateTimeFormatter.ofPattern(yyyy-MM-dd'T'HH:mm:ss),
            DateTimeFormatter.ofPattern(yyyy-MM-dd'T'HH:mm),
            DateTimeFormatter.ofPattern(dd-MM-yyyy HH:mm:ss),
            DateTimeFormatter.ofPattern(dd-MM-yyyy HH:mm),
            DateTimeFormatter.ofPattern(yyyy-MM-dd HH:mm:ss),
            DateTimeFormatter.ofPattern(yyyy-MM-dd HH:mm)
    };

    @Override
    public LocalDateTime deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        String text = p.getText();
        if (text == null || text.isBlank()) {
            return null;
        }
        text = text.trim();

        try {
            return Instant.parse(text).atZone(ZoneId.systemDefault()).toLocalDateTime();
        } catch (Exception ignored) {
        }

        try {
            return OffsetDateTime.parse(text).toLocalDateTime();
        } catch (Exception ignored) {
        }

        try {
            return ZonedDateTime.parse(text).toLocalDateTime();
        } catch (Exception ignored) {
        }

        for (DateTimeFormatter formatter : FORMATTERS) {
            try {
                return LocalDateTime.parse(text, formatter);
            } catch (Exception ignored) {
            }
        }

        return LocalDateTime.parse(text);
    }
}
