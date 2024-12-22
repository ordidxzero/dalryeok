import { describe, it, expect } from "vitest";
import { DateTime, DateTimeRange } from "../utils/date";

describe("DateTime Class", () => {
    const testDate = new DateTime("2024-12-22 10:00:00");

    it("should format the date correctly", () => {
        expect(testDate.format("YYYY-MM-DD")).toBe("2024-12-22");
        expect(testDate.format("HH:mm:ss")).toBe("10:00:00");
    });

    it("should calculate differences correctly", () => {
        const earlierDate = new DateTime("2024-12-20 10:00:00");
        expect(testDate.diff(earlierDate, "days")).toBe(-2);
        expect(testDate.diff(earlierDate, "hours")).toBe(-48);
    });

    it("should add time correctly", () => {
        const addedDate = testDate.add(3, "days");
        expect(addedDate.format("YYYY-MM-DD")).toBe("2024-12-25");
    });

    it("should correctly compare two dates", () => {
        const sameDate = new DateTime("2024-12-22 10:00:00");
        const earlierDate = new DateTime("2024-12-21 10:00:00");
        const laterDate = new DateTime("2024-12-23 10:00:00");

        expect(testDate.isEqual(sameDate)).toBe(true);
        expect(testDate.isBefore(earlierDate)).toBe(false);
        expect(testDate.isAfter(laterDate)).toBe(false);
    });

    it("should handle time zones correctly", () => {
        const seoulTime = testDate.add(9, "hours");
        expect(seoulTime.format("YYYY-MM-DD HH:mm:ss")).toBe("2024-12-22 19:00:00");

        const nyTime = testDate.add(-5, "hours");
        expect(nyTime.format("YYYY-MM-DD HH:mm:ss")).toBe("2024-12-22 05:00:00");
    });
});

describe("DateTimeRange Class", () => {
    const startDate = new DateTime("2024-12-20 00:00:00");
    const endDate = new DateTime("2024-12-25 00:00:00");
    const range = new DateTimeRange(startDate, endDate);

    it("should return the correct start and end dates", () => {
        expect(range.startDate.format("YYYY-MM-DD")).toBe("2024-12-20");
        expect(range.endDate.format("YYYY-MM-DD")).toBe("2024-12-25");
    });

    it("should correctly calculate all dates within the range", () => {
        const dates = range.datetimes.map((d) => d.format("YYYY-MM-DD"));
        expect(dates).toEqual(["2024-12-20", "2024-12-21", "2024-12-22", "2024-12-23", "2024-12-24"]);
    });

    it("should detect overlapping ranges", () => {
        const overlappingRange = new DateTimeRange(
            new DateTime("2024-12-24 00:00:00"),
            new DateTime("2024-12-26 00:00:00")
        );
        const nonOverlappingRange = new DateTimeRange(
            new DateTime("2024-12-26 00:00:00"),
            new DateTime("2024-12-30 00:00:00")
        );

        expect(range.isOverlap(overlappingRange)).toBe(true);
        expect(range.isOverlap(nonOverlappingRange)).toBe(false);
    });

    it("should handle edge cases for overlaps", () => {
        const closedRange = new DateTimeRange(
            new DateTime("2024-12-25 00:00:00"),
            new DateTime("2024-12-30 00:00:00")
        );

        expect(range.isOverlap(closedRange, "closed")).toBe(true);
        expect(range.isOverlap(closedRange, "open")).toBe(false);
    });

    it("should handle empty ranges correctly", () => {
        const emptyRange = new DateTimeRange(startDate, startDate);
        expect(emptyRange.datetimes.length).toBe(0);
    });

    it("should throw errors for invalid ranges", () => {
        expect(() => new DateTimeRange(endDate, startDate)).toThrowError("End date must be after start date");
    });

    it("should handle leap years", () => {
        const leapYearStart = new DateTime("2024-02-28 00:00:00");
        const leapYearEnd = new DateTime("2024-03-01 00:00:00");
        const leapYearRange = new DateTimeRange(leapYearStart, leapYearEnd);

        const dates = leapYearRange.datetimes.map((d) => d.format("YYYY-MM-DD"));
        expect(dates).toEqual(["2024-02-28", "2024-02-29"]);
    });
});