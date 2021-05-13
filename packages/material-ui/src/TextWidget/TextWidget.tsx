import React from "react";

import TextField, {
  StandardTextFieldProps as TextFieldProps,
} from "@material-ui/core/TextField";

import { WidgetProps, utils } from "@rjsf/core";

const { getDisplayLabel } = utils;

export type TextWidgetProps = WidgetProps & Pick<TextFieldProps, Exclude<keyof TextFieldProps, 'onBlur' | 'onFocus'>>;

const TextWidget = ({
  id,
  placeholder,
  required,
  readonly,
  disabled,
  type,
  label,
  value,
  onChange,
  onBlur,
  onFocus,
  autofocus,
  options,
  schema,
  uiSchema,
  rawErrors = [],
  formContext,
  ...textFieldProps
}: TextWidgetProps) => {
  const _onChange = ({
    target: { value },
  }: React.ChangeEvent<HTMLInputElement>) =>
    onChange(value === "" ? options.emptyValue : value);
  const _onBlur = async ({ target: { value } }: React.FocusEvent<HTMLInputElement>) => {
   debugger;
   const regex = /.*_issns_[0-9]+/
   if (id.match(regex)){
     console.log(`matched issn: ${id}`)
     try {
       const r = await fetch(`https://api.crossref.org/journals/${value}`)
       console.log(r)
       const journal: any = await r.json();
       console.log(journal)
       if (r && journal.message.title) {
         const setTitle = confirm(`Do you want to set the title to ${journal.message.title}?`)
         if (setTitle){
           const event = new CustomEvent('setTitle', {
             detail: journal.message.title
           });
           window.dispatchEvent(event);
         }
       }
     }
     catch (e) {
       console.log(e)
     }
   }
   console.log(id)
    console.log('blurrr')
    onBlur(id, value);
  }
  const _onFocus = ({
    target: { value },
  }: React.FocusEvent<HTMLInputElement>) => onFocus(id, value);

  const displayLabel = getDisplayLabel(
    schema,
    uiSchema
    /* TODO: , rootSchema */
  );
  const inputType = (type || schema.type) === 'string' ?  'text' : `${type || schema.type}`

  return (
    <TextField
      id={id}
      placeholder={placeholder}
      label={displayLabel ? label || schema.title : false}
      autoFocus={autofocus}
      required={required}
      disabled={disabled || readonly}
      type={inputType as string}
      value={value || value === 0 ? value : ""}
      error={rawErrors.length > 0}
      onChange={_onChange}
      onBlur={_onBlur}
      onFocus={_onFocus}
      {...(textFieldProps as TextFieldProps)}
    />
  );
};

export default TextWidget;
