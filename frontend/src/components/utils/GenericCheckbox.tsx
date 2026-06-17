import type { CSSProperties } from "react";

type GenericCheckboxProps = {
  checked: boolean;
  setChecked: (x: boolean) => void;
  style: CSSProperties
}


export default function GenericCheckbox({ checked, setChecked, style }: GenericCheckboxProps) {
  return (
    <label className="inline flex items-center rounded-3xl gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => setChecked(e.currentTarget.checked)}
        className="cursor-pointer"
        style={style}
      />
    </label>
  );
}
