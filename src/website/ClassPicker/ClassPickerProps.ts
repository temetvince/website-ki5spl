import type { LicenseClass } from '../../data/types';

/**
 * Contract for {@link ClassPicker}.
 */
export default interface ClassPickerProps {
  /**
   * Accessible name for the radio group. It is read to assistive technology
   * and not shown, so it must make sense on its own.
   */
  readonly legend: string;
  /**
   * The radio group's `name`. Also prefixes each input's id, so it must be
   * unique on the page.
   */
  readonly name: string;
  /**
   * Choices in display order. Each `id` must be distinct; it is the input's
   * value and React key. Labels should be short: they sit side by side.
   */
  readonly options: readonly {
    readonly id: LicenseClass;
    readonly label: string;
  }[];
  /** The option currently selected. Must be the `id` of one of `options`. */
  readonly value: LicenseClass;
  /** Called with the newly selected option's `id` whenever it changes. */
  readonly onChange: (value: LicenseClass) => void;
}
