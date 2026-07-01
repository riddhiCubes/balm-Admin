import { useEffect, useRef, useState } from 'react';
import { AdaptiveCard, ConfirmDialog, Container } from '@/components/shared';
import { TbSearch } from 'react-icons/tb';
import { LuEye, LuPencil, LuTrash2 } from 'react-icons/lu';
import { Button, Card, Checkbox, Dropdown, Input, Notification, Pagination, Skeleton, Switcher, toast } from '@/components/ui';
import { useNavigate } from 'react-router-dom';
import EllipsisButton from '@/components/shared/EllipsisButton';
import { defaultsettheme, deletetheme, edittheme, getthemeData } from '@/Service/ApiService';
import Loading from '@/components/shared/Loading';
import { useDebounce } from 'use-debounce';
import { PiStarFill } from 'react-icons/pi';

const Theme = () => {
  const inputRef = useRef<any>(null);
  const navigate = useNavigate();
  const [search, setSearch] = useState<any>('');
  const [pageNo, setPageNo] = useState<any>(1);
  const [pageCount, setPageCount] = useState<any>();
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [formValues, setFormValues] = useState<any>({});
  const [themesData, setThemesData] = useState<any>([]);
  const [pending, setPending] = useState(false);
  const [loader, setLoader] = useState(false);
  const [value] = useDebounce(search, 1000);
  const [imageLoaders, setImageLoaders] = useState<{ [key: string]: boolean }>({});

  const getThemesList = () => {
    setLoader(true);

    let updatedPage = pageNo;

    if (search && pageNo !== 1) {
      updatedPage = 1;
      setPageNo(1);
      return;
    };

    const obj: any = {
      page: pageNo,
      limit: 12
    };

    if (search) {
      obj.search = search
    };

    getthemeData(obj)
      .then((res) => {
        // console.log(res, "res");
        const data = res?.data?.Thems;
        const total_pages = res?.data?.pagination?.totalPages;
        setThemesData(data);
        setPageCount(total_pages);
        setLoader(false);
      }).catch((err) => {
        // console.log(err, "error");
        setLoader(false);
      })
  };

  useEffect(() => {
    getThemesList();
  }, [pageNo, value]);

  const handleToggle = (item: any, index: any) => {

    // const isoutput1 = item?.byDefault === false ? true : false;
    // const updatedPostView = [...themesData];
    // updatedPostView[index] = { ...updatedPostView[index], byDefault: isoutput1 };
    // setThemesData(updatedPostView);

    const body = {
      theme_id: item?.id,
      // is_announcement: isoutput1,
    }

    defaultsettheme(body)
      .then((res) => {
        if (res?.status === 200) {
          const updatedThemes = themesData.map((theme: any, i: number) => ({
            ...theme,
            byDefault: i === index,
          }));
          setThemesData(updatedThemes);
        }
      }).catch((err) => {
        // console.log(err, "error");
      })
  };

  const onPaginationChange = (page: number) => {
    setPageNo(page);
  };

  const handleEdit = (item: any) => {
    navigate("/admin/addtheme", { state: item })
  };

  const handleView = (item: any) => {
    navigate("/admin/theme_details", { state: item });
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
      theme_id: formValues?.id
    };

    deletetheme(obj)
      .then((res) => {
        const successmsg = res?.data?.message;
        toast.push(
          <Notification type='success'>{successmsg || "Theme Delete successfully!"}</Notification>,
          { placement: "top-end" }
        )
        getThemesList();
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

  const FooterConent = ({ onView, onDelete, onEdit }: { onView: () => void; onDelete: () => void; onEdit: () => void }) => {
    return (
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1 cursor-pointer select-none font-semibold" role="button" onClick={onView}>
          <LuEye size={20} /> <p>View</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-1 cursor-pointer select-none font-semibold " role="button" onClick={onEdit}>
            <LuPencil size={20} /> Edit
          </div>
          <div className="flex items-center gap-1 cursor-pointer select-none font-semibold text-red-500" role="button" onClick={onDelete}>
            <LuTrash2 size={20} /> <p>Delete</p>
          </div>
        </div>
      </div>
    );
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

    themesData?.forEach((item: any, idx: number) => {
      if (item?.image) loaders[`theme-${idx}`] = true;
    });

    setImageLoaders(loaders);
  }, [themesData]);

  const handlePremium = (item: any, index: any) => {

    const isoutput1 = !item?.isPremium;
    // const updatedPostView = [...themesData];
    // updatedPostView[index] = { ...updatedPostView[index], byDefault: isoutput1 };
    // setThemesData(updatedPostView);

    const body = {
      theme_id: item?.id,
      isPremium: isoutput1
    }

    edittheme(body)
      .then((res) => {
        if (res?.status === 201) {
          const updatedPostView = [...themesData];
          updatedPostView[index] = { ...updatedPostView[index], isPremium: isoutput1 };
          setThemesData(updatedPostView);
        }
      }).catch((err) => {
        // console.log(err, "error");
      })
  };

  return (
    <>
      <Container>
        <AdaptiveCard className="h-full">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <h3>Themes</h3>
            <div className='sm:flex items-center gap-3'>
              <div className='sm:mt-0 mt-3'>
                <Input
                  ref={inputRef}
                  value={search}
                  suffix={<TbSearch className="text-lg" />}
                  placeholder="Search by Theme name..."
                  onChange={(e) => {
                    setSearch(e?.target?.value);
                  }}
                  className='sm:w-72 w-full'
                />
              </div>
              <div className='w-fit ml-auto'>
                <Button variant="solid" type="submit" onClick={() => navigate("/admin/addtheme")}>
                  Add Theme
                </Button>
              </div>
            </div>
          </div>

          <div className='h-full'>
            {loader === true ? (
              <div className="h-[70vh]">
                <Loading loading={loader} />
              </div>
            ) : loader === false && themesData?.length <= 0 ? (
              <div className='h-[70vh] flex items-center justify-center'><p className="text-lg p-2 text-center"> No Data Found </p></div>
            ) : (
              <>
                <div className='grid grid-cols-12 gap-5 mt-5'>
                  {themesData?.map((item: any, index: any) => (
                    <Card key={index} className='2xl:col-span-3 xl:col-span-4 md:col-span-6 col-span-12 '
                    // footer={{
                    //   content: <FooterConent
                    //     onDelete={() => handleDelete(item)}
                    //     onEdit={() => handleEdit(item)}
                    //     onView={() => handleView(item)}
                    //   />,
                    // }}
                    >
                      <div className='flex items-center justify-between'>
                        <h6>{item?.name}</h6>
                        <Dropdown
                          placement="bottom-end"
                          renderTitle={<EllipsisButton variant='default' />}
                        >
                          <Dropdown.Item
                            eventKey="deleteBoard"
                          >
                            <Checkbox
                              checked={item?.isPremium}
                              onChange={() => handlePremium(item, index)}
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
                      <div className='mt-3'>
                        <div className='h-[350px] sm:h-[500px]'>
                          {/* <img src={item?.image} alt='...' className='w-full h-full rounded-md object-cover' /> */}

                          <div className="flex items-center gap-2 w-full h-full  relative">
                            {item?.isPremium && !imageLoaders[`theme-${index}`] && (
                              <div className='absolute top-2 right-2 z-20 flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md shadow'>
                                <PiStarFill size={18} className='text-yellow-500' />
                                <p className='font-semibold text-[13px] text-black'>Premium</p>
                              </div>
                            )}

                            {imageLoaders[`theme-${index}`] && (
                              <Skeleton className="w-full h-full rounded absolute top-0 left-0 z-10 " />
                            )}
                            {item?.image ? (
                              <img
                                src={item?.image}
                                alt="theme"
                                className={`object-cover w-full h-full rounded ${imageLoaders[`theme-${index}`] ? 'invisible' : ''} `}
                                onLoad={() => handleImageLoad(`theme-${index}`)}
                                onError={() => handleImageLoad(`theme-${index}`)}
                                ref={(img) => {
                                  if (img && img.complete && imageLoaders[`theme-${index}`]) {
                                    handleImageLoad(`theme-${index}`);
                                  }
                                }}
                              />
                            ) : (
                              <img src={item?.image} className='w-full h-full' />
                            )}
                          </div>
                        </div>
                      </div>
                      {/* <div className='flex items-center justify-between mt-3'> */}
                      <div className=' flex items-center justify-between mt-3'>
                        <p className='text-[15px] '>Default Theme : </p>
                        <Switcher
                          checked={item?.byDefault}
                          onChange={() => handleToggle(item, index)}
                        />
                      </div>
                      {/* </div> */}
                      {/* ))} */}
                    </Card>
                  ))}
                </div>

                {themesData?.length > 0 && (
                  <Pagination
                    className="mt-4 flex items-center justify-end"
                    currentPage={pageNo}
                    total={pageCount}
                    onChange={onPaginationChange}
                  />
                )}
              </>
            )}
          </div>
        </AdaptiveCard>
      </Container>

      <ConfirmDialog
        isOpen={deleteDialog}
        type="danger"
        title="Delete Theme"
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
          Are you sure you want to delete this theme? This action
          can&apos;t be undo.{' '}
        </p>
      </ConfirmDialog>
    </>
  )
}

export default Theme
