import { AdaptiveCard, ConfirmDialog, Container, TableRowSkeleton } from '@/components/shared';
import { Button, Card, Checkbox, Dialog, Form, FormItem, Input, Notification, Pagination, Select, Skeleton, Table, toast, Tooltip, Upload } from '@/components/ui';
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
import { TbCircleXFilled, TbLibraryPhoto, TbSearch } from 'react-icons/tb';
import { LuPencil, LuTrash2 } from 'react-icons/lu';
import { z } from 'zod';
import Avatar from '@/components/ui/Avatar/Avatar';
import { PiUser } from 'react-icons/pi';
import { addcategory, deletecategory, editcategory, getcategory } from '@/Service/ApiService';
import FileNotFound from '@/assets/svg/FileNotFound';
import { useDebounce } from 'use-debounce';

type FormSchema = {
    category_name: string
    category_image: File | undefined | string;
    category_description: string;
    isPopuler?: boolean
};

const validationSchema: any = z.object({
    category_name: z.string().min(1, { message: 'Category Required' }),
    category_image: z.union([z.string().min(1, { message: 'Category Image is required' }), z.instanceof(File).optional()]),
    category_description: z.string().min(1, { message: 'Category description Required' }),
    isPopuler: z.boolean().optional(),
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

const Category = () => {
    const inputRef = useRef(null);
    const [search, setSearch] = useState("");
    const [pageCount, setPageCount] = useState<any>();
    const [pageNo, setPageNo] = useState(1);
    const [addinterest, setAddinterest] = useState(false);
    const [formValues, setFormValues] = useState<any>({});
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [title, setTitle] = useState(false);
    const [sorting, setSorting] = useState<any>([]);
    const [imagePreview, setImagePreview] = useState<any>(null);
    const [value] = useDebounce(search, 1000);
    const [loader, setLoader] = useState(false);
    const [categoryData, setCategoryData] = useState<any>([]);
    const [pending, setPending] = useState(false);
    const [imageLoaders, setImageLoaders] = useState<{ [key: string]: boolean }>({});
    const [pageSize, setPageSize] = useState(options[0].value);

    const getCategoryList = () => {
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

        getcategory(obj)
            .then((res) => {
                const data = res?.data?.data;
                const total_pages = res?.data?.pagination?.totalPages;
                setCategoryData(data);
                setPageCount(total_pages);
                setLoader(false);
            }).catch((err) => {
                setLoader(false);
            })
    };

    useEffect(() => {
        getCategoryList();
    }, [pageNo, pageSize, value]);

    const onPageSelect = ({ value }: Option) => {
        setPageSize(value)
    };

    const handleAddcategory = () => {
        setAddinterest(true);
        setTitle(true);
        // setValue("category_name", "");
    };

    const handleEditcategory = (data: any) => {
        setAddinterest(true);
        setFormValues(data);
        setTitle(false);
        setImagePreview(data?.image);
        setValue("category_image", data?.image);
        setValue("category_name", data?.category_name);
        setValue("category_description", data?.category_description);
        setValue("isPopuler", data?.isPopuler);
    };

    const handleClose = () => {
        setAddinterest(false);
        setFormValues({});
        reset();
        setImagePreview(null);
        setPending(false);
        setValue("category_image", "");
        setValue("category_name", "");
        setValue("category_description", "");
    };

    const onPaginationChange = (page: number) => {
        setPageNo(page);
    };

    const handleImg = (e: any) => {
        const files = e;

        if (files && files.length > 0) {
            const file = files[0];

            const validImageTypes = ["image/jpeg", "image/png", "image/gif"];
            if (validImageTypes.includes(file.type)) {
                const newImageUrl = URL.createObjectURL(file);
                setImagePreview(newImageUrl);
                setValue("category_image", file);
                trigger("category_image");
            } else {
                toast.push(
                    <Notification type="danger">
                        Invalid file type! Please upload an image (JPEG, PNG, GIF).
                    </Notification>,
                    { placement: "top-end" }
                );
            }
        } else {
            console.error("No files selected.");
        }
    };

    const removeImg = () => {
        setValue("category_image", "");
        setImagePreview(null);
    };

    const {
        handleSubmit,
        reset,
        formState: { errors },
        control,
        setValue,
        trigger
    } = useForm<FormSchema>({
        defaultValues: {
            category_image: formValues?.image || '',
            category_name: formValues?.category_name || '',
            category_description: formValues?.category_description || '',
            isPopuler: formValues?.isPopuler,
        },
        resolver: zodResolver(validationSchema),
    });

    const onSubmit = (values: FormSchema) => {
        setPending(true);

        if (title) {
            const formData = new FormData();

            formData.append("category_name", values?.category_name);
            formData.append("category_description", values?.category_description);
            if (values?.category_image) {
                formData.append("category_image", values?.category_image);
            }
            formData.append("isPopuler", String(values?.isPopuler ?? false));

            addcategory(formData)
                .then((res) => {
                    console.log(res, "res");
                    if (res?.status === 201) {
                        const successmsg = res?.data?.message;
                        toast.push(
                            <Notification type='success'>{successmsg || "Category add Sucessfully"}</Notification>,
                            { placement: "top-end" }
                        )
                        getCategoryList();
                    }
                    handleClose();
                    setPending(false);
                }).catch((err) => {
                    const errormsg = err?.response?.data?.message;
                    toast.push(
                        <Notification type='danger'>{errormsg || "Category not add "}</Notification>,
                        { placement: "top-end" }
                    );
                    setPending(false);
                })
        } else {
            const formData = new FormData();

            formData.append("category_id", formValues?.id);
            formData.append("category_name", values?.category_name);
            formData.append("category_description", values?.category_description);
            if (values?.category_image) {
                formData.append("category_image", values?.category_image);
            }
            formData.append("isPopuler", String(values?.isPopuler ?? false));

            editcategory(formData)
                .then((res) => {
                    // console.log(res, "res");
                    if (res?.status === 201) {
                        const successmsg = res?.data?.message;
                        toast.push(
                            <Notification type='success'>{successmsg || "Category update Sucessfully"}</Notification>,
                            { placement: "top-end" }
                        )
                        getCategoryList();
                    }
                    handleClose();
                    setPending(false);
                }).catch((err) => {
                    const errormsg = err?.response?.data?.message;
                    toast.push(
                        <Notification type='danger'>{errormsg || "Category not found "}</Notification>,
                        { placement: "top-end" }
                    );
                    setPending(false);
                })
        }
    };

    const handleDelete = (item: any) => {
        setDeleteDialog(true);
        setFormValues(item);
    };

    const handleCancel = () => {
        setDeleteDialog(false);
        setPending(false);
        setFormValues({});
    };

    const handleConfirmDelete = () => {
        setPending(true);
        const obj = {
            category_id: formValues?.id
        };

        deletecategory(obj)
            .then((res) => {
                const successmsg = res?.data?.message;
                toast.push(
                    <Notification type='success'>{successmsg || "Category Delete successfully!"}</Notification>,
                    { placement: "top-end" }
                )
                getCategoryList();
                handleCancel();
            }).catch((err) => {
                const errormsg = err?.response?.data?.message;
                toast.push(
                    <Notification type='danger'>{errormsg || "Category not deleted "}</Notification>,
                    { placement: "top-end" }
                );
                setPending(false);
            })
    };

    const handlePopular = (data: any, index: number) => {
        const isoutput1 = !data?.isPopuler;
        const updatedPostView = [...categoryData];
        updatedPostView[index] = { ...updatedPostView[index], isPopuler: isoutput1 };
        setCategoryData(updatedPostView);

        const formData = new FormData();

        formData.append("category_id", data?.id);
        formData.append("isPopuler", isoutput1.toString());

        editcategory(formData)
            .then((res) => {
                if (res?.status === 201) {
                    // const updatedPostView = [...categoryData];
                    // updatedPostView[index] = { ...updatedPostView[index], isPopuler: isoutput1 };
                    // setCategoryData(updatedPostView);
                }
            }).catch((err) => {
                // console.log(err, "error");
            })
    };

    const columns = [
        {
            header: "Id",
            accessorKey: "id",
        },
        {
            header: "Category Name",
            accessorKey: "category_name",
            enableSorting: true,
            cell: ({ row }: { row: any }) => {
                const item = row.original;
                const index = row.index;
                const key = `category-${index}`;

                return (
                    // <div className="flex items-center gap-2 xl:w-auto w-52">
                    //     {user?.image ? (
                    //         <Avatar className='rounded'>
                    //             <img src={user?.image} className='object-cover' />
                    //         </Avatar>
                    //     ) : (
                    //         <Avatar className='rounded' icon={<PiUserDuotone />} />
                    //     )}
                    //     <span>{user?.category_name}</span>
                    // </div>

                    <div className="flex items-center gap-2 w-56  relative">
                        {imageLoaders[key] && (
                            <Skeleton className="w-10 h-10 rounded absolute top-0 left-0 z-10 " />
                        )}
                        {item?.image ? (
                            <Avatar className={`rounded ${imageLoaders[key] ? 'invisible' : ''}`}>
                                <img
                                    src={item?.image}
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
                            {item?.category_name
                                ? item?.category_name
                                : '-'}</p>
                    </div>
                );
            },
        },
        {
            header: "Description",
            accessorKey: "category_description",
            enableSorting: true,
            cell: ({ row }: { row: any }) => {
                const user = row.original;
                return (
                    // <div className="w-52 tranate" dangerouslySetInnerHTML={{ __html: user?.category_description || '' }} />
                    <div className="w-52 tranate"  >{user?.category_description}</div>
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
        {
            header: "popular category",
            accessorKey: "popularcategory",
            enableSorting: true,
            cell: ({ row }: { row: any }) => {
                const data = row.original;
                const index = row.index;
                return (
                    <div className='w-40'>
                        <Checkbox
                            checked={data?.isPopuler}
                            onChange={() => handlePopular(data, index)}
                        >
                            Is Popular
                        </Checkbox>
                    </div>
                );
            },
        },
    ];

    const table = useReactTable({
        data: categoryData,
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

        categoryData?.forEach((item: any, idx: number) => {
            if (item?.image) loaders[`category-${idx}`] = true;
        });

        setImageLoaders(loaders);
    }, [categoryData]);

    return (
        <>
            <Container>
                <AdaptiveCard>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <h3>Category</h3>
                        <div className='sm:flex items-center gap-2'>
                            <div className='sm:mb-0 mb-3'>
                                <Input
                                    ref={inputRef}
                                    value={search}
                                    suffix={<TbSearch className="text-lg" />}
                                    placeholder="Search by Category name..."
                                    onChange={(e) => {
                                        setSearch(e?.target?.value);
                                    }}
                                    className='sm:w-72 w-full'
                                />
                            </div>
                            <div className='w-fit ml-auto sm:mt-0 mt-3'>
                                <Button variant="solid" type="submit" onClick={() => handleAddcategory()}>
                                    Add category
                                </Button>
                            </div>
                        </div>
                    </div>

                    <Card className='mt-5'>
                        <div className="flex flex-col gap-4">
                            <div>
                                <Table className="table-auto w-full ">
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
                                                                            className: `flex items-center ${['action', 'popularcategory'].includes(header.column.id) ? 'pointer-events-none' : 'cursor-pointer select-none'}`,
                                                                            onClick: ['action', 'popularcategory'].includes(header.column.id)
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
                                                                        {!['action', 'popularcategory'].includes(header.column.id) && <Sorter sort={header.column.getIsSorted()} />}
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
                                            columns={columns.length}
                                            avatarInColumns={[1]}
                                            avatarProps={{
                                                width: 38,
                                                height: 38,
                                                variant: 'block'
                                            }}
                                        />
                                    ) :
                                        // loader === false && categoryData?.length <= 0 ? (
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
                                                {loader === false && categoryData.length <= 0 ? (
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
                                {loader === false && categoryData?.length > 0 && (
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
                <h5 className='mb-2'>{title ? "Add" : "Edit"} Category</h5>
                <div className=''>
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <FormItem label="Category Image" invalid={Boolean(errors.category_image)} errorMessage={errors.category_image?.message}>
                            <Upload
                                draggable
                                className="min-h-[250px] bg-gray-100"
                                showList={false}
                                uploadLimit={1}
                                onChange={handleImg}
                            >
                                {imagePreview ? (
                                    <div className="flex">
                                        {/* <Avatar className='max-w-64 sm:w-64 w-52 h-[200px] object-cover rounded-md flex items-center justify-center'> */}
                                        <img
                                            className="w-52 h-32"
                                            src={imagePreview}
                                            alt="image preview"
                                        />
                                        {/* </Avatar> */}
                                        <TbCircleXFilled
                                            className="text-red-500 text-lg z-20 -m-2.5"
                                            onClick={removeImg}
                                        />
                                    </div>
                                ) : (
                                    <div className="max-w-full flex flex-col px-4 py-2 justify-center items-center min-h-[130px]">
                                        <div className="text-[50px]"><TbLibraryPhoto /></div>
                                        <p className="text-center mt-1 text-xs">
                                            <span className="text-gray-800 dark:text-white">Drop your image here, or </span>
                                            <span className="text-primary">Click to browse</span>
                                        </p>
                                    </div>
                                )}
                            </Upload>
                        </FormItem>
                        <FormItem
                            label="Category Name"
                            invalid={Boolean(errors.category_name)}
                            errorMessage={errors.category_name?.message}
                        >
                            <Controller
                                name="category_name"
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
                        <FormItem
                            label="Description"
                            invalid={Boolean(errors.category_description)}
                            errorMessage={errors.category_description?.message}
                        >
                            <Controller
                                name="category_description"
                                control={control}
                                render={({ field }) =>
                                    <Input
                                        textArea
                                        type="text"
                                        autoComplete="off"
                                        placeholder="Enter the description"
                                        {...field}
                                    />
                                }
                            />
                        </FormItem>
                        <FormItem
                            label=""
                            invalid={Boolean(errors.isPopuler)}
                            errorMessage={errors.isPopuler?.message}
                        >
                            <Controller
                                name="isPopuler"
                                control={control}
                                render={({ field }) =>
                                    <Checkbox
                                        {...field}
                                        checked={!!field.value}
                                        onChange={(checked) => field.onChange(checked)}
                                    >
                                        Is Popular
                                    </Checkbox>
                                }
                            />
                        </FormItem>
                        <div className='flex items-center justify-end w-full mb-0'>
                            <Button
                                type="button"
                                disabled={pending}
                                className="ltr:mr-2 rtl:ml-2 w-24"
                                onClick={() => handleClose()}
                            >
                                Cancel
                            </Button>
                            <Button disabled={pending} loading={pending} variant="solid" type="submit" className={`${pending ? 'w-auto' : 'w-24'}`}>
                                {title ? "Submit" : "Save"}
                            </Button>
                        </div>
                    </Form>
                </div>
            </Dialog>

            <ConfirmDialog
                isOpen={deleteDialog}
                type="danger"
                title="Delete category"
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
                    Are you sure you want to delete this category? This action
                    can&apos;t be undo.{' '}
                </p>
            </ConfirmDialog>
        </>
    )
}

export default Category
