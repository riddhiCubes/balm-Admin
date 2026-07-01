import { AdaptiveCard, Container } from '@/components/shared';
import Loading from '@/components/shared/Loading';
import { Button, Card, Checkbox, Input, Pagination, Select, Skeleton } from '@/components/ui';
import IconButton from '@/components/ui/IconButton';
import { getmusiclist, getsubcategorylist } from '@/Service/ApiService';
import { useEffect, useRef, useState } from 'react'
import { PiStarFill } from 'react-icons/pi';
import { TbSearch } from 'react-icons/tb';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { AiOutlineInfoCircle } from 'react-icons/ai';

const MusicList = () => {
    const inputRef = useRef<any>(null);
    const originalNotificationRef = useRef<any>(null);
    const navigate = useNavigate();
    const location = useLocation();
    const [search, setSearch] = useState<any>('');
    const [loader, setLoader] = useState(false);
    const [musicData, setMusicData] = useState<any>([]);
    const [pageNo, setPageNo] = useState(1);
    const [pageCount, setPageCount] = useState<any>();
    const [formValues, setFormValues] = useState<any>({});
    const [imageLoaders, setImageLoaders] = useState<{ [key: string]: boolean }>({});
    const [subCategory, setSubCategory] = useState<any>([]);
    const [searchParams, setSearchParams] = useSearchParams();
    const subcategoryData = searchParams.get('subcategory');
    const [isStateRestored, setIsStateRestored] = useState(false);

    useEffect(() => {
        if (location?.state) {
            const { activeTab: selectedTab, formValues: savedForm, search: savedSearch, subcategory: savedSubcategory, pageNo: savedPage } = location.state;

            // 🔹 Save the very first notification data (used for going back)
            if (savedForm && !originalNotificationRef.current) {
                originalNotificationRef.current = {
                    activeTab: selectedTab,
                    formValues: savedForm,
                    search: savedSearch,
                    subcategory: savedSubcategory,
                    pageNo: savedPage,
                    date: savedForm?.date,
                    time: savedForm?.time,
                };
            }

            // 🧠 Always restore latest visited state (for visible data)
            setFormValues(savedForm || {});
            setSearch(savedSearch || '');

            if (savedSubcategory) {
                setSearchParams(prev => {
                    const newParams = new URLSearchParams(prev.toString());
                    newParams.set('subcategory', savedSubcategory);
                    return newParams;
                });
            }

            if (savedPage) setPageNo(savedPage);
        }
        setIsStateRestored(true);
    }, []);

    const getSubcategoryList = () => {
        getsubcategorylist()
            .then((res) => {
                const subcategorydata = res?.data?.data;
                const mappedOptions = subcategorydata.map((item: any) => ({
                    label: item?.sub_category_name,
                    value: item?.id,
                }));
                const optionsWithAll = [
                    { label: 'All Sub Category', value: 'all' },
                    ...mappedOptions
                ];
                setSubCategory(optionsWithAll);
            }).catch((err) => { });
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
                let data = res?.data?.data || [];
                const total_pages = res?.data?.pagination?.totalPages;

                // if (!search && (!subcategoryData || subcategoryData === "all")) {
                //     if (formValues?.id && !data.some((item: any) => item.id === formValues.id)) {
                //         data = [formValues, ...data];
                //     }
                // }

                setMusicData(data);
                setPageCount(total_pages);
                setLoader(false);
            }).catch(() => {
                setLoader(false);
            });
    };

    useEffect(() => {
        if (!isStateRestored) return; // Wait for state restoration
        getMusicList();
    }, [pageNo, search, subcategoryData, isStateRestored]);

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

    const handleFilter = (selected: any) => {
        setSearchParams((prev) => {
            const newParams = new URLSearchParams(prev.toString());
            if (selected) {
                newParams.set("subcategory", selected?.value);
                setPageNo(1);
            } else {
                newParams.set("subcategory", '');
            }
            return newParams;
        });
    };

    const handleSelectMusic = (item: any) => {
        setFormValues((prev: any) => {
            // if same item clicked, unselect it
            if (prev?.id === item?.id) {
                const { id, title, music_image, ...rest } = prev;
                return { ...rest };
            }
            // keep rest of old form data, but override music fields
            return {
                ...prev,
                id: item?.id,
                title: item?.title,
                music_image: item?.music_image,
                isPremium: item?.isPremium
            };
        });
    };

    const handlePreviousPage = () => {
        const prevState = originalNotificationRef?.current || {};
        const prevForm = prevState?.formValues || {};

        const notificationFields = {
            notification_title: prevForm?.notification_title,
            notification_body: prevForm?.notification_body,
            notification_type: prevForm?.notification_type,
            send_to: prevForm?.send_to,
            select_user: prevForm?.select_user,
            id: prevForm?.id,
            title: prevForm?.title,
            music_image: prevForm?.music_image,
            isPremium: prevForm?.isPremium,
            date: prevForm?.date,
            time: prevForm?.time
        };

        // ✅ Return with original state values (not latest filter)
        navigate("/admin/notificationsend", {
            state: {
                activeTab: prevState?.activeTab,
                formValues: notificationFields,
                search: prevState?.search,
                subcategory: prevState?.subcategory,
                pageNo: prevState?.pageNo
            }
        });
    };

    return (
        <Container>
            <AdaptiveCard className="h-full">
                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-2">
                    <div>
                        <div className='flex items-center gap-3 cursor-pointer' onClick={handlePreviousPage}>
                            <IconButton />
                            <h3>Music</h3>
                        </div>
                    </div>

                    <div className='flex md:flex-row flex-col md:items-center items-end gap-3'>
                        <Button
                            type="button"
                            variant="solid"
                            disabled={!formValues?.id}
                            onClick={() => {
                                const prevState = originalNotificationRef?.current || {};
                                navigate("/admin/notificationsend", {
                                    state: {
                                        activeTab: prevState?.activeTab,
                                        formValues,
                                        search,
                                        subcategory: subcategoryData,
                                        pageNo
                                    }
                                });
                            }}
                        >
                            Confirm Music
                        </Button>

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
                    </div>
                </div>

                <div className='flex items-start gap-2 mt-5 p-3 bg-green-50 border border-green-200 rounded-md shadow-sm w-fit'>
                    <AiOutlineInfoCircle size={20} className="text-green-600 shrink-0 mt-0.5" />
                    <p className='text-sm text-green-700 leading-snug'>
                        <strong>Note:</strong> After selecting a music item from the list below, the <strong> Confirm Music </strong> button will become active. Click it to <strong> send the selected music as a notification through the Notification page.</strong>
                    </p>
                </div>

                <div className='h-full'>
                    {loader ? (
                        <div className="h-[70vh]">
                            <Loading loading={loader} />
                        </div>
                    ) : musicData?.length <= 0 ? (
                        <div className='h-[70vh] flex items-center justify-center'>
                            <p className="text-lg p-2 text-center"> No Data Found </p>
                        </div>
                    ) : (
                        <>
                            <div className='grid grid-cols-12 gap-5 mt-5'>
                                {musicData?.map((item: any, index: any) => (
                                    <Card key={index} className='2xl:col-span-4 xl:col-span-4 md:col-span-6 col-span-12'>
                                        <div className='h-52 sm:h-64'>
                                            <div className="w-full h-full relative">
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
                                        <div className='flex items-center gap-2 mt-3'>
                                            {/* <Tooltip title={
                                                formValues?.id === item.id
                                                    ? "This music is selected"
                                                    : "Select this music for notification"
                                            }> */}
                                            <Checkbox
                                                checked={formValues?.id === item.id}
                                                onChange={() => handleSelectMusic(item)}
                                            >
                                                <h6 className='line-clamp-1 mt-0.5'>{item?.title}</h6>
                                            </Checkbox>
                                            {/* </Tooltip> */}
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
    )
}

export default MusicList
