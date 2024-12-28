import { DateTime } from './date';

type EntryPriority = 0 | 1 | 2 | 3 | 4 | 5;
type EntryType = 'TASK' | 'EVENT' | 'SLOT';
type EntryStatus = 'Default' | 'Inbox' | 'Someday' | 'Deleted';

export interface EntryConfig {
  id: string;
  title: string;
  description: string;
  review?: string;
  startDate?: DateTime;
  endDate?: DateTime;
  deadline?: DateTime;
  allDay: boolean;
  completed: boolean;
  tags: string[];
  priority: EntryPriority;
  type: EntryType;
  status: EntryStatus;
}

/**
 * 일정, 할일 등을 나타내는 클래스
 */
export class Entry implements EntryConfig {
  private _config: EntryConfig;

  constructor(config: EntryConfig) {
    this._config = config;
  }

  /**
   * Entry를 업데이트하는 기능을 제공합니다.
   * @param config - Entry에 필요한 정보
   */
  update(config: Partial<EntryConfig>) {
    return new Entry({ ...this._config, ...config });
  }

  /**
   * Entry의 고유한 아이디
   */
  get id() {
    return this._config.id;
  }

  /**
   * Entry의 제목
   */
  get title() {
    return this._config.title;
  }

  /**
   * Entry에 대한 설명
   */
  get description() {
    return this._config.description;
  }

  /**
   * Entry를 완료한 후 후기
   */
  get review() {
    return this._config.review;
  }

  /**
   * Entry를 시작하는 날짜 및 시간
   */
  get startDate() {
    return this._config.startDate;
  }

  /**
   * Entry를 끝내는 날짜 및 시간
   */
  get endDate() {
    return this._config.endDate;
  }

  /**
   * Entry가 하루종일 지속되는 것인지 여부
   */
  get allDay() {
    return this._config.allDay;
  }

  /**
   * Entry 마감 날짜 및 시간
   */
  get deadline() {
    return this._config.deadline;
  }

  /**
   * Entry를 완료했는지 여부
   */
  get completed() {
    return this._config.completed;
  }

  /**
   * Entry에 달린 태그들
   */
  get tags() {
    return this._config.tags;
  }

  /**
   * Entry 우선순위
   */
  get priority() {
    return this._config.priority;
  }

  /**
   * Entry가 일정, 할 일, Slot 중 어떤 것인지 표시.
   * Slot이란 비어있는 시간을 설정하는 것을 의미.
   */
  get type() {
    return this._config.type;
  }

  /**
   * Entry 상태. Default, Inbox, Someday, Deleted가 있다.
   */
  get status() {
    return this._config.status;
  }
}
