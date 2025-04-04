import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface DataTableColumn<T> {
  header: string;
  accessorKey: keyof T;
  cell?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  filterOptions?: {
    key: keyof T;
    options: { label: string; value: string }[];
    placeholder: string;
  };
  onSearch?: (query: string) => void;
  onFilter?: (value: string) => void;
  paginationOptions?: {
    pageIndex: number;
    pageSize: number;
    pageCount: number;
    onPageChange: (page: number) => void;
  };
}

export function DataTable<T>({
  columns,
  data,
  filterOptions,
  onSearch,
  onFilter,
  paginationOptions,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  const handleFilter = (value: string) => {
    if (onFilter) {
      onFilter(value);
    }
  };

  return (
    <div>
      {/* Filter controls */}
      {(filterOptions || onSearch) && (
        <div className="flex flex-col md:flex-row justify-between mb-4 gap-3">
          {filterOptions && (
            <div className="flex items-center">
              <label className="mr-2 text-sm">Show:</label>
              <Select onValueChange={handleFilter} defaultValue="">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={filterOptions.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  {filterOptions.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {onSearch && (
            <div className="relative w-full md:w-auto">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="material-icons text-gray-400 text-sm">search</span>
              </div>
              <Input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearch}
                className="pl-10"
              />
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.header as string}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-6">
                  No data found
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((column) => (
                    <TableCell key={`${rowIndex}-${column.header as string}`}>
                      {column.cell
                        ? column.cell(row)
                        : (row[column.accessorKey] as React.ReactNode)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {paginationOptions && (
        <div className="mt-4 flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Showing {paginationOptions.pageIndex * paginationOptions.pageSize + 1} to{" "}
            {Math.min(
              (paginationOptions.pageIndex + 1) * paginationOptions.pageSize,
              data.length
            )}{" "}
            of {data.length} entries
          </p>
          <div className="flex">
            <Button
              variant="outline"
              size="sm"
              onClick={() => paginationOptions.onPageChange(paginationOptions.pageIndex - 1)}
              disabled={paginationOptions.pageIndex === 0}
              className="rounded-r-none"
            >
              Previous
            </Button>
            {Array.from({ length: paginationOptions.pageCount }, (_, i) => (
              <Button
                key={i}
                variant={i === paginationOptions.pageIndex ? "default" : "outline"}
                size="sm"
                onClick={() => paginationOptions.onPageChange(i)}
                className="rounded-none border-x-0"
              >
                {i + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => paginationOptions.onPageChange(paginationOptions.pageIndex + 1)}
              disabled={
                paginationOptions.pageIndex === paginationOptions.pageCount - 1
              }
              className="rounded-l-none"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
