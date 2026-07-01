import { AdaptiveCard, ConfirmDialog, Container, TableRowSkeleton } from '@/components/shared';
import { Button, Card, Checkbox, Dialog, Form, FormItem, Input, Notification, Pagination, Select, Skeleton, Table, toast, Tooltip } from '@/components/ui';
import Sorter from '@/components/ui/Table/Sorter';
import TBody from '@/components/ui/Table/TBody';
import Td from '@/components/ui/Table/Td';
import Th from '@/components/ui/Table/Th';
import THead from '@/components/ui/Table/THead';
import Tr from '@/components/ui/Table/Tr';
import { zodResolver } from '@hookform/resolvers/zod';
import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form';
import { TbSearch } from 'react-icons/tb';
import { LuPencil, LuTrash2 } from 'react-icons/lu';
import { z, ZodType } from 'zod';
import Avatar from '@/components/ui/Avatar/Avatar';
import { PiCheckBold, PiUser } from 'react-icons/pi';
import { addsubcategory, deletesubcategory, editsubcategory, getmaincategory, getsubcategory } from '@/Service/ApiService';
import { useDebounce } from 'use-debounce';
import FileNotFound from '@/assets/svg/FileNotFound';

type Option = {
    value: number
    label: string
}

type FormSchema = {
    sub_category_name: string;
    category_id: string | number;
    music_type: string[];
};

const validationSchema: ZodType<FormSchema> = z.object({
    category_id: z.union([
        z.string().min(1, { message: "Category is required" }),
        z.number()
    ]),
    // category: z.string().min(1, { message: 'Category Required' }),
    sub_category_name: z.string().min(1, { message: 'Sub Category Required' }),
    music_type: z.array(z.string()).min(1, { message: 'Select at least one music type' }),
});

const options: Option[] = [
    { value: 10, label: '10 / page' },
    { value: 25, label: '25 / page' },
    { value: 50, label: '50 / page' },
    { value: 100, label: '100 / page' },
];

const SubCategory = () => {
    const inputRef = useRef(null);
    const [search, setSearch] = useState("");
    const [pageCount, setPageCount] = useState<any>();
    const [pageNo, setPageNo] = useState(1);
    const [addinterest, setAddinterest] = useState(false);
    const [formValues, setFormValues] = useState<any>({});
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [title, setTitle] = useState(false);
    const [sorting, setSorting] = useState<any>([]);
    const [value] = useDebounce(search, 1000);
    const [loader, setLoader] = useState(false);
    const [category, setCategory] = useState([]);
    const [subCategoryData, setSubCategoryData] = useState([]);
    const [pending, setPending] = useState(false);
    const [imageLoaders, setImageLoaders] = useState<{ [key: string]: boolean }>({});
    const [pageSize, setPageSize] = useState(options[0].value);

    const getCategoryList = () => {
        getmaincategory()
            .then((res) => {
                const data = res?.data?.data;
                const options = data.map((item: any, index: number) => ({
                    label: (
                        <div className='flex gap-3 items-center' key={index}>
                            {/* <img src={item.image} className='rounded' /> */}
                            <Avatar className='rounded'>
                                <img src={item.image} className='object-cover' />
                            </Avatar>
                            {item.category_name}
                        </div>
                    ),
                    value: item?.id,
                }));
                setCategory(options);
            }).catch((err) => {
                // console.log(err, "error");
            })
    };

    useEffect(() => {
        if (addinterest) {
            getCategoryList();
        }
    }, [addinterest])

    const getSubCategoryList = () => {
        setLoader(true);

        let updatedPage = pageNo;

        if (search && pageNo !== 1) {
            updatedPage = 1;
            setPageNo(1);
            return;
        }

        const obj: any = {
            page: pageNo,
            limit: pageSize
        };

        if (search) {
            obj.search = search
        };

        getsubcategory(obj)
            .then((res) => {
                const data = res?.data?.data;
                const total_pages = res?.data?.pagination?.totalPages;
                setSubCategoryData(data);
                setPageCount(total_pages);
                setLoader(false);
            }).catch((err) => {
                setLoader(false);
            })
    };

    useEffect(() => {
        getSubCategoryList();
    }, [pageNo, pageSize, value]);

    const onPageSelect = ({ value }: Option) => {
        setPageSize(value)
    };

    const handleAddcategory = () => {
        setAddinterest(true);
        setTitle(true);
    };

    const handleEditcategory = (data: any) => {
        setAddinterest(true);
        setFormValues(data);
        setTitle(false);
        setValue("sub_category_name", data?.sub_category_name);
        setValue("category_id", data?.category_id);
        const musicTypes: string[] = [];
        if (data?.with_music) musicTypes?.push("with_music");
        if (data?.only_voice_music) musicTypes?.push("only_voice_music");

        if (musicTypes.length === 0) {
            musicTypes.push("with_music", "only_voice_music");
        }

        setValue("music_type", musicTypes);
    };

    const handleClose = () => {
        setPending(false);
        setAddinterest(false);
        reset();
        // setValue("category", "");
        // setValue("subcategory_name", "");
    };

    const handleDelete = (item: any) => {
        setDeleteDialog(true);
        setFormValues(item);
    };

    const handleCancel = () => {
        setDeleteDialog(false);
        setFormValues({});
        setPending(false);
    };

    const handleConfirmDelete = () => {
        setPending(true);
        const obj = {
            sub_category_id: formValues?.id
        };

        deletesubcategory(obj)
            .then((res) => {
                const successmsg = res?.data?.message;
                toast.push(
                    <Notification type='success'>{successmsg || "Subcategory Delete successfully!"}</Notification>,
                    { placement: "top-end" }
                )
                getSubCategoryList();
                handleCancel();
            }).catch((err) => {
                const errormsg = err?.response?.data?.message;
                toast.push(
                    <Notification type='danger'>{errormsg || "Subcategory not deleted"}</Notification>,
                    { placement: "top-end" }
                );
                setPending(false);
            })
    };

    const onPaginationChange = (page: number) => {
        setPageNo(page);
    };

    const {
        handleSubmit,
        reset,
        formState: { errors },
        control,
        setValue,
    } = useForm<FormSchema>({
        defaultValues: {
            sub_category_name: formValues?.sub_category_name || "",
            category_id: formValues?.category_id || "",
            music_type: [],
        },
        resolver: zodResolver(validationSchema),
    });

    const onSubmit = (values: FormSchema) => {
        setPending(true);

        const with_music = values.music_type.includes("with_music");
        const only_voice_music = values.music_type.includes("only_voice_music");

        if (title) {
            const body = {
                sub_category_name: values?.sub_category_name,
                category_id: values?.category_id,
                with_music,
                only_voice_music,
            };

            addsubcategory(body)
                .then((res) => {
                    if (res?.status === 201) {
                        const successmsg = res?.data?.message;
                        toast.push(
                            <Notification type='success'>{successmsg || "Subcategory add Sucessfully"}</Notification>,
                            { placement: "top-end" }
                        )
                        getSubCategoryList();
                    }
                    handleClose();
                    setPending(false);
                }).catch((err) => {
                    const errormsg = err?.response?.data?.message;
                    toast.push(
                        <Notification type='danger'>{errormsg || "Subcategory not add "}</Notification>,
                        { placement: "top-end" }
                    );
                    setPending(false);
                })
        } else {
            const body = {
                sub_category_id: formValues?.id,
                sub_category_name: values?.sub_category_name,
                category_id: values?.category_id,
                // with_music,
                // only_voice_music,
            };

            editsubcategory(body)
                .then((res) => {
                    // console.log(res, "res");
                    if (res?.status === 201) {
                        const successmsg = res?.data?.message;
                        toast.push(
                            <Notification type='success'>{successmsg || "Subcategory update Sucessfully"}</Notification>,
                            { placement: "top-end" }
                        )
                        getSubCategoryList();
                    }
                    handleClose();
                    setPending(false);
                }).catch((err) => {
                    const errormsg = err?.response?.data?.message;
                    toast.push(
                        <Notification type='danger'>{errormsg || "Subcategory not found "}</Notification>,
                        { placement: "top-end" }
                    );
                    setPending(false);
                })
        }
    };

    const columns = [
        {
            header: "Id",
            accessorKey: "id",
        },
        {
            header: "Category",
            accessorKey: "category",
            enableSorting: true,
            cell: ({ row }: { row: any }) => {
                const category = row.original.category;
                const index = row.index;
                const key = `category-${index}`;

                return (
                    // <div className="flex items-center gap-2 xl:w-auto w-52">
                    //     {category?.image ? (
                    //         <Avatar className='rounded'>
                    //             <img src={category?.image} className='object-cover' />
                    //         </Avatar>
                    //     ) : (
                    //         <Avatar className='rounded' icon={<PiUserDuotone />} />
                    //     )}
                    //     <span>{category?.category_name}</span>
                    // </div>
                    <div className="flex items-center gap-2 w-56  relative">
                        {/* Skeleton loading */}
                        {imageLoaders[key] && (
                            <Skeleton className="w-10 h-10 rounded absolute top-0 left-0 z-10 " />
                        )}
                        {/* Profile image */}
                        {category?.image ? (
                            <Avatar className={`rounded ${imageLoaders[key] ? 'invisible' : ''}`}>
                                <img
                                    src={category?.image}
                                    alt="..."
                                    className={`object-cover `}
                                    onLoad={() => handleImageLoad(key)}
                                    onError={() => handleImageLoad(key)}
                                    ref={(img) => {
                                        if (img && img.complete && imageLoaders[key]) {
                                            handleImageLoad(key);
                                        }
                                    }}
                                />
                            </Avatar>
                        ) : (
                            <Avatar size={40} className='rounded' icon={<PiUser />} />
                        )}

                        <p className="capitalize">
                            {category?.category_name
                                ? category?.category_name
                                : '-'}</p>
                    </div>
                );
            },
        },
        {
            header: "subCategory Name",
            accessorKey: "sub_category_name",
            enableSorting: true,
            cell: ({ row }: { row: any }) => {
                const subcategoryname = row.original;

                return (
                    <div className="2xl:w-auto w-56">
                        <span>{subcategoryname?.sub_category_name}</span>
                    </div>
                );
            },
        },
        {
            header: "Only Voice",
            accessorKey: "with_music",
            enableSorting: true,
            cell: ({ row }: { row: any }) => {
                const data = row.original;

                return (
                    <div className={`${data?.with_music ? 'ml-5' : 'ml-6'} `}>
                        {data?.with_music ? <PiCheckBold size={22} className='text-primary' /> : "-"}
                    </div>
                );
            },
        },
        {
            header: "With Music",
            accessorKey: "only_voice_music",
            enableSorting: true,
            cell: ({ row }: { row: any }) => {
                const data = row.original;

                return (
                    <div className={`${data?.only_voice_music ? 'ml-12' : 'ml-14'} `}>
                        {data?.only_voice_music ? <PiCheckBold size={22} className='text-primary' /> : "-"}
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
                    <div className="flex items-center gap-2">
                        <Tooltip title="Edit">
                            <div
                                className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-primary hover:bg-primary/20 transition-colors cursor-pointer select-none"
                                role="button"
                                onClick={() => {
                                    handleEditcategory(data);
                                }}
                            >
                                <LuPencil className="text-lg" />
                            </div>
                        </Tooltip>
                        <Tooltip title="Delete">
                            <div
                                className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors cursor-pointer select-none"
                                role="button"
                                onClick={() => handleDelete(data)}
                            >
                                <LuTrash2 className="text-lg" />
                            </div>
                        </Tooltip>
                    </div>
                );
            },
            enableSorting: false,
        },
    ];

    const table = useReactTable({
        data: subCategoryData,
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    const handleImageLoad = (key: string) => {
        setImageLoaders(prev => {
            if (!prev[key]) return prev;
            return {
                ...prev,
                [key]: false,
            };
        });
    };

    useEffect(() => {
        const loaders: { [key: string]: boolean } = {};

        subCategoryData?.forEach((item: any, idx: number) => {
            if (item?.category?.image) loaders[`category-${idx}`] = true;
        });

        setImageLoaders(loaders);
    }, [subCategoryData]);

    return (
        <>
            <Container>
                <AdaptiveCard className="w-full">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <h3>Sub Category</h3>
                        <div className='sm:flex items-center gap-2'>
                            <div className='sm:mb-0 mb-3'>
                                <Input
                                    ref={inputRef}
                                    value={search}
                                    suffix={<TbSearch className="text-lg" />}
                                    placeholder="Search by Subcategory name..."
                                    onChange={(e) => {
                                        setSearch(e?.target?.value);
                                    }}
                                    className='sm:w-72 w-full'
                                />
                            </div>
                            <div className='w-fit ml-auto'>
                                <Button variant="solid" type="submit" onClick={() => handleAddcategory()}>
                                    Add Sub Category
                                </Button>
                            </div>
                        </div>
                    </div>

                    <Card className='mt-5'>
                        <div className="flex flex-col gap-4">

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
                                                                        className: `flex items-center ${['with_music', 'only_voice_music', 'action'].includes(header.column.id) ? 'pointer-events-none' : 'cursor-pointer select-none'} 
                                                                        ${['only_voice_music'].includes(header.column.id) ? 'w-30' : ''}
                                                                        `,
                                                                        onClick: ['with_music', 'only_voice_music', 'action'].includes(header.column.id)
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
                                                                    {!['with_music', 'only_voice_music', 'action'].includes(header.column.id) && <Sorter sort={header.column.getIsSorted()} />}
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
                                        // rows={10}
                                        columns={columns?.length}
                                        avatarInColumns={[1]}
                                        avatarProps={{
                                            width: 38,
                                            height: 38,
                                            variant: 'block'
                                        }}
                                    />
                                ) :
                                    // loader === false && subCategoryData?.length <= 0 ? (
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
                                            {loader === false && subCategoryData?.length <= 0 ? (
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

                            {loader === false && subCategoryData?.length > 0 && (
                                <div className='flex items-center justify-between '>
                                    <Pagination
                                        className="mt-4 flex items-center justify-end"
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
                    </Card>
                </AdaptiveCard>
            </Container>

            <Dialog
                isOpen={addinterest}
                onClose={handleClose}
                onRequestClose={handleClose}
                closable={false}

            >
                <h5 className='mb-4'>{title ? "Add" : "Edit"} Sub Category</h5>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    {/* <FormItem
                        label="Category"
                        invalid={Boolean(errors.category)}
                        errorMessage={errors.category?.message}
                    >
                        <Controller
                            name="category"
                            control={control}
                            render={({ field }) =>
                                <Select
                                    options={options}
                                    {...field}
                                    value={options.filter((option) => option.value === field.value)}
                                    onChange={(option) =>
                                        field.onChange(option?.value)
                                    }
                                />
                            }
                        />
                    </FormItem> */}

                    <FormItem
                        label="Select Category"
                        invalid={Boolean(errors.category_id)}
                        errorMessage={errors.category_id?.message}
                    >
                        <Controller
                            name="category_id"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    options={category}
                                    {...field}
                                    value={category.find((option: any) => option.value === field.value)}
                                    onChange={(selectedOption: any) => field.onChange(selectedOption?.value)}
                                    placeholder={"Please Select Category"}
                                />
                            )}
                        />
                    </FormItem>
                    <FormItem
                        label="Sub Category Name"
                        invalid={Boolean(errors.sub_category_name)}
                        errorMessage={errors.sub_category_name?.message}
                    >
                        <Controller
                            name="sub_category_name"
                            control={control}
                            render={({ field }) =>
                                <Input
                                    type="text"
                                    autoComplete="off"
                                    placeholder="Enter the category name"
                                    {...field}
                                />
                            }
                        />
                    </FormItem>
                    {title && (
                        <FormItem
                            label="Music Type"
                            invalid={Boolean(errors.music_type)}
                            errorMessage={errors.music_type?.message}
                        >
                            <Controller
                                name="music_type"
                                control={control}
                                render={({ field }) => (
                                    <Checkbox.Group
                                        value={field.value}
                                        onChange={field.onChange}
                                    >
                                        <Checkbox value="with_music">Only Voice</Checkbox>
                                        <Checkbox value="only_voice_music">With Music</Checkbox>
                                    </Checkbox.Group>
                                )}
                            />
                        </FormItem>
                    )}
                    <div className='flex items-center justify-end w-full mb-0'>
                        <Button
                            type="button"
                            disabled={pending}
                            className="ltr:mr-2 rtl:ml-2 w-24"
                            onClick={() => handleClose()}
                        >
                            Cancel
                        </Button>
                        <Button variant="solid" type="submit" disabled={pending} loading={pending} className={`${pending ? 'w-auto' : 'w-24'}`}>
                            {title ? "Submit" : "Save"}
                        </Button>
                    </div>
                </Form>
            </Dialog>

            <ConfirmDialog
                isOpen={deleteDialog}
                type="danger"
                title="Delete Sub category"
                onClose={handleCancel}
                onRequestClose={handleCancel}
                onCancel={handleCancel}
                onConfirm={handleConfirmDelete}
                closable={false}
                confirmButtonProps={{
                    loading: pending,
                    disabled: pending
                }}
            >
                <p>
                    {' '}
                    Are you sure you want to delete this sub category? This action
                    can&apos;t be undo.{' '}
                </p>
            </ConfirmDialog>
        </>
    )
}

export default SubCategory
