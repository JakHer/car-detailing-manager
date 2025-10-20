import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import Card from "../Card/Card";

export interface ExpandableTableColumn<T> {
  header: string;
  render: (_item: T) => React.ReactNode;
}

export interface ExpandableTableProps<T> {
  data: T[];
  columns: ExpandableTableColumn<T>[];
  renderExpanded?: (_item: T) => React.ReactNode;
  renderActions?: (_item: T) => React.ReactNode;
  keyField: keyof T;
  expandedId?: T[keyof T] | null;
}

export default function ExpandableTable<T>({
  data,
  columns,
  renderExpanded,
  renderActions,
  keyField,
  expandedId,
}: ExpandableTableProps<T>) {
  return (
    <div>
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full table-auto border-collapse border border-gray-200 dark:border-gray-700">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800 text-left">
              {columns.map((col, idx) => (
                <th key={idx} className="px-3 py-2 border-b">
                  {col.header}
                </th>
              ))}
              {(renderExpanded || renderActions) && (
                <th className="px-3 py-2 border-b">Akcje</th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => {
              const id = item[keyField];
              return (
                <React.Fragment key={id as string | number}>
                  <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                    {columns.map((col, idx) => (
                      <td
                        key={idx}
                        className="px-3 py-2 whitespace-nowrap overflow-hidden truncate"
                        title={
                          typeof col.render(item) === "string"
                            ? (col.render(item) as string)
                            : undefined
                        }
                      >
                        {col.render(item)}
                      </td>
                    ))}
                    {(renderExpanded || renderActions) && (
                      <td className="px-3 py-2">
                        {renderActions && renderActions(item)}
                      </td>
                    )}
                  </tr>

                  {renderExpanded && expandedId === id && (
                    <tr>
                      <td colSpan={columns.length + 1} className="p-0">
                        <AnimatePresence>
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="overflow-hidden p-2 bg-gray-50 dark:bg-gray-700"
                          >
                            {renderExpanded(item)}
                          </motion.div>
                        </AnimatePresence>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="block md:hidden space-y-2">
        {data.map((item) => {
          const id = item[keyField];
          const title = columns[0]?.render(item) || "";
          return (
            <motion.div
              key={id as string | number}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card title={title as string} className="w-full ">
                {columns.slice(1).map((col, idx) => (
                  <div key={idx} className="flex justify-between mb-1">
                    <span className="font-semibold text-gray-700 dark:text-gray-200">
                      {col.header}:
                    </span>
                    <div className="max-w-[65%] overflow-x-auto">
                      <span
                        className="whitespace-nowrap"
                        title={
                          typeof col.render(item) === "string"
                            ? (col.render(item) as string)
                            : undefined
                        }
                      >
                        {col.render(item)}
                      </span>
                    </div>
                  </div>
                ))}

                {renderActions && (
                  <div className="mt-2">{renderActions(item)}</div>
                )}

                {renderExpanded && expandedId === id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-2"
                  >
                    {renderExpanded(item)}
                  </motion.div>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
