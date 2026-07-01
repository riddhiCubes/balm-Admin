import { AdaptiveCard, ConfirmDialog, Container } from '@/components/shared'
import EllipsisButton from '@/components/shared/EllipsisButton';
import Loading from '@/components/shared/Loading';
import { Button, Card, Dialog, Dropdown, Form, FormItem, Input, Notification, toast } from '@/components/ui'
import { addpremiumfeatures, deletepremiumfeatures, editpremiumfeatures, getpremiumfeatures } from '@/Service/ApiService';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form';
import { PiCheckCircleFill } from 'react-icons/pi';
import { TbPencil, TbTrash } from 'react-icons/tb';
import { z, ZodType } from 'zod';

type FormSchema = {
    feature: string
};

const validationSchema: ZodType<FormSchema> = z.object({
    feature: z.string().min(1, { message: 'Premium feature is Required' }),
});

const Setting = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [pending, setPending] = useState(false);
    const [title, setTitle] = useState(false);
    const [formValues, setFormValues] = useState<any>({});
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [featuresData, setFeaturesData] = useState<any>([]);
    const [loader, setLoader] = useState(false);

    const getPremiumFeatureData = () => {
        setLoader(true);
        getpremiumfeatures()
            .then((res) => {
                const data = res?.data?.features;
                setFeaturesData(data);
                setLoader(false);
            }).catch((err) => {
                setLoader(false);
            })
    };

    useEffect(() => {
        getPremiumFeatureData();
    }, []);

    const handleAddFeature = () => {
        setIsOpen(true);
        setTitle(true);
    };

    const handleEditFeature = (data: any) => {
        setIsOpen(true);
        setFormValues(data);
        setTitle(false);
        setValue("feature", data?.featuere);
    };

    const handleClose = () => {
        setIsOpen(false);
        reset();
        setPending(false);
    };

    const handleDelete = (data: any) => {
        setDeleteDialog(true);
        setFormValues(data);
    };

    const handleConfirmDelete = () => {
        setPending(true);

        const obj = {
            id: formValues?.id
        };

        deletepremiumfeatures(obj)
            .then((res) => {
                if (res?.status === 200) {
                    const successmsg = res?.data?.message;
                    toast.push(
                        <Notification type='success'>{successmsg || "Feature delete successfully!"}</Notification>,
                        { placement: 'top-end' }
                    )
                    getPremiumFeatureData();
                }
                handleCancel();
            }).catch((err) => {
                const errormsg = err?.response?.data?.message;
                toast.push(
                    <Notification type='danger'>{errormsg || "Feature not delete successfully!"}</Notification>,
                    { placement: 'top-end' }
                )
                setPending(false);
            })
    };

    const handleCancel = () => {
        setDeleteDialog(false);
        setFormValues({});
        setPending(false);
    };

    const {
        handleSubmit,
        reset,
        formState: { errors },
        control,
        setValue
    } = useForm<FormSchema>({
        defaultValues: {
            feature: formValues?.featuere || '',
        },
        resolver: zodResolver(validationSchema),
    });

    const onSubmit = (values: FormSchema) => {
        setPending(true);

        if (title) {
            const body = {
                featuere: values?.feature
            };

            addpremiumfeatures(body)
                .then((res) => {
                    if (res?.status === 200) {
                        const successmsg = res?.data?.message;
                        toast.push(
                            <Notification type='success'>{successmsg || "Feature added successfully!"}</Notification>,
                            { placement: "top-end" }
                        )
                        getPremiumFeatureData();
                    }
                    handleClose();
                }).catch((err) => {
                    console.log(err, "error");
                    const errormsg = err?.response?.data?.message;
                    toast.push(
                        <Notification type='danger'>{errormsg || "Feature not add successfully!"}</Notification>,
                        { placement: "top-end" }
                    )
                    setPending(false);
                })
        } else {
            const body = {
                id: formValues?.id,
                featuere: values?.feature
            };

            editpremiumfeatures(body)
                .then((res) => {
                    if (res?.status === 200) {
                        const successmsg = res?.data?.message;
                        toast.push(
                            <Notification type='success'>{successmsg || "Feature udate successfully!"}</Notification>,
                            { placement: "top-end" }
                        )
                        getPremiumFeatureData();
                    }
                    handleClose();
                }).catch((err) => {
                    const errormsg = err?.response?.data?.message;
                    toast.push(
                        <Notification type='danger'>{errormsg || "Feature not update successfully!"}</Notification>,
                        { placement: "top-end" }
                    )
                    setPending(false);
                })
        }
    };

    return (
        <>
            <Container>
                <AdaptiveCard>
                    <h3>Setting</h3>
                    <div className='grid grid-cols-12 gap-5 mt-5'>
                        <Card className='2xl:col-span-10 col-span-12'>
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                <h4>Premium Features </h4>
                                <div className='sm:flex items-center gap-3'>
                                    <div className='w-fit ml-auto'>
                                        <Button variant="solid" type="submit" onClick={() => handleAddFeature()}>
                                            Add Premium Feature
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <div className='h-full'>
                                {loader === true ? (
                                    <div className="h-[50vh]">
                                        <Loading loading={loader} />
                                    </div>
                                ) : loader === false && featuresData?.length <= 0 ? (
                                    <div className='h-[50vh] flex items-center justify-center'><p className="text-lg p-2 text-center"> No Data Found </p></div>
                                ) : (
                                    <div className='flex flex-col gap-3 mt-5'>
                                        {featuresData?.map((item: any, index: any) => (
                                            <div key={index} className='flex items-center justify-between gap-2'>
                                                <div className='flex items-center gap-1'>
                                                    <PiCheckCircleFill size={20} className='text-primary flex-shrink-0' />
                                                    <p className='sm:text-base text-sm'>{item?.featuere}</p>
                                                </div>
                                                <Dropdown
                                                    placement="bottom-end"
                                                    renderTitle={<EllipsisButton variant='default' />}
                                                >
                                                    <Dropdown.Item
                                                        eventKey="addTicket"
                                                        onClick={() => handleEditFeature(item)}
                                                    >
                                                        <span className="text-lg">
                                                            <TbPencil />
                                                        </span>
                                                        <span>Edit</span>
                                                    </Dropdown.Item>
                                                    <Dropdown.Item
                                                        eventKey="deleteBoard"
                                                        onClick={() => handleDelete(item)}
                                                        className='text-red-500'
                                                    >
                                                        <span className="text-lg">
                                                            <TbTrash />
                                                        </span>
                                                        <span>Delete</span>
                                                    </Dropdown.Item>
                                                </Dropdown>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </AdaptiveCard >
            </Container>

            <Dialog
                isOpen={isOpen}
                onClose={handleClose}
                onRequestClose={handleClose}
                closable={false}
            >
                <h5 className='mb-2'>{title ? "Add" : "Edit"} Premium Feature</h5>
                <div className=''>
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <FormItem
                            label="Premium Feature"
                            invalid={Boolean(errors.feature)}
                            errorMessage={errors.feature?.message}
                        >
                            <Controller
                                name="feature"
                                control={control}
                                render={({ field }) =>
                                    <Input
                                        textArea
                                        type="text"
                                        autoComplete="off"
                                        placeholder="Enter the premium feature"
                                        {...field}
                                    />
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
                title="Delete Premium Feature"
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
                    Are you sure you want to delete this Premium Feature? This action
                    can&apos;t be undo.{' '}
                </p>
            </ConfirmDialog>
        </>
    )
}

export default Setting
