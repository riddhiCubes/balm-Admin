import FileNotFound from '@/assets/svg/FileNotFound';
import { AdaptiveCard, Container, TableRowSkeleton } from '@/components/shared';
import { Card, Input, Pagination, Select, Table, Tooltip } from '@/components/ui';
import Sorter from '@/components/ui/Table/Sorter';
import TBody from '@/components/ui/Table/TBody';
import Td from '@/components/ui/Table/Td';
import Th from '@/components/ui/Table/Th';
import THead from '@/components/ui/Table/THead';
import Tr from '@/components/ui/Table/Tr';
import { getsubscriberslist } from '@/Service/ApiService';
import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react'
import { TbEye, TbSearch } from 'react-icons/tb';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDebounce } from 'use-debounce';

type Option = {
  value: number
  label: string
}

const options: Option[] = [
  { value: 10, label: '10 / page' },
  { value: 25, label: '25 / page' },
  { value: 50, label: '50 / page' },
  { value: 100, label: '100 / page' },
];

const Subscribers = () => {
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const [pageCount, setPageCount] = useState<any>();
  const [searchParams, setSearchParams] = useSearchParams();
  const pageNo = Number(searchParams.get("page")) || 1;
  const searchTerm = searchParams.get("search") || "";
  const [sorting, setSorting] = useState<any>([]);
  const [loader, setLoader] = useState(false);
  const [subscribersData, setSubscribersData] = useState<any>([]);
  const [pageSize, setPageSize] = useState(options[0].value);
  const [value] = useDebounce(searchTerm, 1000);

  const onPaginationChange = (page: number) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev.toString());
      newParams.set("page", page.toString());
      return newParams;
    });
  };

  const handleSearch = (e: any) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev.toString());
      newParams.set("search", e.target.value);
      newParams.set("page", "1");
      return newParams;
    });
  };

  const onPageSelect = ({ value }: Option) => {
    setPageSize(value)
  };

  const getSubscribersUser = () => {
    setLoader(true);

    let obj: any = {
      page: pageNo,
      limit: pageSize,
    };

    if (searchTerm) {
      obj.search = searchTerm;
    };

    getsubscriberslist(obj)
      .then((res) => {
        const data = res?.data?.data;
        const total_pages = res?.data?.pagination?.totalPages;
        setSubscribersData(data);
        setPageCount(total_pages);
        setLoader(false);
      }).catch((err) => {
        setLoader(false);
      })
  };

  useEffect(() => {
    getSubscribersUser();
  }, [pageNo, pageSize, value]);

  const handleView = (item: any) => {
    // navigate("/admin/userdetails", { state: item });
    navigate(`/admin/userdetails/${item?.users?.id}`);
  };

  const columns = [
    {
      header: "Id",
      accessorKey: "id",
    },
    {
      header: "FUll name",
      accessorKey: "name",
      enableSorting: true,
      cell: ({ row }: { row: any }) => {
        const user = row.original;
        return (
          <div className="w-36 tranate">
            {user?.users?.name}
          </div>
        );
      },
    },
    {
      header: "Email",
      accessorKey: "email",
      enableSorting: true,
      cell: ({ row }: { row: any }) => {
        const user = row.original;
        return (
          <div className="">
            {user?.users?.email}
          </div>
        );
      },
    },
    {
      header: "Premium",
      enableSorting: true,
      accessorFn: (row: any) => row?.subscription_plan || "-",
      cell: ({ row }: { row: any }) => {
        const data = row.original;
        return (
          <div className="capitalize">
            <span>{data?.subscription_plan ? data?.subscription_plan : "-"}</span>
          </div>
        );
      },
    },
    {
      header: "startdate",
      accessorKey: "startdate",
      enableSorting: false,
      cell: ({ row }: { row: any }) => {
        const date = row.original.start_date;
        return date ? moment(date).format("DD MMM, YYYY") : "-";
      },
    },
    {
      header: "enddate",
      accessorKey: "enddate",
      enableSorting: false,
      cell: ({ row }: { row: any }) => {
        const date = row.original.end_date;
        return date ? moment(date).format("DD MMM, YYYY") : "-";
      },
    },
    {
      header: "status",
      enableSorting: false,
      cell: ({ row }: { row: any }) => {
        const data = row.original;
        return (
          <div className="">
            {data?.is_expire ? (
              <div className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md text-sm font-semibold w-20 flex items-center justify-center">
                Expired
              </div>
            ) : (
              <div className="bg-green-100 text-green-700 px-3 py-1.5 rounded-md text-sm font-semibold w-20 flex items-center justify-center">
                Active
              </div>
            )}
          </div>
        );
      },
    },
    {
      header: "Action",
      accessorKey: "action",
      cell: ({ row }: { row: any }) => {
        const data = row?.original;
        return (
          <div className="flex gap-3.5">
            <Tooltip title="View">
              <div className="cursor-pointer select-none font-semibold" role="button"
                onClick={(row) => handleView(data)}
              >
                <TbEye className="text-xl" />
              </div>
            </Tooltip>
          </div>
        );
      },
      enableSorting: false,
    },
  ];

  const table = useReactTable({
    data: subscribersData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Container>
      <AdaptiveCard>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <h3>Subscribers</h3>
          <div className='md:mb-0 mb-3'>
            <Input
              ref={inputRef}
              value={searchTerm}
              suffix={<TbSearch className="text-lg" />}
              placeholder="Search by Full name,Email..."
              onChange={(e: any) => handleSearch(e)}
              className='md:w-72 w-full'
            />
          </div>
        </div>

        <Card className='mt-5'>
          <div className="flex flex-col gap-4">
            <div>
              <Table className="table-auto w-full">
                <THead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <Tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <Th key={header.id} className="cursor-pointer">
                            <div className="flex items-center">
                              {/* Render header content correctly using flexRender */}
                              {header.isPlaceholder ? null : (
                                <div
                                  {...{
                                    className: `flex items-center ${['startdate', 'enddate', 'status', 'action'].includes(header.column.id) ? 'pointer-events-none' : 'cursor-pointer select-none'}`,
                                    onClick: ['startdate', 'enddate', 'status', 'action'].includes(header.column.id)
                                      ? undefined
                                      : header.column.getToggleSortingHandler(),
                                  }}
                                >
                                  <p className="text-sm">
                                    {flexRender(
                                      header.column.columnDef.header,
                                      header.getContext()
                                    )}
                                  </p>
                                  {!['startdate', 'enddate', 'status', 'action'].includes(header.column.id) && <Sorter sort={header.column.getIsSorted()} />}
                                </div>
                              )}
                            </div>
                          </Th>
                        );
                      })}
                    </Tr>
                  ))}
                </THead>
                {loader === true ? (
                  <TableRowSkeleton
                    columns={columns.length}
                  />
                ) : (
                  <TBody>
                    {loader === false && subscribersData?.length <= 0 ? (
                      <Tr className="h-[50vh]">
                        <Td
                          className="hover:bg-transparent"
                          colSpan={columns.length}
                        >
                          <div className="flex flex-col items-center gap-4">
                            <FileNotFound />
                            <span className="font-semibold">
                              No data found!
                            </span>
                          </div>
                        </Td>
                      </Tr>
                    ) : (
                      table
                        .getRowModel()
                        .rows
                        .map((row) => (
                          <Tr key={row.id}>
                            {row.getVisibleCells().map((cell) => (
                              <Td key={cell.id}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </Td>
                            ))}
                          </Tr>
                        ))
                    )}
                  </TBody>
                )}
              </Table>
              {loader === false && subscribersData?.length > 0 && (
                <div className='flex items-center justify-between '>
                  <Pagination
                    className="mt-4 "
                    currentPage={pageNo}
                    total={pageCount}
                    onChange={onPaginationChange}
                  />
                  <Select
                    className='w-32'
                    size="sm"
                    menuPlacement="top"
                    isSearchable={false}
                    defaultValue={options.find(option => option.value === pageSize)}
                    options={options}
                    onChange={selected => onPageSelect(selected as Option)}
                  />
                </div>
              )}
            </div>
          </div>
        </Card>
      </AdaptiveCard>
    </Container>
  )
}

export default Subscribers
