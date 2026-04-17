import { useCallback, useEffect, useState, type ReactNode } from "react";
import { z, type output } from 'zod';
import { toastService } from "../../toastService";
import { ListFilterPlus } from "lucide-react";

interface GenericFilterSortGridProps<T extends z.ZodObject> {
  schema: T
  data: z.infer<T>[];
  rowClickedCallback: (row: z.infer<T>) => void
}

/**
 * @param schema: A ZodObject representing the shape of the data.
 * @param data: The data to be tabulated.
 * @returns A table of data which can be sorted and filtered.
 */
export function GenericFilterSortGrid<T extends z.ZodObject>({ schema, data, rowClickedCallback }: GenericFilterSortGridProps<T>): ReactNode {

  // do the parse and log if it failed
  const parseAndHandle = useCallback((schema: T, data: output<T>[]) => {
    try {
      return data.map((x: output<T>) => {
        return schema.parse(x)
      })
    } catch (error) {
      toastService.showError("Couldn't parse data: ", String(error))
      console.log(error)
    }
  }, [])

  // state
  const [sortedData, setSortedData] = useState(parseAndHandle(schema, data));
  const [colSortStates, setColSortStates] = useState(
    Object.fromEntries(
      Object.keys(schema.shape).map(key => [key, true])
    )
  )

  // set data on change
  useEffect(() => {
    setSortedData(parseAndHandle(schema, data))
  }, [parseAndHandle, schema, data])

  // compare two elements for sorting the table data
  function comparerForSort<T>(
    a: output<T>,
    b: output<T>,
    colName: keyof typeof schema.shape,
    sortFlip: boolean
  ): number {
    const fieldSchema = schema.shape[colName];
    // @ts-expect-error: we don't know type at compile 
    const aVal = fieldSchema.parse(a[colName]);
    // @ts-expect-error: we don't know type at compile 
    const bVal = fieldSchema.parse(b[colName]);
    if (aVal < bVal) return sortFlip ? -1 : 1;
    else return sortFlip ? 1 : -1;
  }

  // sort column and flip sort state
  const colHeaderClicked = (colName: keyof typeof schema.shape) => {
    setSortedData(sortedData =>
      [...(sortedData ?? [])].sort((a, b) =>
        comparerForSort(a, b, colName, colSortStates[colName])
      )
    );
    setColSortStates(prev => ({
      ...prev,
      [colName]: !prev[colName],
    }));
  };

  // sort column and flip sort state
  const colHeaderFilterIconClicked = (colName: keyof typeof schema.shape) => {
    console.log("todo implement filter", colName)
  };

  return (
    <div className="overflow-x-auto m-5 rounded-lg border border-gray-200 shadow-sm">
      <table className="min-w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-100 border-b border-gray-300">
            {Object.entries(schema.shape).map(([colName, _]: [colName: string, _: z.ZodObject]) => (
              <th key={colName} onClick={() => colHeaderClicked(colName)} className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-r border-gray-200 last:border-r-0 group">
                <div className="flex flex-row">
                  {colName}
                  <div className="invisible group-hover:visible" onClick={() => colHeaderFilterIconClicked(colName)}>
                    <ListFilterPlus className="h-5" />
                  </div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData && sortedData.map((row, i) => (
            <tr key={i} onClick={() => rowClickedCallback(row)} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-200 even:bg-gray-50/50">
              {Object.entries(schema.shape).map(([colName, _]: [colName: string, _: z.ZodObject]) => (
                <td key={colName} className="px-4 py-2 text-sm text-gray-600 border-r border-gray-200 last:border-r-0">
                  {String(row[colName])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}