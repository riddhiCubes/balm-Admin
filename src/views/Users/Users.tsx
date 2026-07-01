import { AdaptiveCard, ConfirmDialog, Container, TableRowSkeleton } from '@/components/shared';
import { Button, Card, Dialog, Form, FormItem, Input, Notification, Pagination, Select, Table, toast, Tooltip } from '@/components/ui';
import Sorter from '@/components/ui/Table/Sorter';
import TBody from '@/components/ui/Table/TBody';
import Td from '@/components/ui/Table/Td';
import Th from '@/components/ui/Table/Th';
import THead from '@/components/ui/Table/THead';
import Tr from '@/components/ui/Table/Tr';
import { getuserblocklist, getuserlist, userblockunblock, userdelete } from '@/Service/ApiService';
import { zodResolver } from '@hookform/resolvers/zod';
import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { CgUnblock } from 'react-icons/cg';
import { MdBlock } from 'react-icons/md';
import { TbEye, TbSearch, TbTrash } from 'react-icons/tb';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { z, ZodType } from 'zod';
import { useDebounce } from 'use-debounce';
import FileNotFound from '@/assets/svg/FileNotFound';

type FormSchema = {
    reason: string
};

const validationSchema: ZodType<FormSchema> = z.object({
    reason: z.string().min(1, { message: 'Reason Required' }),
});

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

const filterOption = [
    { value: "all", label: "All" },
    { value: "premium", label: "Premium" },
];

const Users = () => {
    const navigate = useNavigate();
    const [pageCount, setPageCount] = useState<any>();
    const [dialogIsOpen, setDialogIsOpen] = useState(false);
    const [unBlockIsOpen, setUnBlockIsOpen] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<any>(null);
    const [actionType, setActionType] = useState<any>("");
    const [sorting, setSorting] = useState<any>([]);
    const [searchParams, setSearchParams] = useSearchParams();
    const pageNo = Number(searchParams.get("page")) || 1;
    const searchTerm = searchParams.get("search") || "";
    const filteruserFromQuery = searchParams.get('filter') || filterOption[0].value;
    const [value] = useDebounce(searchTerm, 1000);
    const [loader, setLoader] = useState(false);
    const [userData, setUserData] = useState<any>([]);
    const [pending, setPending] = useState(false);
    const [typeParams] = useSearchParams();
    const filterFromQuery = typeParams.get('type');
    const [pageSize, setPageSize] = useState(options[0].value);

    const getUserData = () => {
        setLoader(true);
        let obj: any = {
            page: pageNo,
            limit: pageSize
        };

        if (searchTerm) {
            obj.search = searchTerm
        };

        if (filteruserFromQuery) {
            obj.filter = filteruserFromQuery;
        }

        if (filterFromQuery) {
            getuserblocklist(obj)
                .then((res) => {
                    const data = res?.data?.data;
                    const total_pages = res?.data?.pagination?.totalPages;
                    setUserData(data);
                    setPageCount(total_pages);
                    setLoader(false);
                }).catch((err) => {
                    setLoader(false);
                })
        } else {
            getuserlist(obj)
                .then((res) => {
                    const data = res?.data?.data;
                    const total_pages = res?.data?.pagination?.totalPages;
                    setUserData(data);
                    setPageCount(total_pages);
                    setLoader(false);
                }).catch((err) => {
                    setLoader(false);
                })
        }
    };

    useEffect(() => {
        getUserData();
    }, [pageNo, pageSize, value, filterFromQuery, filteruserFromQuery]);

    const onPageSelect = ({ value }: Option) => {
        setPageSize(value)
    };

    const onFilter = (selected: any) => {
        setSearchParams((prev) => {
            const newParams = new URLSearchParams(prev.toString());
            if (selected) {
                newParams.set("filter", selected?.value);
                newParams.set("page", '1');
            } else {
                newParams.set("filter", '');
            }
            return newParams;
        })
    };

    const handleBlock = (item: any) => {
        setSelectedUserId(item?.id);
        setActionType("block");
        setDialogIsOpen(true);
    };

    const handleDelete = (item: any) => {
        setSelectedUserId(item?.id);
        setActionType("delete");
        setDeleteDialog(true);
    };

    const onDialogClose = () => {
        reset();
        setDialogIsOpen(false);
        setUnBlockIsOpen(false);
        setPending(false);
    };

    const DeleteDialogClose = () => {
        reset();
        setDeleteDialog(false);
        setPending(false);
    };

    const handleUnBlock = (item: any) => {
        setUnBlockIsOpen(true);
        setSelectedUserId(item?.id);
    };

    const handleConfirmUnBlock = () => {
        setPending(true);

        const body = {
            user_id: selectedUserId,
        };

        userblockunblock(body)
            .then((res) => {
                if (res?.status === 200) {
                    const successmsg = res?.data?.message;
                    // toast.success(successmsg || "User Block Sucessfully");
                    toast.push(
                        <Notification type='success'>{successmsg || "User UnBlock Sucessfully"}</Notification>,
                        { placement: "top-end" }
                    )
                    getUserData();
                }
                onDialogClose();
                reset();
            }).catch((err) => {
                const errormsg = err?.response?.data?.message;
                toast.push(
                    <Notification type='danger'>{errormsg || "User not found!"}</Notification>,
                    { placement: "top-end" }
                )
                setPending(false);
            })
    };

    const {
        handleSubmit,
        reset,
        formState: { errors },
        control
    } = useForm<FormSchema>({
        defaultValues: {
            reason: '',
        },
        resolver: zodResolver(validationSchema),
    });

    const onSubmit = (values: FormSchema) => {
        setPending(true);

        if (actionType === "block") {
            const body = {
                user_id: selectedUserId,
                reason: values?.reason,
            };

            userblockunblock(body)
                .then((res) => {
                    if (res?.status === 200) {
                        const successmsg = res?.data?.message;
                        // toast.success(successmsg || "User Block Sucessfully");
                        toast.push(
                            <Notification type='success'>{successmsg || "User Block Sucessfully"}</Notification>,
                            { placement: "top-end" }
                        )
                        getUserData();
                    }
                    onDialogClose();
                    reset();
                }).catch((err) => {
                    const errormsg = err?.response?.data?.message;
                    toast.push(
                        <Notification type='danger'>{errormsg || "User not found!"}</Notification>,
                        { placement: "top-end" }
                    );
                    setPending(false);
                })

        } else if (actionType === "delete") {
            const body = {
                user_id: selectedUserId,
                reason: values?.reason
            };

            userdelete(body)
                .then((res) => {
                    // console.log(res, "response");
                    if (res?.status === 200) {
                        const successmsg = res?.data?.message;
                        toast.push(
                            <Notification type='success'>{successmsg || "User Delete Sucessfully"}</Notification>,
                            { placement: "top-end" }
                        )
                        getUserData();
                    }
                    DeleteDialogClose();
                    reset();
                }).catch((err) => {
                    const errormsg = err?.response?.data?.message;
                    toast.push(
                        <Notification type='danger'>{errormsg || "User not found!"}</Notification>,
                        { placement: "top-end" }
                    );
                    setPending(false);
                })
        }
    };

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

    const handleView = (item: any) => {
        // navigate("/admin/userdetails", { state: item });
        navigate(`/admin/userdetails/${item?.id}`);
    };

    const columns = [
        {
            header: "Id",
            accessorKey: "id",
        },
        {
            header: "Full Name",
            accessorKey: "name",
            enableSorting: true,
            cell: ({ row }: { row: any }) => {
                const user = row.original;
                return (
                    <div className="w-36 tranate">
                        {user?.name}
                    </div>
                );
            },
        },
        {
            header: "Email",
            accessorKey: "email",
            enableSorting: true,
        },
        {
            header: "Premium",
            // accessorKey: "premium_plan",
            enableSorting: true,
            accessorFn: (row: any) => row?.isPremium ? row?.premium_plan : "-",
            cell: ({ row }: { row: any }) => {
                const data = row.original;
                return (
                    <div className="capitalize">
                        <span>{data?.isPremium ? data?.premium_plan : "-"}</span>
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
                        <Tooltip title={`${data?.isBlock ? "UnBlock" : "Block"}`}>
                            <div className="text-xl cursor-pointer select-none font-semibold" role="button"
                                onClick={() => {
                                    if (data?.isBlock) {
                                        handleUnBlock(data)
                                    } else {
                                        handleBlock(data);
                                    }
                                }}
                            >
                                {data?.isBlock ? <CgUnblock size={22} /> : <MdBlock size={20} />}
                            </div>
                        </Tooltip>
                        <Tooltip title="Delete">
                            <div className="text-xl cursor-pointer select-none font-semibold" role="button"
                                onClick={() => handleDelete(data)}
                            >
                                <TbTrash className="text-red-400" />
                            </div>
                        </Tooltip>
                    </div>
                );
            },
            enableSorting: false,
        },
    ];

    const table = useReactTable({
        data: userData,
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <>
            <Container>
                <AdaptiveCard>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <h3>Users</h3>
                        <div className='flex sm:flex-row flex-col items-center gap-2'>
                            <Select
                                size="md"
                                className='md:w-52 w-full'
                                isSearchable={false}
                                value={filterOption.find(option => option.value === filteruserFromQuery)}
                                options={filterOption}
                                onChange={(selected) => onFilter(selected as any)}
                            />
                            <Input
                                value={searchTerm}
                                suffix={<TbSearch className="text-lg" />}
                                placeholder="Search by User Full name,Email..."
                                className='md:w-72 w-full'
                                onChange={handleSearch}
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
                                                                            className: `flex items-center ${['premium', 'action'].includes(header.column.id) ? 'pointer-events-none' : 'cursor-pointer select-none'}`,
                                                                            onClick: ['premium', 'action'].includes(header.column.id)
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
                                                                        {!['premium', 'action'].includes(header.column.id) && <Sorter sort={header.column.getIsSorted()} />}
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
                                        // <div className="h-[70vh]">
                                        //     <Loading loading={loader} />
                                        // </div>
                                        <TableRowSkeleton
                                            // rows={10}
                                            columns={columns.length}
                                        />
                                    ) :
                                        // loader === false && userData?.length <= 0 ? (
                                        //     // <div className='h-[70vh] flex items-center justify-center'><p className="text-lg p-2 text-center"> No Data Found </p></div>
                                        //     <TBody>
                                        //         <Tr>
                                        //             <Td colSpan={columns.length}>
                                        //                 <div className="h-[55vh] flex items-center justify-center">
                                        //                     <p className="text-lg text-center">No Data Found</p>
                                        //                 </div>
                                        //             </Td>
                                        //         </Tr>
                                        //     </TBody>
                                        // ) :
                                        (
                                            <TBody>
                                                {loader === false && userData?.length <= 0 ? (
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
                                {loader === false && userData?.length > 0 && (
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

            <Dialog
                isOpen={dialogIsOpen}
                onClose={onDialogClose}
                onRequestClose={onDialogClose}
                closable={false}
            >
                <div className='mb-4'>
                    <h5 className=''>Block User</h5>
                    <p>Are you sure you want to Block this user? This action
                        can&apos;t be undo.</p>
                </div>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <FormItem
                        label="Reason"
                        invalid={Boolean(errors.reason)}
                        errorMessage={errors.reason?.message}
                    >
                        <Controller
                            name="reason"
                            control={control}
                            render={({ field }) =>
                                <Input
                                    type="text"
                                    textArea
                                    autoComplete="off"
                                    placeholder="Enter Reason..."
                                    {...field}
                                />
                            }
                        />
                    </FormItem>
                    <FormItem className='flex items-end w-full mb-0'>
                        <Button
                            type="button"
                            className="ltr:mr-2 rtl:ml-2 w-24"
                            onClick={() => onDialogClose()}
                        >
                            Cancel
                        </Button>
                        <Button disabled={pending} loading={pending} variant="solid" type="submit" className='w-24'>
                            Block
                        </Button>
                    </FormItem>
                </Form>
            </Dialog>

            <Dialog
                isOpen={deleteDialog}
                onClose={DeleteDialogClose}
                onRequestClose={DeleteDialogClose}
                closable={false}
            >
                <div className='mb-4'>
                    <h5 className=''>Delete User</h5>
                    <p>Are you sure you want to Delete this user? This action
                        can&apos;t be undo.</p>
                </div>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <FormItem
                        label="Reason"
                        invalid={Boolean(errors.reason)}
                        errorMessage={errors.reason?.message}
                    >
                        <Controller
                            name="reason"
                            control={control}
                            render={({ field }) =>
                                <Input
                                    type="text"
                                    textArea
                                    autoComplete="off"
                                    placeholder="Enter Reason..."
                                    {...field}
                                />
                            }
                        />
                    </FormItem>
                    <FormItem className='flex items-end w-full mb-0'>
                        <Button
                            type="button"
                            className="ltr:mr-2 rtl:ml-2 w-24"
                            onClick={() => DeleteDialogClose()}
                        >
                            Cancel
                        </Button>
                        <Button disabled={pending} loading={pending} variant="solid" type="submit" className='w-24 bg-red-500 text-white hover:bg-red-600'>
                            Delete
                        </Button>
                    </FormItem>
                </Form>
            </Dialog>

            <ConfirmDialog
                isOpen={unBlockIsOpen}
                closable={false}
                type="danger"
                title="UnBlock User"
                onClose={onDialogClose}
                onRequestClose={onDialogClose}
                onCancel={onDialogClose}
                onConfirm={handleConfirmUnBlock}
                confirmButtonProps={{
                    loading: pending,
                    disabled: pending
                }}
            >
                <p>
                    {' '}
                    Are you sure you want to UnBlock this user? This action
                    can&apos;t be undo.{' '}
                </p>
            </ConfirmDialog>
        </>
    );
};

export default Users;
