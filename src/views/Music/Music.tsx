import { AdaptiveCard, ConfirmDialog, Container } from '@/components/shared';
import EllipsisButton from '@/components/shared/EllipsisButton';
import Loading from '@/components/shared/Loading';
import { Button, Card, Checkbox, Dropdown, Input, Notification, Pagination, Select, Skeleton, toast } from '@/components/ui';
import { deletemusic, editmusic, getmusiclist, getsubcategorylist } from '@/Service/ApiService';
import { useEffect, useRef, useState } from 'react'
import { PiStarFill } from 'react-icons/pi';
import { TbSearch } from 'react-icons/tb';
import { LuEye, LuPencil, LuTrash2 } from 'react-icons/lu';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Music = () => {
    const inputRef = useRef<any>(null);
    const navigate = useNavigate();
    const [search, setSearch] = useState<any>('');
    const [loader, setLoader] = useState(false);
    const [musicData, setMusicData] = useState<any>([]);
    const [pageNo, setPageNo] = useState(1);
    const [pageCount, setPageCount] = useState<any>();
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [formValues, setFormValues] = useState<any>({});
    const [imageLoaders, setImageLoaders] = useState<{ [key: string]: boolean }>({});
    const [subCategory, setSubCategory] = useState<any>([]);
    const [searchParams, setSearchParams] = useSearchParams();
    const subcategoryData = searchParams.get('subcategory');
    const [pending, setPending] = useState(false);

    const getSubcategoryList = () => {
        getsubcategorylist()
            .then((res) => {
                const subcategorydata = res?.data?.data;
                const mappedOptions = subcategorydata.map((item: any) => ({
                    label: item.sub_category_name,
                    value: item.id,
                }));
                const optionsWithAll = [
                    { label: 'All Sub Category', value: 'all' },
                    ...mappedOptions
                ];

                setSubCategory(optionsWithAll);
            }).catch((err) => {
            })
    };

    useEffect(() => {
        getSubcategoryList();
    }, []);

    const onPaginationChange = (page: any) => {
        setPageNo(page);
    };

    const getMusicList = () => {
        setLoader(true);

        let obj: any = {
            page: pageNo,
            limit: 12,
            // id: subcategoryData ? subcategoryData : '',
        };

        if (subcategoryData && subcategoryData !== "all") {
            obj.id = subcategoryData;
        };

        if (search) {
            obj.search = search
        };

        getmusiclist(obj)
            .then((res) => {
                const data = res?.data?.data;
                const total_pages = res?.data?.pagination?.totalPages;
                setMusicData(data);
                setPageCount(total_pages);
                setLoader(false);
            }).catch((err) => {
                setLoader(false);
            })
    };

    useEffect(() => {
        getMusicList();
    }, [pageNo, search, subcategoryData]);

    const handleEdit = (item: any) => {
        navigate("/admin/addmusic", { state: item })
    };

    const handleView = (item: any) => {
        navigate("/admin/music_details", { state: item });
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
            music_id: formValues?.id
        };

        deletemusic(obj)
            .then((res) => {
                const successmsg = res?.data?.message;
                toast.push(
                    <Notification type='success'>{successmsg || "Theme Delete successfully!"}</Notification>,
                    { placement: "top-end" }
                )
                getMusicList();
                handleCancel();
            }).catch((err) => {
                const errormsg = err?.response?.data?.message;
                toast.push(
                    <Notification type='danger'>{errormsg || "Theme not deleted"}</Notification>,
                    { placement: "top-end" }
                );
                setPending(false);
            })
    };

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

        musicData?.forEach((item: any, idx: number) => {
            if (item?.music_image) loaders[`music-${idx}`] = true;
        });

        setImageLoaders(loaders);
    }, [musicData]);

    const handleToggle = (item: any, index: any) => {

        const isoutput1 = !item?.isPremium;
        // const updatedPostView = [...themesData];
        // updatedPostView[index] = { ...updatedPostView[index], byDefault: isoutput1 };
        // setThemesData(updatedPostView);

        const body = {
            music_id: item?.id,
            isPremium: isoutput1
        }

        editmusic(body)
            .then((res) => {
                if (res?.status === 200) {
                    const updatedPostView = [...musicData];
                    updatedPostView[index] = { ...updatedPostView[index], isPremium: isoutput1 };
                    setMusicData(updatedPostView);
                }
            }).catch((err) => {
                // console.log(err, "error");
            })
    };

    const handleFilter = (selected: any) => {
        setSearchParams((prev) => {
            const newParams = new URLSearchParams(prev.toString());
            if (selected) {
                newParams.set("subcategory", selected?.value);
                // newParams.set("page", "1");
                setPageNo(1);
            } else {
                newParams.set("subcategory", '');
            }
            return newParams;
        });
    };

    return (
        <>
            <Container>
                <AdaptiveCard className="h-full">
                    <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-2">
                        <h3>Musics</h3>
                        <div className='flex md:flex-row flex-col items-center gap-3'>
                            <Select
                                options={subCategory}
                                value={subCategory.find((option: any) => String(option.value) === String(subcategoryData)) || subCategory[0]}
                                onChange={handleFilter}
                                placeholder={"Please Select Subcategory"}
                                className='md:w-72 w-full'
                            />
                            <div className='md:w-auto w-full'>
                                <Input
                                    ref={inputRef}
                                    value={search}
                                    suffix={<TbSearch className="text-lg" />}
                                    placeholder="Search by Music name..."
                                    onChange={(e) => {
                                        setSearch(e?.target?.value);
                                    }}
                                    className='md:w-72 w-full'
                                />
                            </div>
                            <div className='w-fit sm:ml-0 ml-auto'>
                                <Button variant="solid" type="submit" onClick={() => navigate("/admin/addmusic")}>
                                    Add Music
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className='h-full'>
                        {loader === true ? (
                            <div className="h-[70vh]">
                                <Loading loading={loader} />
                            </div>
                        ) : loader === false && musicData?.length <= 0 ? (
                            <div className='h-[70vh] flex items-center justify-center'><p className="text-lg p-2 text-center"> No Data Found </p></div>
                        ) : (
                            <>
                                <div className='grid grid-cols-12 gap-5 mt-5'>
                                    {musicData?.map((item: any, index: any) => (
                                        <Card key={index} className='2xl:col-span-4 xl:col-span-4 md:col-span-6 col-span-12 '
                                        >
                                            {/* <div className='flex items-center justify-between mb-3'>
                                                {item?.isPremium && (
                                                    <div className='flex items-center gap-2 '>
                                                        <PiStarFill size={22} className='text-yellow-500' />
                                                        <p className='font-semibold'>Premium</p>
                                                    </div>
                                                )}
                                                <div className='flex items-center gap-2 ml-auto'>
                                                    <Checkbox
                                                        checked={item?.isPremium}
                                                        onChange={() => handleToggle(item, index)}
                                                    >
                                                        Music Premium
                                                    </Checkbox>
                                                </div>
                                            </div> */}
                                            <div className='h-52 sm:h-64'>
                                                {/* <img src={item?.music_image} alt='...' className='w-full h-full rounded-md object-cover' /> */}
                                                <div className=" w-full h-full  relative">

                                                    {item?.isPremium && !imageLoaders[`music-${index}`] && (
                                                        <div className='absolute top-2 right-2 z-20 flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md shadow'>
                                                            <PiStarFill size={18} className='text-yellow-500' />
                                                            <p className='font-semibold text-[13px] text-black'>Premium</p>
                                                        </div>
                                                    )}

                                                    {imageLoaders[`music-${index}`] && (
                                                        <Skeleton className="w-full h-full rounded absolute top-0 left-0 z-10 " />
                                                    )}
                                                    {item?.music_image ? (
                                                        <img
                                                            src={item?.music_image}
                                                            alt="music"
                                                            className={`object-cover w-full h-full rounded ${imageLoaders[`music-${index}`] ? 'invisible' : ''} `}
                                                            onLoad={() => handleImageLoad(`music-${index}`)}
                                                            onError={() => handleImageLoad(`music-${index}`)}
                                                            ref={(img) => {
                                                                if (img && img.complete && imageLoaders[`music-${index}`]) {
                                                                    handleImageLoad(`music-${index}`);
                                                                }
                                                            }}
                                                        />
                                                    ) : (
                                                        <img src={item?.music_image} className='w-full h-full' />
                                                    )}
                                                </div>
                                            </div>
                                            <div className='flex items-center justify-between mt-3'>
                                                <h6 className='line-clamp-1'>{item?.title}</h6>
                                                <Dropdown
                                                    placement="bottom-end"
                                                    renderTitle={<EllipsisButton variant='default' />}
                                                >
                                                    <Dropdown.Item
                                                        eventKey="renameBoard"
                                                    >
                                                        <Checkbox
                                                            checked={item?.isPremium}
                                                            onChange={() => handleToggle(item, index)}
                                                        >
                                                            Premium
                                                        </Checkbox>
                                                    </Dropdown.Item>
                                                    <Dropdown.Item
                                                        eventKey="renameBoard"
                                                        onClick={() => handleView(item)}
                                                    >
                                                        <span className="text-lg">
                                                            <LuEye />
                                                        </span>
                                                        <span>View</span>
                                                    </Dropdown.Item>
                                                    <Dropdown.Item
                                                        eventKey="addTicket"
                                                        onClick={() => handleEdit(item)}
                                                    >
                                                        <span className="text-lg">
                                                            <LuPencil />
                                                        </span>
                                                        <span>Edit</span>
                                                    </Dropdown.Item>
                                                    <Dropdown.Item
                                                        eventKey="deleteBoard"
                                                        onClick={() => handleDelete(item)}
                                                        className='text-red-500'
                                                    >
                                                        <span className="text-lg">
                                                            <LuTrash2 />
                                                        </span>
                                                        <span>Delete</span>
                                                    </Dropdown.Item>
                                                </Dropdown>
                                            </div>
                                        </Card>
                                    ))}
                                </div>

                                <Pagination
                                    className="mt-4 flex items-center justify-end"
                                    currentPage={pageNo}
                                    total={pageCount}
                                    onChange={onPaginationChange}
                                />
                            </>
                        )}
                    </div>
                </AdaptiveCard>
            </Container>

            <ConfirmDialog
                isOpen={deleteDialog}
                type="danger"
                title="Delete Music"
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
                    Are you sure you want to delete this music? This action
                    can&apos;t be undo.{' '}
                </p>
            </ConfirmDialog>
        </>
    )
}

export default Music
