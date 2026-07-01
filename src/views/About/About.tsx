import { AdaptiveCard, Container } from '@/components/shared'
import { Button, Form, FormItem, Notification, toast } from '@/components/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form';
import { z, ZodType } from 'zod';
import SunEditor from "suneditor-react";
import "suneditor/dist/css/suneditor.min.css";
import { addaboutus, getaboutus } from '@/Service/ApiService';
import Loading from '@/components/shared/Loading';

type FormSchema = {
    about_us: string
};

const validationSchema: ZodType<FormSchema> = z.object({
    about_us: z
        .string()
        .min(1, { message: "About us is required" })
        .refine((value) => {
            const replaced = value.replace(/&nbsp;/gi, ' ');
            const textOnly = replaced.replace(/<[^>]+>/g, '');
            return textOnly.trim().length > 0;
        }, {
            message: "About us is required"
        }),
});


const About = () => {
    const [aboutusData, setAboutusData] = useState<any>('');
    const [pending, setPending] = useState(false);
    const [loader, setLoader] = useState(false);

    const getAboutUs = () => {
        setLoader(true);
        getaboutus()
            .then((res) => {
                const data = res?.data?.data;
                setAboutusData(data);
                if (data?.about_us) {
                    setValue('about_us', data?.about_us);
                }
                setLoader(false);
            }).catch((err) => {
                setLoader(false);
            })

    };

    useEffect(() => {
        getAboutUs();
    }, []);

    const handleImageUploadBefore = (files: File[], info: object, uploadHandler: any) => {
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
            const base64String = e.target?.result;
            if (base64String) {
                uploadHandler({ result: [{ url: base64String }] });
            }
        };
        reader.readAsDataURL(files[0]);

        return false;
    };

    const {
        handleSubmit,
        formState: { errors },
        control,
        setValue,
    } = useForm<FormSchema>({
        defaultValues: {
            about_us: aboutusData?.about_us || '',
        },
        resolver: zodResolver(validationSchema),
    });

    const onSubmit = (values: FormSchema) => {
        setPending(true);

        const body = {
            about_us: values?.about_us,
        };

        addaboutus(body)
            .then((res) => {
                if (res?.status === 200) {
                    const successmsg = res?.data?.message;
                    toast.push(
                        <Notification type='success'>{successmsg || "About us update successfully!"}</Notification>,
                        { placement: "top-end" }
                    )
                }
                setPending(false);
            }).catch((err) => {
                const errormsg = err?.response?.data?.message;
                toast.push(
                    <Notification type='danger'>{errormsg || "About us not update successfully!"}</Notification>
                )
                setPending(false);
            })
    };


    return (
        <Container>
            <AdaptiveCard>
                <div className="">
                    <h3>About Us</h3>
                </div>
                {loader ? (
                    <div className='h-[70vh]'>
                        <Loading loading={loader} />
                    </div>
                ) : (
                    <Form onSubmit={handleSubmit(onSubmit)} className='mt-5'>
                        <FormItem
                            label=""
                            invalid={Boolean(errors.about_us)}
                            errorMessage={errors.about_us?.message}
                        >
                            <Controller
                                name="about_us"
                                control={control}
                                render={({ field }) =>
                                    <SunEditor
                                        setContents={field.value}
                                        onChange={(content) => {
                                            field.onChange(content);
                                            // trigger('about_us');
                                        }}
                                        height="550px"
                                        setOptions={{
                                            buttonList: [
                                                ["undo", "redo"],
                                                ["font", "fontSize"],
                                                ["formatBlock"],
                                                [
                                                    "bold",
                                                    "underline",
                                                    "italic",
                                                    "strike",
                                                ],
                                                ["fontColor", "hiliteColor"],
                                                ["align", "list", "lineHeight"],
                                                ["outdent", "indent"],
                                                ["horizontalRule", "link", "image"],
                                            ],
                                            imageUploadUrl: "/api/upload-image",
                                        }}
                                        onImageUploadBefore={handleImageUploadBefore}
                                        name="about_us"
                                    />
                                }
                            />
                        </FormItem>
                        <FormItem className='flex items-end w-full mb-0'>
                            <Button disabled={pending} loading={pending} variant="solid" type="submit" className={`${pending ? 'w-auto' : 'w-24'} `}>
                                Update
                            </Button>
                        </FormItem>
                    </Form>
                )}
            </AdaptiveCard>
        </Container>
    )
}

export default About
