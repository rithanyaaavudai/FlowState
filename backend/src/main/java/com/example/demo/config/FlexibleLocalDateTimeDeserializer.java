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
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSX"),
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ssX"),
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss"),
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm"),
            DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss"),
            DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm"),
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"),
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")
    };

    @Override
    public LocalDateTime deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        if (p.currentToken() == com.fasterxml.jackson.core.JsonToken.VALUE_NUMBER_INT) {
            long epochMillis = p.getLongValue();
            return Instant.ofEpochMilli(epochMillis).atZone(ZoneId.systemDefault()).toLocalDateTime();
        }

        if (p.isExpectedStartArrayToken()) {
            int[] values = p.readValueAs(int[].class);
            if (values != null && values.length >= 3) {
                int year = values[0];
                int month = values[1];
                int day = values[2];
                int hour = values.length > 3 ? values[3] : 0;
                int minute = values.length > 4 ? values[4] : 0;
                int second = values.length > 5 ? values[5] : 0;
                return LocalDateTime.of(year, month, day, hour, minute, second);
            }
        }

        String text = p.getText();
        if (text == null || text.isBlank() || "null".equalsIgnoreCase(text.trim()) || "Invalid Date".equalsIgnoreCase(text.trim())) {
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

        try {
            long epoch = Long.parseLong(text);
            return Instant.ofEpochMilli(epoch).atZone(ZoneId.systemDefault()).toLocalDateTime();
        } catch (Exception ignored) {
        }

        return LocalDateTime.parse(text);
    }
}
