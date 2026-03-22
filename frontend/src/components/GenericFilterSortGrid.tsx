import type { ReactNode } from "react";
import { z } from 'zod';

interface GenericFilterSortGridProps<T extends z.ZodObject> {
  schema: T
  data: z.infer<T>[];
  rowClickedCallback: (row: z.infer<T>) => void
}

/**
 * 
 * @param schema: A ZodObject representing the shape of the data.
 * @param data: The data to be tabulated.
 * @returns A table of data which can be sorted and filtered.
 */
export function GenericFilterSortGrid<T extends z.ZodObject>({ schema, data, rowClickedCallback }: GenericFilterSortGridProps<T>): ReactNode {

  const columns = Object.keys(schema.shape);

  return (
    <div className="overflow-x-auto m-5 rounded-lg border border-gray-200 shadow-sm">
      <table className="min-w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-100 border-b border-gray-300">
            {columns.map(col => (
              <th key={col} className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-r border-gray-200 last:border-r-0">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} onClick={() => rowClickedCallback(row)} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 even:bg-gray-50/50">
              {columns.map(col => (
                <td key={col} className="px-4 py-2 text-sm text-gray-600 border-r border-gray-200 last:border-r-0">
                  {String(row[col])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}