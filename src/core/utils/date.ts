import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { DateTimeUnit } from "./types";

dayjs.extend(utc)

/**
 * 구간을 나타내는 클래스
 */
export class DateTimeRange {
    private _start: DateTime;
    private _end: DateTime;
    private _dates: DateTime[] = [];

    /**
     * 
     * @param start - 구간의 시작을 나타내는 DateTime 객체
     * @param end - 구간의 마지막을 나타내는 DateTime 객체
     */
    constructor(start: DateTime, end: DateTime) {
        if (start.isAfter(end)) {
            throw Error("End date must be after start date")
        }
        this._start = start;
        this._end = end;
    }

    /**
     * 구간의 시작
     */
    get startDate(): DateTime {
        return this._start;
    }

    /**
     * 구간의 끝
     */
    get endDate(): DateTime {
        return this._end;
    }

    /**
     * 구간 사이의 모든 날짜
     */
    get datetimes(): DateTime[] {
        if (this._dates.length === 0) {
            const diff = this._start.diff(this._end, 'days')
            this._dates = Array.from({ length: diff }, (_, i) => this._start.add(i, 'days'))
        }
        return this._dates
    }

    /**
     * 두 DateTimeRange가 겹치는지 계산하는 기능을 제공합니다.
     * @param range - 특정 구간
     * @param interval - 동일한 날짜인 경우 포함할지 여부. open인 경우, 동일한 날짜는 포함하지 않습니다.
     */
    isOverlap(range: DateTimeRange, interval: 'open' | 'closed' = 'open'): boolean {
        return this._start.isBetween(range, interval) || this._end.isBetween(range, interval)
    }
}

export class DateTime {
    date: dayjs.Dayjs
    utcOffset: number;
    constructor(date?: dayjs.ConfigType) {
        const _date = dayjs(date).startOf("minute")

        this.utcOffset = _date.utcOffset()
        this.date = _date.utc()
    }

    _view() {
        return this.date.add(this.utcOffset / 60, 'hour')
    }

    /**
     * DateTime 객체를 문자열로 변경하는 기능을 제공합니다.
     * @param {string} template - [dayjs의 format 문법](https://day.js.org/docs/en/display/format)을 사용한 문자열
     */
    format(template: string = "YYYY-MM-DD"): string {
        return this._view().format(template)
    }

    /**
     * DateTime 간의 차이를 계산하는 기능을 제공합니다.
     * @param datetime - 비교 대상이 될 DateTime 객체
     * @param unit - 시간 단위
     */
    diff(datetime: DateTime, unit: DateTimeUnit = 'seconds'): number {
        return this.date.diff(datetime.date, unit) * -1
    }

    /**
     * DateTime 객체의 값을 변경하여 새로운 DateTime을 반환하는 기능을 제공합니다.
     * @param value - 변경하고 싶은 정도
     * @param unit - 변경하려는 시간 단위
     */
    add(value: number, unit?: DateTimeUnit): DateTime {
        const date = this._view().add(value, unit)
        return new DateTime(date)
    }

    /**
     * 두 DateTime가 같은지 계산하는 기능을 제공합니다.
     * @param datetime - 비교 대상이 될 DateTime 객체
     */
    isEqual(datetime: DateTime): boolean {
        return this.date.isSame(datetime.date)
    }

    /**
     * DateTime 인스턴스가 인자로 받은 DateTime보다 이전에 있는 날짜인지 계산하는 기능을 제공합니다.
     * @param datetime - 비교 대상이 될 DateTime 객체
     * @param interval - 동일한 날짜인 경우 포함할지 여부. open인 경우, 동일한 날짜는 포함하지 않습니다.
     */
    isBefore(datetime: DateTime, interval: 'open' | 'closed' = 'open'): boolean {
        if (interval === 'open') {
            return this.date.isBefore(datetime.date)
        }
        return this.isEqual(datetime) || this.isBefore(datetime)
    }

    /**
     * DateTime 인스턴스가 인자로 받은 DateTime보다 이후에 있는 날짜인지 계산하는 기능을 제공합니다.
     * @param datetime - 비교 대상이 될 DateTime 객체
     * @param interval - 동일한 날짜인 경우 포함할지 여부. open인 경우, 동일한 날짜는 포함하지 않습니다.
     */
    isAfter(datetime: DateTime, interval: 'open' | 'closed' = 'open'): boolean {
        if (interval === 'open') {
            return this.date.isAfter(datetime.date)
        }
        return this.isEqual(datetime) || this.isAfter(datetime)
    }

    /**
     * DateTime 인스턴스가 특정 구간 사이에 있는 날짜인지 계산하는 기능을 제공합니다.
     * @param range - 특정 구간
     * @param interval - 동일한 날짜인 경우 포함할지 여부. open인 경우, 동일한 날짜는 포함하지 않습니다.
     */
    isBetween(range: DateTimeRange, interval: 'open' | 'closed' = 'open'): boolean {
        return this.isAfter(range.startDate, interval) && this.isBefore(range.endDate, interval)
    }

    /**
     * DateTime 인스턴스가 포함된 구간을 반환하는 기능을 제공합니다.
     * @param unit - 구간을 나타내는 시간 단위
     * @returns {DateTimeRange}
     */
    range(unit: Extract<DateTimeUnit, 'weeks' | 'months' | 'years'>): DateTimeRange {
        const startDate = new DateTime(this._view().startOf(unit).startOf("day"))
        const endDate = new DateTime(this._view().endOf(unit).startOf("day"))
        return new DateTimeRange(startDate, endDate)
    }
}