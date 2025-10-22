import { Fragment, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type RowData,
  type SortingState,
} from "@tanstack/react-table";
import ButtonGroup from "../ButtonGroup/ButtonGroup";
import Card from "../Card/Card";
import { observer } from "mobx-react-lite";
import { FiChevronUp } from "react-icons/fi";
import { type OrderStatus } from "../../stores/OrdersStore";
import { STATUS_OPTIONS } from "../../features/orders/OrdersPage";

export interface ExpandableTableColumn<T extends RowData, V = unknown> {
  id?: string;
  header: string;
  accessor: keyof T | ((row: T) => V);
  render?: (row: T) => React.ReactNode;
  enableSorting?: boolean;
}

export interface ExpandableTableProps<T extends RowData> {
  data: T[];
  columns: ExpandableTableColumn<T>[];
  renderExpanded?: (item: T) => React.ReactNode;
  renderActions?: (item: T) => React.ReactNode;
  keyField: keyof T;
  expandedId?: T[keyof T] | null;
}

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.95,
    },
  },
};

const fadeVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
  exit: { opacity: 0 },
};

const ExpandableTable = observer(
  <T extends RowData>({
    data,
    columns,
    renderExpanded,
    renderActions,
    keyField,
    expandedId,
  }: ExpandableTableProps<T>) => {
    const columnHelper = createColumnHelper<T>();
    const [sorting, setSorting] = useState<SortingState>([]);

    const tanstackColumns: ColumnDef<T, unknown>[] = columns.map((col, idx) => {
      const id =
        col.id ??
        (typeof col.accessor === "string"
          ? col.accessor
          : `col_${idx}_${col.header}`);

      return columnHelper.accessor(
        (row: T) =>
          typeof col.accessor === "function"
            ? col.accessor(row)
            : row[col.accessor],
        {
          id,
          header: col.header,
          cell: (info) => col.render?.(info.row.original) ?? info.getValue(),
          enableSorting: col.enableSorting ?? false,
          sortingFn: (rowA, rowB, columnId) => {
            const a = rowA.getValue(columnId);
            const b = rowB.getValue(columnId);

            if (
              columnId === "status" ||
              col.header.toLowerCase() === "status"
            ) {
              const indexA = STATUS_OPTIONS.indexOf(a as OrderStatus);
              const indexB = STATUS_OPTIONS.indexOf(b as OrderStatus);
              return indexA - indexB;
            }

            if (a == null && b == null) return 0;
            if (a == null) return -1;
            if (b == null) return 1;
            if (typeof a === "number" && typeof b === "number") return a - b;
            return String(a).localeCompare(String(b), "pl", {
              sensitivity: "base",
            });
          },
        }
      );
    });

    if (renderActions) {
      tanstackColumns.push(
        columnHelper.display({
          id: "actions",
          header: "Akcje",
          cell: (info) => renderActions(info.row.original),
        })
      );
    }

    const table = useReactTable({
      data,
      columns: tanstackColumns,
      state: { sorting },
      onSortingChange: setSorting,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
    });

    const sortedData = table.getSortedRowModel().rows.map((r) => r.original);

    return (
      <>
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full table-auto border-collapse border border-gray-200 dark:border-gray-700">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="bg-gray-100 dark:bg-gray-800 text-left"
                >
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={`px-3 py-2 border-b select-none ${
                        header.column.getCanSort() ? "cursor-pointer" : ""
                      }`}
                      onClick={
                        header.column.getCanSort()
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }
                    >
                      <span className="inline-flex items-center gap-1">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getIsSorted() && (
                          <motion.span
                            animate={{
                              rotate:
                                header.column.getIsSorted() === "asc" ? 0 : 180,
                            }}
                            transition={{ duration: 0.2 }}
                            className="inline-block"
                          >
                            <FiChevronUp />
                          </motion.span>
                        )}
                      </span>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <motion.tbody
              variants={fadeVariants}
              initial="hidden"
              animate="show"
              exit="hidden"
            >
              <AnimatePresence>
                {sortedData.map((item) => {
                  const id = item[keyField];
                  const row = table
                    .getRowModel()
                    .rows.find((r) => r.original[keyField] === id);

                  return (
                    <Fragment key={id as string | number}>
                      <motion.tr
                        layout
                        variants={fadeVariants}
                        initial="hidden"
                        animate="show"
                        exit="exit"
                        transition={{ duration: 0.3 }}
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        {row?.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-3 py-2">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </motion.tr>

                      {renderExpanded && expandedId === id && (
                        <tr>
                          <td
                            colSpan={row?.getVisibleCells().length}
                            className="p-0"
                          >
                            <motion.div
                              variants={fadeVariants}
                              initial="hidden"
                              animate="show"
                              exit="exit"
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden p-2 bg-gray-50 dark:bg-gray-600"
                            >
                              {renderExpanded(item)}
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </AnimatePresence>
            </motion.tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <motion.div
          className="block md:hidden space-y-2"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {sortedData.map((item) => {
            const id = item[keyField];
            const title = columns[0]?.render?.(item) || "";

            return (
              <motion.div
                key={id as string | number}
                variants={fadeVariants}
                layout
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <Card title={title as string} className="w-full">
                  {columns.slice(1).map((col, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between mb-1 min-w-0"
                    >
                      <span className="font-semibold text-gray-700 dark:text-gray-200 truncate">
                        {col.header}:
                      </span>
                      <div className="max-w-[65%] overflow-x-auto">
                        <span
                          className="whitespace-nowrap truncate block"
                          title={
                            typeof col.render?.(item) === "string"
                              ? (col.render(item) as string)
                              : undefined
                          }
                        >
                          {col.render?.(item)}
                        </span>
                      </div>
                    </div>
                  ))}

                  {renderActions && (
                    <div className="mt-2 overflow-x-auto">
                      <ButtonGroup align="right" className="flex-nowrap">
                        {renderActions(item)}
                      </ButtonGroup>
                    </div>
                  )}

                  {renderExpanded && expandedId === id && (
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="show"
                      exit="exit"
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
        </motion.div>
      </>
    );
  }
);

export default ExpandableTable;
