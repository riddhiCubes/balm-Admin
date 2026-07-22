import { AdaptiveCard, Container } from '@/components/shared';
import { Button, Card, Checkbox, Form, FormItem, Input, Notification, Select, TimeInput, toast, Upload } from '@/components/ui';
import IconButton from '@/components/ui/IconButton';
import { addmusic, editmusic, getsubcategorylist } from '@/Service/ApiService';
import { USE_DIRECT_UPLOAD } from '@/configs/featureFlags';
import { uploadAll } from '@/Service/uploadService';
import { zodResolver } from '@hookform/resolvers/zod';
import moment from 'moment';
import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form';
import { BiCloudUpload } from 'react-icons/bi';
import { TbCircleXFilled, TbLibraryPhoto } from 'react-icons/tb';
import { useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';

const options = [
    { value: "file", label: 'File' },
    { value: "url", label: 'URL' },
];

type FormSchema = {
    title: string
    description: string;
    with_music_duration: Date | null;
    only_voice_music_duration: Date | null;
    sub_category_id: string | number;
    // color: string;
    music_image: string | File;
    with_music_type: 'file' | 'url';
    only_voice_music_type: 'file' | 'url';
    with_music: string | File;
    only_voice_music: string | File;
    isPremium?: boolean;
};

const getValidationSchema = (selectedSubCategoryMeta: any) => {
    return z.object({
        title: z.string().min(1, { message: 'Title Required' }),
        description: z.string().min(1, { message: 'Description Required' }),
        // color: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, { message: 'Enter a valid hex color' }),
        with_music_duration: selectedSubCategoryMeta?.with_music
            ? z.date({ required_error: 'Time Required!', invalid_type_error: 'Invalid Time' })
            : z.any().optional(),

        only_voice_music_duration: selectedSubCategoryMeta?.only_voice_music
            ? z.date({ required_error: 'Time Required!', invalid_type_error: 'Invalid Time' })
            : z.any().optional(),
        sub_category_id: z.union([
            z.string().min(1, { message: "Subcategory is required" }),
            z.number()
        ]),
        music_image: z.union([
            z.instanceof(File).refine(file => file.size > 0, { message: 'Uploaded file is empty' }),
            z.string().min(1, { message: 'Music image is required' })
        ]),
        with_music_type: z.enum(["file", "url"], {
            required_error: "Music type is required",
        }),
        only_voice_music_type: z.enum(["file", "url"], {
            required_error: "Music type is required",
        }),
        isPremium: z.boolean().optional(),
        with_music: selectedSubCategoryMeta?.with_music
            ? z
                .union([
                    z.instanceof(File).refine((file) => file.size > 0, {
                        message: "Uploaded file is empty",
                    }),
                    z.string().url({ message: "Music is required" }),
                ])
                .refine((val) => val !== null && val !== undefined, {
                    message: "Music file is required",
                })
            : z.any().optional(),
        only_voice_music: selectedSubCategoryMeta?.only_voice_music
            ? z
                .union([
                    z.instanceof(File).refine((file) => file.size > 0, {
                        message: "Uploaded file is empty",
                    }),
                    z.string().url({ message: "Voice & Music is required" }),
                ])
                .refine((val) => val !== null && val !== undefined, {
                    message: "With music file is required",
                })
            : z.any().optional(),
    }).superRefine((data, ctx) => {
        if (selectedSubCategoryMeta?.with_music && !data.with_music_duration) {
            ctx.addIssue({
                path: ["with_music_duration"],
                code: z.ZodIssueCode.custom,
                message: "Music duration is required",
            });
        }
        if (selectedSubCategoryMeta?.only_voice_music && !data.only_voice_music_duration) {
            ctx.addIssue({
                path: ["only_voice_music_duration"],
                code: z.ZodIssueCode.custom,
                message: "With music duration is required",
            });
        }
    });
};

const AddMusic = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const data = location?.state;
    const [pending, setPending] = useState(false);
    const [formValues, setFormValues] = useState<any>({});
    const [imagePreview, setImagePreview] = useState<any>(null);
    const [subCategory, setSubCategory] = useState([]);
    const [selectedSubCategoryMeta, setSelectedSubCategoryMeta] = useState<any>(null);
    const [progressPercent, setProgressPercent] = useState<any>();

    const getSubcategoryList = () => {
        getsubcategorylist()
            .then((res) => {
                const subcategorydata = res?.data?.data;
                const mappedOptions = subcategorydata.map((item: any) => ({
                    label: item.sub_category_name,
                    value: item.id,
                    data: item,
                }));
                setSubCategory(mappedOptions);
            }).catch((err) => {
            })
    };

    useEffect(() => {
        getSubcategoryList();
    }, []);

    useEffect(() => {
        if (data?.sub_category_id && subCategory.length > 0) {
            const matchedOption: any = subCategory.find((option: any) => option.value === data.sub_category_id);
            if (matchedOption) {
                setSelectedSubCategoryMeta(matchedOption.data);
            }
        }
    }, [data, subCategory]);

    const handleCancel = () => {
        // reset();
        navigate("/admin/music");
        setPending(false);
    };

    const handleImg = (e: any) => {
        const files = e;

        if (files && files.length > 0) {
            const file = files[0];

            // const validImageTypes = ["image/jpeg", "image/png", "image/gif"];
            // if (validImageTypes.includes(file.type)) {
            if (file.type.startsWith("image/")) {
                const newImageUrl = URL.createObjectURL(file);
                setImagePreview(newImageUrl);
                setValue("music_image", file);
                trigger("music_image");
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
        setValue("music_image", "");
        setImagePreview(null);
    };

    useEffect(() => {
        setFormValues(data);

        setValue("title", data?.title || '');
        setValue("description", data?.description || '');
        if (data?.with_music_duration) {
            const time = moment(data.with_music_duration, 'HH:mm:ss').toDate();
            setValue("with_music_duration", time);
        } else {
            setValue("with_music_duration", null);
        }
        if (data?.only_voice_music_duration) {
            const time = moment(data.only_voice_music_duration, 'HH:mm:ss').toDate();
            setValue("only_voice_music_duration", time);
        } else {
            setValue("only_voice_music_duration", null);
        }
        setValue("sub_category_id", data?.sub_category_id || '');
        const argbToHex = (argb: string) => {
            return `#${argb?.replace('0xff', '')}`;
        };

        // setValue("color", data?.color ? argbToHex(data.color) : '');
        if (data?.music_image) {
            setValue("music_image", data?.music_image);
            setImagePreview(data.music_image);
        }

        if (data?.with_music) {
            setValue("with_music", data?.with_music);
        }

        if (data?.only_voice_music) {
            setValue("only_voice_music", data?.only_voice_music);
        }
        // setValue("isPremium", data?.isPremium);
        setValue("isPremium", data?.isPremium ?? true);
    }, [data]);

    const validationSchema = getValidationSchema(selectedSubCategoryMeta);

    const {
        handleSubmit,
        reset,
        formState: { errors },
        control,
        setValue,
        trigger,
        watch,
    } = useForm<FormSchema>({
        defaultValues: {
            title: formValues?.title || '',
            description: data?.description || '',
            with_music_duration: formValues?.with_music_duration ? moment(formValues.with_music_duration, 'HH:mm:ss').toDate() : null,
            only_voice_music_duration: formValues?.only_voice_music_duration ? moment(formValues.only_voice_music_duration, 'HH:mm:ss').toDate() : null,
            sub_category_id: formValues?.sub_category_id || '',
            // color: formValues?.color || '',
            music_image: formValues?.music_image || '',
            with_music_type: 'file',
            only_voice_music_type: 'file',
            with_music: formValues?.with_music || '',
            only_voice_music: formValues?.only_voice_music || '',
            // isPremium: data?.isPremium,
            isPremium: true,
        },
        resolver: zodResolver(validationSchema),
    });

    // Direct-to-S3 + transcode flow. Uploads changed media straight to S3, waits
    // for HLS transcoding, then saves the record with the final URLs +
    // `<field>_dataType="processed"`. Unchanged media (existing URL on edit) is
    // omitted so the backend keeps the current value. See docs/vod/*.md §13.
    const onSubmitDirect = async (values: FormSchema) => {
        // 1) Gather only the fields the admin actually picked a NEW File for.
        const fileMap: Record<string, File> = {};
        if (values.music_image instanceof File) {
            fileMap.music_image = values.music_image;
        }
        if (values.with_music_type === 'file' && values.with_music instanceof File) {
            fileMap.with_music = values.with_music;
        }
        if (values.only_voice_music_type === 'file' && values.only_voice_music instanceof File) {
            fileMap.only_voice_music = values.only_voice_music;
        }

        // 2) Upload them all to S3 and wait for transcoding.
        const fields = Object.keys(fileMap);
        let urls: Record<string, string> = {};
        if (fields.length > 0) {
            try {
                urls = await uploadAll(fileMap, undefined, (overall) => {
                    // Byte-accurate upload %. Capped at 99 until the record is
                    // saved (100 = fully done + persisted).
                    setProgressPercent(Math.min(99, overall));
                });
            } catch (err: any) {
                toast.push(
                    <Notification type="danger">
                        {err?.message || "Media upload failed"}
                    </Notification>,
                    { placement: "top-end" }
                );
                setPending(false);
                setProgressPercent(0);
                return;
            }
        }

        // 3) Build the save payload (same FormData shape the backend already reads).
        const formData: any = new FormData();
        if (formValues?.id) {
            formData.append("music_id", formValues?.id);
        }
        formData.append("title", values?.title);
        formData.append("description", values?.description);
        if (values?.with_music_duration) {
            formData.append(
                "with_music_duration",
                moment(values.with_music_duration).format("HH:mm:ss")
            );
        }
        if (values?.only_voice_music_duration) {
            formData.append(
                "only_voice_music_duration",
                moment(values.only_voice_music_duration).format("HH:mm:ss")
            );
        }
        formData.append("sub_category_id", String(values?.sub_category_id ?? ""));
        formData.append("isPremium", values?.isPremium);

        // Image: new upload -> processed URL; unchanged -> omit (keep existing).
        if (urls.music_image) {
            formData.append("music_image", urls.music_image);
            formData.append("music_image_dataType", "processed");
        }

        // Only Voice audio (field name: with_music).
        if (
            values.with_music_type === 'url' &&
            typeof values.with_music === 'string' &&
            values.with_music
        ) {
            // Legacy "paste an s3:// path" flow — unchanged.
            formData.append("with_music_dataType", "url");
            formData.append("with_music_url", values.with_music);
        } else if (urls.with_music) {
            formData.append("with_music", urls.with_music);
            formData.append("with_music_dataType", "processed");
        }
        // else: unchanged existing URL -> omit field + _dataType.

        // With Music audio (field name: only_voice_music).
        if (
            values.only_voice_music_type === 'url' &&
            typeof values.only_voice_music === 'string' &&
            values.only_voice_music
        ) {
            formData.append("only_voice_music_dataType", "url");
            formData.append("only_voice_music_url", values.only_voice_music);
        } else if (urls.only_voice_music) {
            formData.append("only_voice_music", urls.only_voice_music);
            formData.append("only_voice_music_dataType", "processed");
        }

        // 4) Save. Bytes are already on S3, so this call is small — pin progress high.
        setProgressPercent(99);
        const noop = () => {};
        const request = data ? editmusic(formData, noop) : addmusic(formData, noop);
        request
            .then((res: any) => {
                if (res?.status === 200) {
                    setProgressPercent(100);
                    const successmsg = res?.data?.message;
                    toast.push(
                        <Notification type="success">
                            {successmsg || "Music add Sucessfully"}
                        </Notification>,
                        { placement: "top-end" }
                    );
                    navigate("/admin/music");
                }
                setPending(false);
                reset();
            })
            .catch((err: any) => {
                const errormsg = err?.response?.data?.message;
                toast.push(
                    <Notification type="danger">
                        {errormsg ||
                            (data
                                ? "Music not update Sucessfully"
                                : "Music not add Sucessfully")}
                    </Notification>,
                    { placement: "top-end" }
                );
                setPending(false);
                setProgressPercent(0);
            });
    };

    const onSubmit = (values: FormSchema) => {
        setPending(true);
        setProgressPercent(0);

        // NEW: direct-to-S3 upload + background transcoding (VOD). Behind a flag so
        // the legacy multipart-through-API path below is untouched until verified.
        if (USE_DIRECT_UPLOAD) {
            onSubmitDirect(values);
            return;
        }

        const formData: any = new FormData();

        const hexToArgb = (hex: string) => {
            return `0xff${hex.replace('#', '').toUpperCase()}`;
        };

        if (formValues?.id) {
            formData.append("music_id", formValues?.id)
        }
        formData.append("title", values?.title);
        formData.append("description", values?.description);
        if (values?.with_music_duration) {
            formData.append(
                "with_music_duration",
                moment(values.with_music_duration).format("HH:mm:ss")
            );
        }

        if (values?.only_voice_music_duration) {
            formData.append(
                "only_voice_music_duration",
                moment(values.only_voice_music_duration).format("HH:mm:ss")
            );
        }
        formData.append("sub_category_id", String(values?.sub_category_id ?? ""));
        // formData.append("color", hexToArgb(values?.color));

        formData.append("with_music_dataType", values?.with_music_type);
        formData.append("only_voice_music_dataType", values?.only_voice_music_type);

        if (values?.music_image instanceof File) {
            formData.append("music_image", values?.music_image);
        }
        if (values?.with_music_type === 'file') {
            if (values?.with_music instanceof File) {
                formData.append("with_music", values.with_music);
            }
        } else if (values?.with_music_type === 'url') {
            if (typeof values?.with_music === 'string') {
                formData.append("with_music_url", values.with_music);
            }
        }

        if (values?.only_voice_music_type === 'file') {
            if (values?.only_voice_music instanceof File) {
                formData.append("only_voice_music", values.only_voice_music);
            }
        } else if (values?.only_voice_music_type === 'url') {
            if (typeof values?.only_voice_music === 'string') {
                formData.append("only_voice_music_url", values.only_voice_music);
            }
        }
        formData.append("isPremium", values?.isPremium);
        // for (let pair of formData.entries()) {
        //     console.log(pair[0] + ': ' + pair[1]);
        // }

        if (data) {
            editmusic(formData, (progressEvent: any) => {
                let percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                if (percentCompleted >= 100) {
                    percentCompleted = 99; // Cap it at 99 until server responds
                }
                setProgressPercent(percentCompleted);
            })
                .then((res) => {
                    if (res?.status === 200) {
                        setProgressPercent(100);
                        const successmsg = res?.data?.message;
                        toast.push(
                            <Notification type='success'>{successmsg || "Music add Sucessfully"}    </Notification>,
                            { placement: "top-end" }
                        );
                        navigate("/admin/music");
                    }
                    setPending(false);
                    reset();
                }).catch((err) => {
                    const errormsg = err?.response?.data?.message;
                    toast.push(
                        <Notification type='danger'>{errormsg || "Music not update Sucessfully"}    </Notification>,
                        { placement: "top-end" }
                    );
                    setPending(false);
                    setProgressPercent(0);
                })
        } else {
            addmusic(formData, (progressEvent: any) => {
                let percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                if (percentCompleted >= 100) {
                    percentCompleted = 99; // Cap it at 99 until server responds
                }
                setProgressPercent(percentCompleted);
            })
                .then((res) => {
                    if (res?.status === 200) {
                        setProgressPercent(100);
                        const successmsg = res?.data?.message;
                        toast.push(
                            <Notification type='success'>{successmsg || "Music add Sucessfully"}</Notification>,
                            { placement: "top-end" }
                        );
                        navigate("/admin/music");
                    }
                    setPending(false);
                    reset();
                }).catch((err) => {
                    const errormsg = err?.response?.data?.message;
                    toast.push(
                        <Notification type='danger'>{errormsg || "Music not add Sucessfully"}    </Notification>,
                        { placement: "top-end" }
                    );
                    setPending(false);
                    setProgressPercent(0);
                })
        }
    };

    const withmusicUploadType = watch("with_music_type");
    const voicemusicUploadType = watch("only_voice_music_type");

    return (
        <Container>
            <AdaptiveCard>
                <div className='flex items-center gap-3 cursor-pointer' >
                    <IconButton onClick={handleCancel} />
                    <h3>{data ? "Edit" : "Add"} Music</h3>
                </div>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <div className='grid grid-cols-12 gap-5 mt-4'>
                        <Card className='xl:col-span-8 col-span-12 h-fit'>
                            <FormItem
                                label="Title"
                                invalid={Boolean(errors.title)}
                                errorMessage={errors.title?.message}
                            >
                                <Controller
                                    name="title"
                                    control={control}
                                    render={({ field }) =>
                                        <Input
                                            type="text"
                                            autoComplete="off"
                                            placeholder="Enter the title"
                                            {...field}
                                        />
                                    }
                                />
                            </FormItem>
                            <FormItem
                                label="Description"
                                invalid={Boolean(errors.description)}
                                errorMessage={errors.description?.message}
                            >
                                <Controller
                                    name="description"
                                    control={control}
                                    render={({ field }) =>
                                        // <RichTextEditor
                                        //     content={field.value}
                                        //     invalid={Boolean(errors.description)}
                                        //     onChange={({ html }) => {
                                        //         field.onChange(html)
                                        //     }}
                                        // />
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
                            {selectedSubCategoryMeta?.with_music && (
                                <div className='grid grid-cols-12 gap-x-5'>
                                    <FormItem
                                        label="Only Voice Duration"
                                        invalid={Boolean(errors.with_music_duration)}
                                        errorMessage={errors.with_music_duration?.message}
                                        className='sm:col-span-6 col-span-12'
                                    >
                                        <Controller
                                            name="with_music_duration"
                                            control={control}
                                            render={({ field }) =>
                                                <TimeInput
                                                    showSeconds
                                                    value={field.value}
                                                    onChange={(value) => field.onChange(value)}
                                                />
                                            }
                                        />
                                    </FormItem>
                                    <FormItem
                                        label="Select Music Type"
                                        invalid={Boolean(errors.with_music_type)}
                                        errorMessage={errors.with_music_type?.message}
                                        className='sm:col-span-6 col-span-12'
                                    >
                                        <Controller
                                            name="with_music_type"
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    options={options}
                                                    value={options.find(opt => opt.value === field.value)}
                                                    onChange={(selectedOption: any) => {
                                                        field.onChange(selectedOption.value);
                                                    }}
                                                    placeholder="Please select music type"
                                                />
                                            )}
                                        />
                                    </FormItem>
                                    <FormItem
                                        label="Only Voice"
                                        invalid={Boolean(errors.with_music)}
                                        errorMessage={errors.with_music?.message}
                                        className='col-span-12'
                                    >
                                        <Controller
                                            name="with_music"
                                            control={control}
                                            render={({ field }) => {
                                                return withmusicUploadType === 'file' ? (
                                                    <>
                                                        <input
                                                            type="file"
                                                            accept="audio/*"
                                                            id="with_music"
                                                            style={{ display: 'none' }}
                                                            onChange={(e: any) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    field.onChange(file);
                                                                }
                                                            }}
                                                        />
                                                        <div className="relative">
                                                            <Input
                                                                readOnly
                                                                placeholder="Upload an only voice file"
                                                                value={
                                                                    field.value instanceof File
                                                                        ? field.value.name
                                                                        : typeof field.value === 'string' && field.value.startsWith('http')
                                                                            ? field.value.split('/').pop()
                                                                            : ''
                                                                }
                                                                onClick={() =>
                                                                    document.getElementById('with_music')?.click()
                                                                }
                                                                className="cursor-pointer"
                                                            />
                                                            <Button
                                                                type="button"
                                                                className="absolute right-2.5 top-1 bottom-1 my-auto sm:px-3 px-2 py-0 h-9"
                                                                onClick={() =>
                                                                    document.getElementById('with_music')?.click()
                                                                }
                                                                icon={<BiCloudUpload />}
                                                            >
                                                                <span className="hidden sm:inline-block">Upload File</span>
                                                            </Button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <Input
                                                        type="text"
                                                        placeholder="Enter URL for Only Voice"
                                                        value={
                                                            field.value instanceof File
                                                                ? field.value.name
                                                                : typeof field.value === 'string'
                                                                    ? field.value
                                                                    : ''
                                                        }
                                                        onChange={(e) => field.onChange(e.target.value)}
                                                    />
                                                );
                                            }}
                                        />
                                    </FormItem>
                                </div>
                            )}
                            {selectedSubCategoryMeta?.only_voice_music && (
                                <div className='grid grid-cols-12 gap-x-5'>
                                    <FormItem
                                        label="With Music Duration"
                                        invalid={Boolean(errors.only_voice_music_duration)}
                                        errorMessage={errors.only_voice_music_duration?.message}
                                        className='sm:col-span-6 col-span-12'
                                    >
                                        <Controller
                                            name="only_voice_music_duration"
                                            control={control}
                                            render={({ field }) =>
                                                <TimeInput
                                                    showSeconds
                                                    value={field.value}
                                                    onChange={(value) => field.onChange(value)}
                                                />
                                            }
                                        />
                                    </FormItem>
                                    <FormItem
                                        label="Select Music Type"
                                        invalid={Boolean(errors.only_voice_music_type)}
                                        errorMessage={errors.only_voice_music_type?.message}
                                        className='sm:col-span-6 col-span-12'
                                    >
                                        <Controller
                                            name="only_voice_music_type"
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    options={options}
                                                    value={options.find(opt => opt.value === field.value)}
                                                    onChange={(selectedOption: any) => {
                                                        field.onChange(selectedOption.value);
                                                    }}
                                                    placeholder="Please select music type"
                                                />
                                            )}
                                        />
                                    </FormItem>
                                    <FormItem
                                        label="With Music"
                                        invalid={Boolean(errors.only_voice_music)}
                                        errorMessage={errors.only_voice_music?.message}
                                        className='col-span-12'
                                    >
                                        <Controller
                                            name="only_voice_music"
                                            control={control}
                                            render={({ field }) => {
                                                return voicemusicUploadType === 'file' ? (
                                                    <>
                                                        <input
                                                            type="file"
                                                            accept="audio/*"
                                                            id="only_voice_music"
                                                            style={{ display: 'none' }}
                                                            onChange={(e: any) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    field.onChange(file);
                                                                }
                                                            }}
                                                        />
                                                        <div className="relative">
                                                            <Input
                                                                readOnly
                                                                placeholder="Upload an with music file"
                                                                value={
                                                                    field.value instanceof File
                                                                        ? field.value.name
                                                                        : typeof field.value === 'string' && field.value.startsWith('http')
                                                                            ? field.value.split('/').pop()
                                                                            : ''
                                                                }
                                                                onClick={() =>
                                                                    document.getElementById('only_voice_music')?.click()
                                                                }
                                                                className="cursor-pointer"
                                                            />
                                                            <Button
                                                                type="button"
                                                                className="absolute right-2.5 top-1 bottom-1 my-auto sm:px-3 px-2 py-0 h-9"
                                                                onClick={() =>
                                                                    document.getElementById('only_voice_music')?.click()
                                                                }
                                                                icon={<BiCloudUpload />}
                                                            >
                                                                <span className="hidden sm:inline-block">Upload File</span>
                                                            </Button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <Input
                                                        type="text"
                                                        placeholder="Enter URL for With Music"
                                                        value={
                                                            field.value instanceof File
                                                                ? field.value.name
                                                                : typeof field.value === 'string'
                                                                    ? field.value
                                                                    : ''
                                                        }
                                                        onChange={(e) => field.onChange(e.target.value)}
                                                    />
                                                );
                                            }}
                                        />
                                    </FormItem>
                                </div>
                            )}
                        </Card>
                        <Card className='xl:col-span-4 col-span-12 h-fit'>
                            <FormItem
                                label="Music Image"
                                invalid={Boolean(errors.music_image)}
                                errorMessage={errors.music_image?.message}
                            >
                                <Upload
                                    accept="image/*"
                                    draggable
                                    className="min-h-[250px]"
                                    showList={false}
                                    uploadLimit={1}
                                    onChange={handleImg}
                                >
                                    {imagePreview ? (
                                        <div className="flex">
                                            <img
                                                className="max-w-84 w-auto h-[200px] object-cover rounded-md"
                                                src={imagePreview}
                                                alt="image preview"
                                            />
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
                            {/* <FormItem
                                label="Subcategory"
                                invalid={Boolean(errors.sub_category_id)}
                                errorMessage={errors.sub_category_id?.message}
                            >
                                <Controller
                                    name="sub_category_id"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            placeholder="Please Select"
                                            options={colourOptions}
                                            value={colourOptions.find(option => option.value === field.value)}
                                            onChange={(selected) => field.onChange(selected?.value)} />
                                    )}
                                />
                            </FormItem> */}
                            <FormItem
                                label="Select Subcategory"
                                invalid={Boolean(errors.sub_category_id)}
                                errorMessage={errors.sub_category_id?.message}
                            >
                                <Controller
                                    name="sub_category_id"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            options={subCategory}
                                            {...field}
                                            value={subCategory.find((option: any) => option.value === field.value)}
                                            onChange={(selectedOption: any) => {
                                                field.onChange(selectedOption?.value);
                                                setSelectedSubCategoryMeta(selectedOption?.data || null);
                                            }}
                                            placeholder={"Please Select Subcategory"}
                                        />
                                    )}
                                />
                            </FormItem>
                            {/* <FormItem
                                label="Color"
                                invalid={Boolean(errors.color)}
                                errorMessage={errors.color?.message}
                            >
                                <Controller
                                    name="color"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={field.value}
                                                onChange={(e) => field.onChange(e.target.value)}
                                                className="w-12 h-10 border rounded py-0.5 px-1"
                                            />
                                            <Input
                                                type="text"
                                                value={field.value}
                                                onChange={e => field.onChange(e.target.value)}
                                                placeholder="#000000"
                                                className="w-full"
                                            />
                                        </div>
                                    )}
                                />
                            </FormItem> */}
                            <FormItem
                                // label="Premium"
                                invalid={Boolean(errors.isPremium)}
                                errorMessage={errors.isPremium?.message}
                            >
                                <Controller
                                    name="isPremium"
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox
                                            {...field}
                                            checked={!!field.value}
                                            onChange={(checked) => field.onChange(checked)}
                                        >
                                            Music Premium
                                        </Checkbox>
                                    )}
                                />
                            </FormItem>
                        </Card>
                    </div>
                    <div className='flex items-center justify-end w-full mb-0 mt-5'>
                        <Button
                            type="button"
                            disabled={pending}
                            className="ltr:mr-2 w-24"
                            onClick={() => handleCancel()}
                        >
                            Cancel
                        </Button>
                        <Button disabled={pending} loading={pending} variant="solid" type="submit" className={`${pending ? 'w-40' : 'w-24'}`}>
                            {pending
                                ? (USE_DIRECT_UPLOAD ? `${progressPercent}%` : '')
                                : (data ? "Save" : "Submit")}
                        </Button>
                    </div>
                </Form>
            </AdaptiveCard>
        </Container>
    )
}

export default AddMusic
