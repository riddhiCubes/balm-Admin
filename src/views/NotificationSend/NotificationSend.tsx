import { FormItem, Form } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Radio from '@/components/ui/Radio'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AdaptiveCard, Container } from '@/components/shared'
import { getuserdata, sendannouncement, sendschedulenotification } from '@/Service/ApiService'
import { useEffect, useState } from 'react'
import { OptionProps } from 'react-select'
import { DatePicker, Notification, TimeInput, toast } from '@/components/ui'
import { useLocation, useNavigate } from 'react-router-dom'
import { AiOutlineInfoCircle } from 'react-icons/ai'
import Tabs from '@/components/ui/Tabs/Tabs'
import TabList from '@/components/ui/Tabs/TabList'
import TabNav from '@/components/ui/Tabs/TabNav'
import TabContent from '@/components/ui/Tabs/TabContent'
import moment from 'moment'

type Option = {
    value: string | number
    label?: React.ReactNode
}

type FormSchema = {
    notification_title: string
    notification_body: string
    notification_type: string;
    send_to?: 'all' | 'premium_all' | 'non_premium_all' | 'select'
    select_user?: Option[]
    date?: Date | null;
    time?: Date | null;
}

const CustomOption = (props: OptionProps<any>) => {
    const { data, innerRef, innerProps } = props;

    return (
        <div ref={innerRef} {...innerProps} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100">
            {/* <Avatar size={25} src={data.profile_pic} /> */}
            <span>{data?.label}</span>
        </div>
    );
};

// const validationSchema: ZodType<FormSchema> = z.object({
//     notification_title: z.string().min(1, 'Please enter the title!'),
//     notification_body: z.string().min(1, 'Please enter the body!'),
//     notification_type: z.string().nonempty({ message: "Please select the notification type" }),
//     // send_to: z.enum(['all', 'premium_all', 'non_premium_all', 'select'], {
//     //     required_error: 'Please select one!',
//     // }),
//     send_to: z.enum(['all', 'premium_all', 'non_premium_all', 'select']).optional(),
//     select_user: z.array(z.object({ value: z.union([z.string(), z.number()]) }))
//         // .nonempty('At least one is selected!')
//         .optional(),
//     date: z
//         .union([
//             z.date({ invalid_type_error: "Invalid date" }),
//             z.literal(null),
//         ])
//         .refine((val) => val !== null, { message: "Please select the date" }),
//     time: z
//         .date({ invalid_type_error: "Please enter the start time" })
//         .refine((val) => val !== null, { message: "Please enter the time" }),
// }).superRefine((data, ctx) => {
//     // if (data.send_to === 'select' && (!data.select_user || data.select_user.length === 0)) {
//     //     ctx.addIssue({
//     //         path: ['select_user'],
//     //         code: z.ZodIssueCode.custom,
//     //         message: 'At least one is selected!',
//     //     });
//     // }

//     // if (data.notification_type !== 'music') {
//     if (!data.send_to) {
//         ctx.addIssue({
//             path: ['send_to'],
//             code: z.ZodIssueCode.custom,
//             message: 'Please select one!',
//         });
//     }
//     if (data.send_to === 'select' && (!data.select_user || data.select_user.length === 0)) {
//         ctx.addIssue({
//             path: ['select_user'],
//             code: z.ZodIssueCode.custom,
//             message: 'At least one is selected!',
//         });
//     }
//     // }
// });

const getValidationSchema = (selectedTab: any) => {
    const baseFields = {
        notification_title: z.string().min(1, "Please enter the title!"),
        notification_body: z.string().min(1, "Please enter the body!"),
        notification_type: z
            .string()
            .nonempty("Please select notification type"),
    };

    // ------------------ SCHEDULE NOTIFICATION (TAB 2) ------------------
    if (selectedTab === "tab2") {
        return z
            .object({
                ...baseFields,
                date: z
                    .date()
                    .or(z.null())
                    .refine((v) => v !== null, {
                        message: "Please select the date",
                    }),

                time: z
                    .date({
                        invalid_type_error: "Please enter the time",
                    })
                    .refine((v) => v !== null, {
                        message: "Please enter the time",
                    }),
            })
            .superRefine((data, ctx) => {
                if (data.date && data.time) {
                    const now = moment();

                    // Combine date + time
                    const scheduledDateTime = moment(data.date).set({
                        hour: data.time.getHours(),
                        minute: data.time.getMinutes(),
                        second: data.time.getSeconds(),
                    });

                    if (scheduledDateTime.isBefore(now)) {
                        ctx.addIssue({
                            path: ["time"],
                            code: z.ZodIssueCode.custom,
                            message: "Scheduled time cannot be in the past",
                        });
                    }
                }
            });
    }

    // ------------------ ANNOUNCEMENT (TAB 1) ------------------
    return z
        .object({
            ...baseFields,
            send_to: z.enum(
                ["all", "premium_all", "non_premium_all", "select"],
                { required_error: "Please select one!" }
            ),

            select_user: z
                .array(
                    z.object({
                        value: z.union([z.string(), z.number()]),
                    })
                )
                .optional(),

            date: z.any().optional(),
            time: z.any().optional(),
        })
        .superRefine((data, ctx) => {
            if (
                data.send_to === "select" &&
                (!data.select_user || data.select_user.length === 0)
            ) {
                ctx.addIssue({
                    path: ["select_user"],
                    code: "custom",
                    message: "At least one user must be selected!",
                });
            }
        });
};

const option = [
    { value: "normal", label: "Normal Notification" },
    { value: "rating_review", label: "Rating & Review" },
    { value: "music", label: "Music" },
];

const NotificationSend = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [userData, setUserData] = useState<any>([]);
    const [pending, setPending] = useState(false);
    const [formValues, setFormValues] = useState<any>({});
    const [musicError, setMusicError] = useState('');
    const [selectedTab, setSelectedTab] = useState<any>(location.state?.activeTab || "tab1");

    // useEffect(() => {
    //     const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    //     if (navigation?.type === 'reload') {
    //         navigate(location.pathname, { replace: true, state: {} });
    //     }
    // }, []);

    useEffect(() => {
        const musicData = location.state?.formValues;
        const activeTabFromState = location.state?.activeTab;

        if (musicData) {
            setFormValues(musicData);
            Object.entries(musicData).forEach(([key, value]) => {
                setValue(key as keyof FormSchema, value as any);
            });
        }

        if (activeTabFromState) {
            setSelectedTab(activeTabFromState);
        }
    }, [location.state]);

    const getUserList = () => {
        getuserdata()
            .then((res) => {
                const data = res?.data?.data;
                const formattedData = data?.map((user: any) => ({
                    label: user?.name,
                    value: user?.id,
                })) || []
                setUserData(formattedData);
            }).catch((err) => {

            })
    };

    useEffect(() => {
        getUserList();
    }, []);

    const {
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
        control,
        watch,
        setValue,
        getValues
    } = useForm<FormSchema>({
        defaultValues: {
            notification_title: '',
            notification_body: '',
            notification_type: '',
            send_to: undefined,
            select_user: [],
            date: null,
            time: null,
        },
        resolver: zodResolver(getValidationSchema(selectedTab)),
    })

    const onSubmit = (values: FormSchema) => {
        setPending(true);

        if (values.notification_type === 'music' && !formValues?.id) {
            setMusicError('Please select a music before sending the notification.');
            setPending(false);
            return;
        }

        const { date, time } = values;

        const combined = moment(date)
            .set({
                hour: moment(time).hour(),
                minute: moment(time).minute(),
                second: moment(time).second(),
                millisecond: 0,
            });

        const local_date = combined.format("YYYY-MM-DD");
        const local_time = combined.format("HH:mm");
        const utcISO = combined.clone().utc().toISOString();

        let body: any = {
            title: values?.notification_title,
            body: values?.notification_body,
        };

        if (values.send_to === 'select') {
            body.sending_type = 1;
            const user_ids = values?.select_user?.map(user => user?.value).join(',');
            body.user_ids = user_ids;
        } else if (values.send_to === 'all') {
            body.sending_type = 0;
        } else if (values.send_to === 'premium_all') {
            body.sending_type = 2;
        } else if (values.send_to === 'non_premium_all') {
            body.sending_type = 3;
        }

        if (values.notification_type === 'normal') {
            body.notification_type = 2;
        } else if (values.notification_type === 'rating_review') {
            body.notification_type = 3;
        } else if (values.notification_type === 'music') {
            body.notification_type = 4;
            body.music_id = formValues?.id;
        }

        if (selectedTab === "tab2") {
            body.local_date = local_date;
            body.local_time = local_time;
            body.utc_schedule_time = utcISO;
        }

        if (selectedTab === "tab1") {
            sendannouncement(body)
                .then((res) => {
                    if (res?.status === 200) {
                        const successmsg = res?.data?.message;
                        toast.push(
                            <Notification type='success'>{successmsg || "Send announcement successfully!"}</Notification>,
                            { placement: "top-end" }
                        );
                        reset();
                        setFormValues({});
                        setMusicError('');
                        setPending(false);
                        navigate(location.pathname, { replace: true, state: {} });
                    }
                }).catch((err) => {
                    const errormsg = err?.response?.data?.message;
                    toast.push(
                        <Notification type='danger'>{errormsg || "Not announcement notification!"}</Notification>,
                        { placement: "top-end" }
                    );
                    setPending(false);
                });
        } else {
            sendschedulenotification(body)
                .then((res) => {
                    if (res?.status === 200) {
                        const successmsg = res?.data?.message;
                        toast.push(
                            <Notification type='success'>{successmsg || "Send schedule notification successfully!"}</Notification>,
                            { placement: "top-end" }
                        );
                        reset();
                        setPending(false);
                    }
                }).catch((err) => {
                    const errormsg = err?.response?.data?.message;
                    toast.push(
                        <Notification type='danger'>{errormsg || "Not send schedule notification!"}</Notification>,
                        { placement: "top-end" }
                    )
                    setPending(false);
                })
        }
    };

    const selectedType = watch('notification_type');

    const handleCancel = () => {
        reset();
        setFormValues({});
        setMusicError('');
        setPending(false);
        navigate(location.pathname, { replace: true, state: {} });
    };

    const handleTabChange = (newTab: string) => {
        setSelectedTab(newTab);
        reset();
        setFormValues({});
        setMusicError("");
    };

    const filteredOptions =
        selectedTab === "tab2"
            ? option?.filter(o => ["normal", "music"].includes(o?.value))
            : option;

    return (
        <Container>
            <AdaptiveCard>
                <div className='mb-7'>
                    <h3>Notification</h3>
                    {/* <div className="flex items-start gap-2 mt-2 p-3 bg-green-50 border border-green-200 rounded-md shadow-sm w-fit">
                        <AiOutlineInfoCircle
                            size={20}
                            className="text-green-600 shrink-0 mt-0.5"
                        />
                        <p className="text-sm text-green-700 leading-snug">
                            <strong>Note:</strong> When sending a <strong>Music Notification</strong>, you must first
                            <strong> select a music type</strong> from the Music section. and
                            Music notifications will be delivered <strong>only to Premium all users</strong>.
                        </p>
                    </div> */}

                    <Tabs value={selectedTab} onChange={handleTabChange} variant="pill" className=''>
                        <TabList className='cursor-pointer transition duration-150 outline-hidden bg-white shadow-md flex flex-wrap items-center justify-center w-fit mx-auto p-2 rounded-full mt-3 mb-7'>
                            <TabNav value="tab1">Announcement</TabNav>
                            <TabNav value="tab2">Schedule Notification</TabNav>
                        </TabList>
                        {selectedTab === "tab2" && (
                            <div className="flex items-start gap-2 mt-2 p-3 bg-green-50 border border-green-200 rounded-md shadow-sm w-fit mb-7">
                                <AiOutlineInfoCircle
                                    size={20}
                                    className="text-green-600 shrink-0 mt-0.5"
                                />
                                <p className="text-sm text-green-700 leading-snug">
                                    <strong>Once scheduled,</strong> this notification will be automatically delivered to
                                    <strong> every user </strong>
                                    at the exact date and time you have selected.
                                </p>
                            </div>
                        )}
                        <TabContent value={selectedTab}>
                            <Form onSubmit={handleSubmit(onSubmit)}>
                                <FormItem
                                    asterisk
                                    label="Notification Title"
                                    invalid={Boolean(errors.notification_title)}
                                    errorMessage={errors.notification_title?.message}
                                >
                                    <Controller
                                        name="notification_title"
                                        control={control}
                                        render={({ field }) =>
                                            <Input
                                                type="text"
                                                autoComplete="off"
                                                placeholder="Enter title"
                                                {...field}
                                            />
                                        }
                                    />
                                </FormItem>
                                <FormItem
                                    asterisk
                                    label="Notification Body"
                                    invalid={Boolean(errors.notification_body)}
                                    errorMessage={errors.notification_body?.message}
                                >
                                    <Controller
                                        name="notification_body"
                                        control={control}
                                        render={({ field }) =>
                                            <Input
                                                textArea
                                                type="text"
                                                autoComplete="off"
                                                placeholder="Enter body"
                                                {...field}
                                            />
                                        }
                                    />
                                </FormItem>
                                <FormItem
                                    asterisk
                                    label="Notification Type"
                                    invalid={Boolean(errors.notification_type)}
                                    errorMessage={errors.notification_type?.message}
                                >
                                    <Controller
                                        name="notification_type"
                                        control={control}
                                        render={({ field }) =>
                                            <div>
                                                <Select
                                                    options={filteredOptions}
                                                    {...field}
                                                    value={filteredOptions.find((option: any) => option.value === field.value) || ''}
                                                    onChange={(selectedOption: any) => field.onChange(selectedOption?.value)}
                                                    placeholder={"Please select notification type"}
                                                />
                                            </div>
                                        }
                                    />
                                </FormItem>
                                {selectedType === 'music' && (
                                    <div className="flex flex-col items-center justify-center p-6 border border-dashed border-gray-300 rounded-lg mt-4 text-center">
                                        {formValues?.id ? (
                                            <>
                                                <p className="text-gray-700 mb-3 text-sm">
                                                    You selected Music:
                                                </p>
                                                <div className='flex items-center gap-2 mb-4 shadow-[-1px_3px_9px_-1px_rgba(0,0,0,0.2)] bg-white py-2 px-3 rounded min-w-60'>
                                                    <img
                                                        src={formValues?.music_image}
                                                        alt="music"
                                                        className={`object-cover w-16 h-16 rounded `}
                                                    />
                                                    <p className='font-semibold text-black'>{formValues?.title || 'Music'}</p>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="solid"
                                                    onClick={() => {
                                                        const formValues = getValues();
                                                        const state = location.state || {};

                                                        navigate('/admin/musiclist', {
                                                            state: {
                                                                activeTab: selectedTab,
                                                                formValues,
                                                                search: state.search || '',
                                                                subcategory: state.subcategory || '',
                                                                pageNo: state.pageNo || 1,
                                                            }
                                                        })
                                                    }}
                                                >
                                                    Change Music
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-gray-700 mb-3 text-sm">
                                                    You selected <b>Music</b>. To send music notifications, please go to the Music section.
                                                </p>
                                                <Button
                                                    type="button"
                                                    variant="solid"
                                                    onClick={() => {
                                                        const formValues = getValues();
                                                        navigate('/admin/musiclist', {
                                                            state: {
                                                                formValues,
                                                                activeTab: selectedTab,
                                                            }
                                                        })
                                                    }}
                                                >
                                                    Go to Music
                                                </Button>
                                            </>
                                        )}

                                        {/* Inline error message */}
                                        {musicError && (
                                            <p className="text-red-500 text-sm mt-3">{musicError}</p>
                                        )}
                                    </div>
                                )}
                                {selectedTab === "tab1" && (
                                    <>
                                        <FormItem
                                            asterisk
                                            label="Send To"
                                            invalid={Boolean(errors.send_to)}
                                            errorMessage={errors.send_to?.message}
                                            className='mt-5'
                                        >
                                            <Controller
                                                name="send_to"
                                                control={control}
                                                render={({ field }) =>
                                                    <Radio.Group {...field} className='flex flex-col min-[400px]:flex-row flex-wrap'>
                                                        <Radio
                                                            value="all"
                                                        >All Users</Radio>
                                                        <Radio
                                                            value="premium_all"
                                                        >Premium All Users</Radio>
                                                        <Radio
                                                            value="non_premium_all"
                                                        >Non-Premium All Users</Radio>
                                                        <Radio
                                                            value="select"
                                                        >Select Users</Radio>
                                                    </Radio.Group>
                                                }
                                            />

                                        </FormItem>
                                        {watch('send_to') === 'select' && (
                                            <FormItem
                                                asterisk
                                                label="Select User"
                                                invalid={Boolean(errors.select_user)}
                                                errorMessage={errors.select_user?.message}
                                            >
                                                <Controller
                                                    name="select_user"
                                                    control={control}
                                                    render={({ field }) =>
                                                        <div>
                                                            <Select
                                                                isMulti
                                                                options={userData}
                                                                components={{ Option: CustomOption }}
                                                                {...field}
                                                                value={field.value}
                                                                formatOptionLabel={(data: any) => (
                                                                    <div className="flex items-center gap-2">
                                                                        {/* <Avatar size={20} src={data.profile_pic} /> */}
                                                                        <span>{data.label}</span>
                                                                    </div>
                                                                )}
                                                                onChange={field.onChange}
                                                            />
                                                        </div>
                                                    }
                                                />
                                            </FormItem>
                                        )}
                                    </>
                                )}
                                {selectedTab === "tab2" && (
                                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-5 mt-7'>
                                        <FormItem
                                            asterisk
                                            label="Schedule Date"
                                            invalid={Boolean(errors.date)}
                                            errorMessage={errors.date?.message}
                                        >
                                            <Controller
                                                name="date"
                                                control={control}
                                                render={({ field }) =>
                                                    <div className="focus-within:ring-1 focus-within:ring-blue-500 focus-within:outline-none rounded-xl">
                                                        <DatePicker
                                                            {...field}
                                                            value={field.value}
                                                            onChange={(date) => field.onChange(date)}
                                                            minDate={new Date()}
                                                            inputFormat='DD/MM/YYYY'
                                                            placeholder='Select date'
                                                            className="custom-datepicker"
                                                        />
                                                    </div>
                                                }
                                            />
                                        </FormItem>
                                        {/* <div className="focus-within:ring-1 focus-within:ring-blue-500 focus-within:outline-none rounded-xl">
                                                        <DatePicker
                                                            {...field}
                                                            value={field.value}
                                                            onChange={(date) => field.onChange(date)}
                                                            minDate={new Date()}
                                                            inputFormat="DD/MM/YYYY"
                                                            placeholder="Select date"
                                                        />
                                                    </div> */}
                                        <FormItem
                                            asterisk
                                            label="Schedule Time"
                                            invalid={Boolean(errors.time)}
                                            errorMessage={errors.time?.message}
                                        >
                                            <Controller
                                                name="time"
                                                control={control}
                                                render={({ field }) =>
                                                    <TimeInput
                                                        format="12"
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                    />
                                                }
                                            />
                                        </FormItem>
                                    </div>
                                )}
                                <div className='flex items-center justify-end w-full mb-0 mt-5'>
                                    <Button
                                        type="button"
                                        disabled={pending}
                                        className="ltr:mr-2 w-24"
                                        onClick={() => handleCancel()}
                                    >
                                        Cancel
                                    </Button>
                                    <Button variant="solid" disabled={pending} loading={pending} type="submit" className='w-24'>
                                        Send
                                    </Button>
                                </div>
                            </Form>
                        </TabContent>
                    </Tabs>
                </div>
            </AdaptiveCard>
        </Container>
    )
}

export default NotificationSend

