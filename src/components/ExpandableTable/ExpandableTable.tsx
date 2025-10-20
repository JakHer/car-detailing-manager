import React from "react";
import { AnimatePresence, motion } from "framer-motion";

export interface ExpandableTableColumn<T> {
  header: string;
  render: (item: T) => React.ReactNode;
}

export interface ExpandableTableProps<T> {
  data: T[];
  columns: ExpandableTableColumn<T>[];
  renderExpanded?: (item: T) => React.ReactNode;
  renderActions?: (item: T) => React.ReactNode;
  keyField: keyof T;
  expandedId?: T[keyof T] | null;
  setExpandedId?: (id: T[keyof T] | null) => void;
}

export default function ExpandableTable<T>({
  data,
  columns,
  renderExpanded,
  renderActions,
  keyField,
  expandedId,
  setExpandedId,
}: ExpandableTableProps<T>) {
  const toggleExpand = (id: T[keyof T]) => {
    if (!setExpandedId) return;
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="overflow-x-auto">
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
                    <td key={idx} className="px-3 py-2">
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
  );
}
