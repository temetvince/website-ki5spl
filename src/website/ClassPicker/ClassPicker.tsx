import './ClassPicker.css';

import { type ChangeEventHandler, useCallback } from 'react';

import { isLicenseClass } from '../../data/types';
import type ClassPickerProps from './ClassPickerProps';

/**
 * A segmented control for choosing a license class: one radio group whose
 * options sit side by side as buttons. Fully keyboard-operable through the
 * native radio inputs: arrow keys move the selection, and the chosen option
 * carries the page's focus ring. The selected segment is marked by a filled
 * accent background and by the native radio state, never by colour alone.
 * Controlled: it never changes selection on its own, only reports it.
 */
export default function ClassPicker(props: ClassPickerProps) {
  const { onChange } = props;
  const handleChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      const next = event.currentTarget.value;
      if (isLicenseClass(next)) {
        onChange(next);
      }
    },
    [onChange],
  );

  return (
    <fieldset className='class-picker'>
      <legend className='visually-hidden'>{props.legend}</legend>
      <div className='class-picker-options'>
        {props.options.map((option) => {
          const id = `${props.name}-${option.id}`;
          return (
            <div
              key={option.id}
              className='class-picker-option'
            >
              <input
                id={id}
                type='radio'
                name={props.name}
                value={option.id}
                checked={option.id === props.value}
                onChange={handleChange}
              />
              <label htmlFor={id}>{option.label}</label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
